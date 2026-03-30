import logging
import sys
import structlog
from typing import Any, Dict

def configure_logger(debug: bool = False):
    """
    Configures structlog for JSON output in production and pretty print in dev.
    """
    
    # Standard Python logging config
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.DEBUG if debug else logging.INFO,
    )

    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
    ]

    if debug:
        # Pretty printing for development
        processors.append(structlog.dev.ConsoleRenderer())
    else:
        # JSON logs for production (Datadog/ELK friendly)
        processors.append(structlog.processors.JSONRenderer())

    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

def get_logger(name: str):
    return structlog.get_logger(name)

# Helper to log request details
async def log_request_middleware(request, call_next):
    import uuid
    import time
    
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=request_id)
    
    logger = get_logger("api")
    start_time = time.time()
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Safely get status code
        status = getattr(response, "status_code", 500)
        
        logger.info(
            "request_completed",
            method=request.method,
            path=request.url.path,
            status_code=status,
            duration=f"{process_time:.4f}s"
        )
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            "request_failed",
            method=request.method,
            path=request.url.path,
            error=str(e),
            duration=f"{process_time:.4f}s"
        )
        raise e
