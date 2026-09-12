"""API v1 root router."""

from fastapi import APIRouter
from app.api.v1 import analysis, citizen_reports, dashboard, environments, map, system

api_router = APIRouter()
api_router.include_router(system.router, prefix="/system", tags=["System Operations"])
api_router.include_router(environments.router, prefix="/environments", tags=["Environment Domains"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Operations"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Image Analysis"])
api_router.include_router(citizen_reports.router, prefix="/citizen-reports", tags=["Citizen Reports"])
api_router.include_router(map.router, prefix="/map", tags=["Monitoring Map"])
