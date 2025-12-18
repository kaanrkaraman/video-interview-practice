import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class Question(BaseModel):
    id: str
    text: str
    category: str


class Session(BaseModel):
    id: str
    questions: List[Question]
    created_at: datetime
    status: str = "active"


class CreateSessionResponse(BaseModel):
    session_id: str
    questions: List[Question]
