import json
import os
import tempfile

from openai import OpenAI

from .session_service import session_service
from .supabase_client import supabase

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


class AnalysisService:
    async def analyze_session(self, session_id: str):
        print(f"Starting analysis for session: {session_id}")
        session = session_service.get_session(session_id)
        if not session:
            raise Exception("Session not found")

        results = []

        for question in session.questions:
            print(f"Analyzing question: {question.id}...")

            try:
                files = supabase.storage.from_("recordings").list(session_id)
                target_file = None
                for f in files:
                    if f["name"].startswith(question.id):
                        target_file = f["name"]
                        break

                if not target_file:
                    print(f"No recording found for question {question.id}")
                    continue

                path = f"{session_id}/{target_file}"
                print(f"Downloading {path}...")
                file_data = supabase.storage.from_("recordings").download(path)

                with tempfile.NamedTemporaryFile(
                    suffix=".webm", delete=True
                ) as temp_video:
                    temp_video.write(file_data)
                    temp_video.flush()

                    print("Transcribing...")
                    with open(temp_video.name, "rb") as audio_file:
                        transcript_response = client.audio.transcriptions.create(
                            model="whisper-1", file=audio_file
                        )
                    transcript_text = transcript_response.text
                    print(f"Transcript: {transcript_text[:50]}...")

                print("Analyzing with GPT-4...")
                system_prompt = """
                You are a Senior Technical Recruiter and Hiring Manager with 15+ years of experience.
                Your goal is to provide critical, constructive, and detailed feedback on the candidate's video interview answer.

                Analyze the answer based on the STAR method (Situation, Task, Action, Result).
                - **Situation/Task**: Did they clearly define the context and problem?
                - **Action**: Did they explain *their* specific contribution/actions? (Look for "I" vs "We")
                - **Result**: Did they provide a tangible outcome or metric?

                Provide feedback in JSON format with the following keys:
                - clarity_score (1-100): How clear and structured was the speech?
                - pace_score (1-100): Was the speaking rate appropriate (not too fast/slow)?
                - confidence_score (1-100): Did they sound authoritative and prepared?
                - content_score (1-100): Did the answer directly address the question with depth?
                - feedback_text (string): A detailed paragraph evaluating the answer. Explicitly mention how well they used the STAR method.
                - improvements (list of strings): Specific, actionable advice (e.g., "Quantify the result," "Spend less time on the background," "Use more 'I' statements").
                - key_takeaways (list of strings): What they did well (e.g., "Strong opening," "Good technical depth").

                Be strict but encouraging.
                """

                user_prompt = (
                    f"Question: {question.text}\nAnswer Transcript: {transcript_text}"
                )

                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format={"type": "json_object"},
                )

                analysis_json = json.loads(response.choices[0].message.content)

                results.append(
                    {
                        "question_id": question.id,
                        "question_text": question.text,
                        "transcript": transcript_text,
                        "analysis": analysis_json,
                    }
                )

            except Exception as e:
                print(f"Error analyzing question {question.id}: {e}")
                continue

        try:
            print("Saving analysis results...")
            analysis_path = f"{session_id}/analysis.json"
            supabase.storage.from_("recordings").upload(
                path=analysis_path,
                file=json.dumps(results).encode("utf-8"),
                file_options={"content-type": "application/json", "upsert": "true"},
            )
            print("Analysis saved.")
            return results
        except Exception as e:
            print(f"Error saving analysis: {e}")
            return results

    async def get_analysis(self, session_id: str):
        try:
            path = f"{session_id}/analysis.json"
            data = supabase.storage.from_("recordings").download(path)
            return json.loads(data)
        except Exception as e:
            print(f"Analysis not found: {e}")
            return None


analysis_service = AnalysisService()
