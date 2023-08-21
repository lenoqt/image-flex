import asyncio
import uvicorn
from fastapi import FastAPI
from logging import getLogger
from logging.config import fileConfig as logConfig

from api.images import router as images_router
from services.db_service import DatabaseBuilder
from services.mqtt_service import MQTTService

logConfig("./logging.conf", disable_existing_loggers=False)
logger = getLogger(__name__)

app = FastAPI()

app.include_router(images_router)


async def main():
    database = DatabaseBuilder("postgresql://postgres:example@localhost:5432/postgres")
    database.init_db()
    mqtt_serv = MQTTService(broker_host="public.mqtthq.com", broker_port=1883, topic="image-topic", database=database)
    mqtt_serv.start()
    config = uvicorn.Config("main:app", port=5000, reload=True)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
