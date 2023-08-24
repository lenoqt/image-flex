import random
from logging import getLogger

import paho.mqtt.client as mqtt
from attrs import define, field

from services.db_service import DatabaseBuilder

logger = getLogger(__name__)


@define
class MQTTService:
    client: mqtt.Client = field(init=False)
    broker_host: str
    broker_port: int
    topic: str
    username: str
    password: str
    database: DatabaseBuilder

    def __attrs_post_init__(self):
        client_id = f"fast-api-mqtt-{random.randint(0, 1000)}"
        self.client = mqtt.Client(client_id=client_id, protocol=mqtt.MQTTv5)
        self.client.tls_set("./certs/emqxsl-ca.crt")
        self.client.username_pw_set(self.username, self.password)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

        self.client.connect_async(self.broker_host, self.broker_port, keepalive=120)

    def on_connect(self, client, userdata, flags, rc, properties=None):
        if rc == 0 and client.is_connected():
            client.subscribe(topic=self.topic, qos=0)
            logger.info(f"Subscribed to {self.topic}")
        else:
            logger.error(f"Failed to subscribe: {rc}")

    def on_message(self, client, userdata, msg):
        logger.info(f"Received image from {client} - {userdata}")
        self.image_save(msg.payload)

    def image_save(self, image_data):
        self.database.insert_image(image_data)

    def start(self):
        self.client.loop_start()
