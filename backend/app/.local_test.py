from fastapi import Request

@app.get("/headers")
async def read_headers(request: Request):
    # Все заголовки
    print(request.headers)
    # Headers({'host': 'localhost:8000', 'authorization': 'Bearer abc123', ...})
    
    # Конкретный заголовок
    auth = request.headers.get("Authorization")  # "Bearer abc123"
    user_agent = request.headers.get("User-Agent")  # "Mozilla/5.0..."
    
    return {"auth": auth, "user_agent": user_agent}