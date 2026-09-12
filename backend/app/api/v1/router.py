"""API v1 root router."""

from fastapi import APIRouter
from app.api.v1 import system, environments, dashboard

api_router = APIRouter()
api_router.include_router(system.router, prefix="/system", tags=["System Operations"])
api_router.include_router(environments.router, prefix="/environments", tags=["Environment Domains"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Operations"])
