from .supabase_client import supabase

BUCKET_NAME = "recordings"


class IngestService:
    async def upload_recording(self, session_id, question_id, file):
        content_type = file.content_type or "video/webm"
        ext = "mp4" if "mp4" in content_type else "webm"

        file_path = f"{session_id}/{question_id}.{ext}"
        file_content = await file.read()

        try:
            supabase.storage.from_(BUCKET_NAME).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": content_type, "upsert": "true"},
            )

            return file_path

        except Exception as e:
            print(f"Supabase Storage Error: {e}")
            import traceback

            traceback.print_exc()
            raise e


ingest_service = IngestService()
