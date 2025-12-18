import json
import random
from pathlib import Path
from typing import List

from ..models.session import Question, Session
from .supabase_client import supabase

DATA_DIR = Path(__file__).parent.parent / "data"
QUESTIONS_FILE = DATA_DIR / "questions.json"


class SessionService:
    def __init__(self):
        self.questions = self._load_questions()

    def _load_questions(self) -> List[Question]:
        if not QUESTIONS_FILE.exists():
            return []
        with open(QUESTIONS_FILE, "r") as f:
            data = json.load(f)
            return [Question(**q) for q in data]

    def create_session(self) -> Session:
        selected_questions = random.sample(self.questions, min(len(self.questions), 4))

        questions_json = [q.model_dump() for q in selected_questions]

        try:
            response = (
                supabase.table("sessions")
                .insert({"questions": questions_json, "status": "active"})
                .execute()
            )

            if not response.data:
                raise Exception("Failed to insert session")

            data = response.data[0]
            session_questions = [Question(**q) for q in data["questions"]]

            return Session(
                id=data["id"],
                questions=session_questions,
                created_at=data["created_at"],
                status=data["status"],
            )

        except Exception as e:
            print(f"Supabase Error (Create Session): {e}")
            raise e

    def get_session(self, session_id: str) -> Session | None:
        try:
            response = (
                supabase.table("sessions")
                .select("*")
                .eq("id", session_id)
                .single()
                .execute()
            )
            data = response.data

            if not data:
                return None

            session_questions = [Question(**q) for q in data["questions"]]
            return Session(
                id=data["id"],
                questions=session_questions,
                created_at=data["created_at"],
                status=data["status"],
            )
        except Exception as e:
            print(f"Supabase Error (Get Session): {e}")
            return None

    def get_all_sessions(self) -> List[Session]:
        try:
            response = (
                supabase.table("sessions")
                .select("*")
                .order("created_at", desc=True)
                .execute()
            )
            data = response.data

            if not data:
                return []

            return [
                Session(
                    id=item["id"],
                    questions=[Question(**q) for q in item["questions"]],
                    created_at=item["created_at"],
                    status=item["status"],
                )
                for item in data
            ]
        except Exception as e:
            print(f"Supabase Error (Get All Sessions): {e}")
            return []

    def get_video_url(self, session_id, question_id):
        try:
            files = supabase.storage.from_("recordings").list(session_id)

            target_file = None
            for f in files:
                if f["name"].startswith(question_id):
                    target_file = f["name"]
                    break

            if not target_file:
                return None

            full_path = f"{session_id}/{target_file}"
            res = supabase.storage.from_("recordings").create_signed_url(
                full_path, 3600
            )

            if isinstance(res, dict) and "signedURL" in res:
                return f"{supabase.supabase_url}/storage/v1{res['signedURL'].split('/storage/v1')[1]}"
            elif isinstance(res, str):
                return res

            return str(res)

        except Exception as e:
            print(f"Error generating video URL: {e}")
            return None


session_service = SessionService()
