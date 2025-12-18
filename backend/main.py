from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import ingest, session

load_dotenv()

app = FastAPI(title="Video Interview Practice API")

app.include_router(session.router)
app.include_router(ingest.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Video Interview Practice API is running"}
