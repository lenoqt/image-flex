from dynaconf import settings
from fastapi import APIRouter, Depends, Form, HTTPException
from services.db_service import DatabaseBuilder, get_database
from services.slack_service import SlackService, get_slack_service

slack_channel = settings.SLACK_CHANNEL_ID

router = APIRouter()


@router.post("/slack/command")
async def slack_commands(
    command: str = Form(...),
    text: str = Form(...),
    db: DatabaseBuilder = Depends(get_database),
    slack_service: SlackService = Depends(get_slack_service),
):
    match command:
        case "/image":
            try:
                image_id = int(text)
                image_data = db.get_image_by_id(image_id)
                if not image_data:
                    return {"text": f"Image with ID {image_id} not found"}
                slack_service.upload_image_to_channel(
                    slack_channel, image_data, f"image_{image_id}.png"
                )
                return "Uploading image..."
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid Image ID")
        case _:
            raise HTTPException(status_code=400, detail="Unsupported command")
