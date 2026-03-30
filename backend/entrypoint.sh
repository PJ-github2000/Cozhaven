#!/bin/bash
set -e

# --- LOGGING UTILITY ---
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "--- Entrypoint Service Boot ---"

# Diagnostics: Show what we are working with
if [ -n "$DATABASE_URL" ]; then
    # Mask password for security
    MASKED_URL=$(echo $DATABASE_URL | sed 's/:[^/@]*@/:****@/g')
    log "DATABASE_URL detected: $MASKED_URL"
else
    log "ERROR: DATABASE_URL is not set in the environment!"
    exit 1
fi

log "Starting database readiness check..."

python3 -u << 'END'
import socket
import time
import os
import sys
from urllib.parse import urlparse

def wait_for_db():
    db_url = os.getenv("DATABASE_URL")
    
    try:
        target = urlparse(db_url)
        host = target.hostname
        port = target.port or 5432
        
        if not host:
            print(f"ERROR: Could not parse hostname from URL.")
            sys.exit(1)
            
        print(f"DIAGNOSTIC: Attempting to reach database at {host}:{port}")
        
        # --- THE LOCALHOST TRAP CHECK ---
        # If we are in Docker and the host is 'localhost' or '127.0.0.1', 
        # it will never work unless the DB is in the same container (it isn't).
        if host in ['localhost', '127.0.0.1']:
            print("!!! WARNING !!!")
            print(f"Host is set to '{host}'. In Docker, this refers to the APP container, not the DB.")
            print("If your DB is a separate container, change your URL host to 'db' or the remote IP.")
            print("---------------")

    except Exception as e:
        print(f"ERROR: URL parsing failed: {e}")
        sys.exit(1)

    start_time = time.time()
    retry_count = 0
    
    while True:
        retry_count += 1
        try:
            # Step 1: DNS Check
            ip = socket.gethostbyname(host)
            
            # Step 2: Connection Check
            with socket.create_connection((ip, port), timeout=3):
                print(f"SUCCESS: Connected to database at {host}:{port} ({ip})")
                return
        except socket.gaierror as e:
            print(f"[{retry_count}] DNS FAILURE: Could not resolve '{host}'. {e}")
        except (socket.timeout, ConnectionRefusedError) as e:
            print(f"[{retry_count}] CONN FAILURE: Found '{host}', but port {port} is closed. {e}")
        except Exception as e:
            print(f"[{retry_count}] UNKNOWN ERROR: {type(e).__name__}: {e}")

        if time.time() - start_time > 120:
            print("FATAL: Database connection timed out after 120 seconds.")
            sys.exit(1)
            
        time.sleep(3)

if __name__ == "__main__":
    wait_for_db()
END

log "Database is reachable. Validating migrations..."
python3 -m alembic upgrade head

log "Synchronizing data and creating admin..."
python3 -u seed_all.py

log "Starting Production Server (Gunicorn)..."
exec gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
