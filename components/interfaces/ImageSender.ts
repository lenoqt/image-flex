import * as mqtt from "mqtt";

interface ImageSender {
  connect(): void;
  sendImage(imageData: string | Buffer): void;
  disconnect(): void;
}

export class MqttImageSender implements ImageSender {
  private client: mqtt.MqttClient | null = null;
  private topic: string;

  constructor(topic: string) {
    this.topic = topic;
  }

  connect() {
    const brokerUrl = "wss://test.mosquitto.org:8081";
    this.client = mqtt.connect(brokerUrl);

    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");
    });

    this.client.on("error", (error) => {
      console.error("MQTT Error:", error);
    });
  }

  sendImage(imageData: string | Buffer) {
    console.log(this.client?.connected)
    if (this.client && this.client.connected) {
      this.client.publish(this.topic, imageData);
      console.info(`Message ${imageData} sent to ${this.topic}`);
    } else {
      console.warn("MQTT client not connected");
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      console.log("Disconnected from MQTT broker");
    }
  }
}

export class UploadRequest {
  private readonly storage: ImageSender;

  constructor(storage: ImageSender) {
    this.storage = storage;
  }

  async upload(image: string | Buffer) {
    try {
      this.storage.connect();
      this.storage.sendImage(image);
    } catch (error) {
      console.error("Error while trying to upload image.");
    } finally {
      this.storage.disconnect();
    }
  }
}