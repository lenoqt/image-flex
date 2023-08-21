from fastapi import APIRouter, HTTPException
from services.db_service import DatabaseBuilder
from dynaconf import settings

database = DatabaseBuilder(settings.DATABASE_URL)
router = APIRouter()

@router.get("images/{image_id}")
async def get_image(image_id: int):
    image_data = database.get_image_by_id(image_id)
    if not image_data:
        raise HTTPException(status_code=404, detail="Image not found")

    return {"image_data": image_data}
