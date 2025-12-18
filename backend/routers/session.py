from fastapi import APIRouter, HTTPException

from ..models.session import Session
from ..services.analysis_service import analysis_service
from ..services.session_service import session_service

router = APIRouter(prefix="/session", tags=["session"])


@router.post("/", response_model=Session)
async def start_session():
    session = session_service.create_session()
    return session


@router.get("/history/all", response_model=list[Session])
async def get_history():
    return session_service.get_all_sessions()


@router.get("/{session_id}", response_model=Session)
async def get_session(session_id: str):
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/{session_id}/question/{question_id}/video")
async def get_video_url(session_id: str, question_id: str):
    url = session_service.get_video_url(session_id, question_id)
    if not url:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"url": url}


@router.post("/{session_id}/analyze")
async def analyze_session(session_id: str):
    try:
        results = await analysis_service.analyze_session(session_id)
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{session_id}/analysis")
async def get_analysis(session_id: str):
    data = await analysis_service.get_analysis(session_id)
    if not data:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return data
