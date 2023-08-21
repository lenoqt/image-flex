from logging import getLogger
from logging.config import fileConfig as logConfig

import paho.mqtt.client as mqtt
from attrs import define, field

from services.db_service import DatabaseBuilder

logConfig("./logging.conf", disable_existing_loggers=False)
logger = getLogger(__name__)

@define
class MQTTService:
    client: mqtt.Client = field(init=False)
    broker_host: str
    broker_port: int
    topic: str
    database: DatabaseBuilder

    def __attrs_post_init__(self):
        self.client = mqtt.Client()
        self.client.enable_logger(logger)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

        self.client.connect(self.broker_host, self.broker_port, 60)

    def on_connect(self, client, userdata, flags, rc):
        self.client.log_callback()
        self.client.subscribe(self.topic)

    def on_message(self, client, userdata, msg):
        self.image_save(msg.payload)


    def image_save(self, image_data):
        self.database.insert_image(image_data)

    def start(self):
        self.client.loop_start()
