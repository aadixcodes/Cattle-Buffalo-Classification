from fastapi import APIRouter

router = APIRouter()


@router.get("/history")
def history(limit: int = 50):
    """
    Return recent predictions stored in the Supabase `predictions` table.
    Mirrors what the frontend reads via the anon-key client.
    """
    import os
    from supabase import create_client

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        return {"rows": [], "note": "Supabase not configured."}

    sb = create_client(url, key)
    res = (
        sb.table("predictions")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return {"rows": res.data}