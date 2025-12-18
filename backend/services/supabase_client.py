import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY", os.environ.get("SUPABASE_KEY", "")
)

if not url or not key:
    print(
        "Warning: SUPABASE_URL or SUPABASE_KEY/SUPABASE_SERVICE_ROLE_KEY not valid. Database features will fail."
    )

supabase: Client = create_client(url, key)
