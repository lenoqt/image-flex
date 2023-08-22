from typing import Any

import requests
from fastapi import APIRouter, Depends, Form, HTTPException
from services.db_service import DatabaseBuilder, get_database

router = APIRouter()


def send_message(channel_url: str, text: Any):
    payload = {"text": text}
    response = requests.post(channel_url, json=payload)
    return response


@router.post("/slack/command")
async def slack_commands(
    command: str = Form(...),
    text: str = Form(...),
    response_url: str = Form(...),
    db: DatabaseBuilder = Depends(get_database),
):
    if command == "/images":
        images_list = db.get_all_images()
        image_ids = ", ".join([str(image["id"]) for image in images_list])
        send_message(response_url, f"Image IDs: {image_ids}")

    elif command == "/image":
        try:
            image_id = int(text)
            image_data = db.get_image_by_id(image_id)
            if not image_data:
                send_message(response_url, f"Image with ID {image_id} not found!")
                return {}
            send_message(response_url, image_data)
            return {}
        except ValueError:
            raise HTTPException(status_code=404, detail="Invalid image ID")

    else:
        raise HTTPException(status_code=400, detail="Unsupported command")
