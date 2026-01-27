import asyncio
import httpx
import time


async def fetch_url(url, client):
    try:
        start = time.perf_counter()
        response = await client.get(url)
        response.raise_for_status()
        stop = time.perf_counter()
        print(f'Запрос с ожиданием {url[-1]} выполнен! статус: {response.status_code}, время исполнения: {stop - start:0.3f}')
    except httpx.HTTPError as e:
        print(f"Ошибка запроса к {url}: {e}")

async def line_exec():
    print("Последовательный вызов\n")
    async with httpx.AsyncClient() as client:
        start = time.perf_counter()
        await fetch_url('https://httpbin.org/delay/1', client)
        await fetch_url('https://httpbin.org/delay/2', client)
        await fetch_url('https://httpbin.org/delay/3', client)
        await fetch_url('https://httpbin.org/status/404', client)

        stop = time.perf_counter()
        
        print(f'\nline_exec завершен. Время выполнения: {stop - start:0.4f} секунд')


async def parallel():
    print("Паралельный вызов вызов\n")
    async with httpx.AsyncClient() as client:
        start = time.perf_counter()
        result1 = asyncio.create_task(fetch_url('https://httpbin.org/delay/1', client))
        result2 = asyncio.create_task(fetch_url('https://httpbin.org/delay/2', client))
        result3 = asyncio.create_task(fetch_url('https://httpbin.org/delay/3', client))
        result4 = asyncio.create_task(fetch_url('https://httpbin.org/status/404', client))

        await result1
        await result2
        await result3
        await result4

        stop = time.perf_counter()
        
        print(f'\nparallel завершен. Время выполнения: {stop - start:0.4f} секунд\n\n')


async def parallel_with_gather():
    print("Паралельный вызов вызов\n")
    async with httpx.AsyncClient() as client:
        start = time.perf_counter()

        await asyncio.gather(
            fetch_url('https://httpbin.org/delay/1', client),
            fetch_url('https://httpbin.org/delay/2', client),
            fetch_url('https://httpbin.org/delay/3', client),
            fetch_url('https://httpbin.org/status/404', client)
        )

        stop = time.perf_counter()
        
        print(f'\nparallel_with_gather завершен. Время выполнения: {stop - start:0.4f} секунд\n\n')

if __name__ == '__main__':
    async def main():
        await line_exec()
        await parallel()
        await parallel_with_gather()
        # await asyncio.gather(
        #     parallel(),
        #     parallel_with_gather(),
        #     line_exec()
        # )

    asyncio.run(main())