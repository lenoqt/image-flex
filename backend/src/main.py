import asyncio
from logging import getLogger
from logging.config import fileConfig as logConfig

import uvicorn
from fastapi import FastAPI
from services.mqtt_service import MQTTService
from services.db_service import DatabaseBuilder

logConfig("./logging.conf", disable_existing_loggers=False)
logger = getLogger(__name__)


def hello() -> str:
    logger.info("Hello")
    return "Hello"

app = FastAPI()

@app.get("/")
async def root():
    return hello()

async def main():
    database = DatabaseBuilder("postgresql://postgres:example@localhost:5432/postgres")
    database.init_db()
    mqtt_serv = MQTTService(broker_host="public.mqtthq.com",broker_port= 1883, topic="image-topic", database=database)
    mqtt_serv.start()
    config = uvicorn.Config("main:app", port=5000, reload=True)
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())
