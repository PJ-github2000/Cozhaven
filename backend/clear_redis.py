import asyncio
import redis.asyncio as redis
import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import REDIS_URL

async def clear_all():
    url = REDIS_URL if REDIS_URL else "redis://localhost:6379"
    print(f"Connecting to Redis at {url}...")
    try:
        client = redis.from_url(url, decode_responses=True)
        await client.ping()
        keys = await client.keys("*")
        if keys:
            print(f"Deleting {len(keys)} keys...")
            await client.delete(*keys)
            print("Done.")
        else:
            print("No keys found in Redis.")
        await client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(clear_all())
