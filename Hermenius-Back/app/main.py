from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api import endpoints

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Бэкенд для анализа данных с ИИ",
    version="1.0.0"
)

app.include_router(endpoints.router, prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "ok"}

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Hermenius-Front"))
if os.path.isdir(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")