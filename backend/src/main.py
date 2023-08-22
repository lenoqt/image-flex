import asyncio
from logging import getLogger

import uvicorn
import os
from api.images import router as images_router
from dynaconf import settings
from fastapi import FastAPI
from services.mqtt_service import MQTTService
from services.db_service import DatabaseBuilder

logger = getLogger(__name__)

app = FastAPI()

app.include_router(images_router)


async def main():
    database = DatabaseBuilder(settings.DATABASE_URL)
    database.init_db()

    mqtt_serv = MQTTService(
        broker_host=settings.MQTT_BROKER_HOST,
        broker_port=settings.MQTT_BROKER_PORT,
        topic=settings.MQTT_TOPIC,
        database=database,
    )
    mqtt_serv.start()

    port = int(os.getenv("PORT", 3000))
    config = uvicorn.Config("main:app", host="0.0.0.0", port=port)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
