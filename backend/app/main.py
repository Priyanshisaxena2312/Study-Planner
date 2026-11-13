from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth, curriculum, timetable, goals, focus, revisions, analytics, seed
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables are created
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="REST API backend for Smart Study Planner (FastAPI, SQLite/PostgreSQL, JWT, Pydantic)",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(curriculum.router, prefix=settings.API_V1_STR)
app.include_router(timetable.router, prefix=settings.API_V1_STR)
app.include_router(goals.router, prefix=settings.API_V1_STR)
app.include_router(focus.router, prefix=settings.API_V1_STR)
app.include_router(revisions.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(seed.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

