import asyncio
from redis_cache import init_redis, clear_cache_pattern

async def main():
    await init_redis()
    await clear_cache_pattern("products_v3_*")
    print("Products cache cleared.")

if __name__ == "__main__":
    asyncio.run(main())
