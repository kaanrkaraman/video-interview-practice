import asyncio

from supabase_client import supabase


async def setup_bucket():
    bucket_name = "recordings"

    print(f"Checking for bucket: {bucket_name}...")
    try:
        buckets = supabase.storage.list_buckets()
        exists = any(b.name == bucket_name for b in buckets)

        if exists:
            print(
                f"Bucket '{bucket_name}' exists. Attempting to delete (to recreate)..."
            )
            try:
                files = supabase.storage.from_(bucket_name).list()
                if files:
                    print(f"Bucket has {len(files)} files. Deleting them...")
                    file_paths = [f["name"] for f in files]
                    supabase.storage.from_(bucket_name).remove(file_paths)

                supabase.storage.delete_bucket(bucket_name)
                print("Bucket deleted.")
            except Exception as e:
                print(f"Failed to delete bucket: {e}")
                return

        print(f"Creating bucket '{bucket_name}'...")
        supabase.storage.create_bucket(
            bucket_name,
            options={
                "public": False,
                "allowed_mime_types": ["video/webm", "video/mp4"],
                "file_size_limit": 52428800,
            },
        )
        print(f"Bucket '{bucket_name}' created successfully!")

    except Exception as e:
        print("----------------------------------------------------------------")
        print("FAILED TO CONFIGURE S3/SUPABASE STORAGE")
        print(f"Error: {e}")
        print("----------------------------------------------------------------")
        print("Most likely cause: MISSING SERVICE ROLE KEY.")
        print(
            "Your current SUPABASE_KEY (Anon) does not have permission to create buckets."
        )
        print("Please add SUPABASE_SERVICE_ROLE_KEY to your .env file.")


if __name__ == "__main__":
    asyncio.run(setup_bucket())
