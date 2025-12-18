from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..services.ingest_service import ingest_service

router = APIRouter(prefix="/ingest", tags=["ingest"])


@router.post("/upload")
async def upload_recording(
    session_id: str = Form(...),
    question_id: str = Form(...),
    file: UploadFile = File(...),
):
    try:
        path = await ingest_service.upload_recording(session_id, question_id, file)
        return {"path": path, "status": "uploaded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
