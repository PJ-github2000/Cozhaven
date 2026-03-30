import json
import redis.asyncio as redis
from config import REDIS_URL
from logger import get_logger

logger = get_logger("cache")

# Global Redis instance
redis_client = None

async def init_redis():
    global redis_client
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        await redis_client.ping()
        logger.info("redis_connected", url=REDIS_URL)
    except Exception as e:
        logger.error("redis_connection_failed", error=str(e))
        redis_client = None

async def get_cache(key: str):
    if not redis_client:
        return None
    try:
        data = await redis_client.get(key)
        return json.loads(data) if data else None
    except Exception as e:
        logger.warning("cache_get_failed", key=key, error=str(e))
        return None

async def set_cache(key: str, value: any, expire: int = 3600):
    if not redis_client:
        return
    try:
        await redis_client.set(key, json.dumps(value), ex=expire)
    except Exception as e:
        logger.warning("cache_set_failed", key=key, error=str(e))

async def delete_cache(key: str):
    if not redis_client:
        return
    try:
        await redis_client.delete(key)
    except Exception as e:
        logger.warning("cache_delete_failed", key=key, error=str(e))

async def cache_incr(key: str, amount: int = 1):
    if not redis_client:
        return None
    try:
        return await redis_client.incrby(key, amount)
    except Exception as e:
        logger.warning("cache_incr_failed", key=key, error=str(e))
        return None

async def cache_expire(key: str, seconds: int):
    if not redis_client:
        return
    try:
        await redis_client.expire(key, seconds)
    except Exception as e:
        logger.warning("cache_expire_failed", key=key, error=str(e))

async def clear_cache_pattern(pattern: str):
    if not redis_client:
        return
    try:
        keys = await redis_client.keys(pattern)
        if keys:
            await redis_client.delete(*keys)
            logger.info("cache_cleared", pattern=pattern, count=len(keys))
    except Exception as e:
        logger.warning("cache_clear_pattern_failed", pattern=pattern, error=str(e))
