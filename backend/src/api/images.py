from fastapi import APIRouter, HTTPException, Depends
from services.db_service import DatabaseBuilder, get_database
from logging import getLogger

router = APIRouter()

logger = getLogger(__name__)


@router.get("/images/{image_id}")
async def get_image(image_id: int, db: DatabaseBuilder = Depends(get_database)):
    logger.info(f"Fetching image {image_id} from DB")
    image_data = db.get_image_by_id(image_id)
    if not image_data:
        raise HTTPException(status_code=404, detail="Image not found")

    return {"image_data": image_data}
