import * as mqtt from "mqtt";

interface ImageSender {
  connect(): Promise<void>;
  sendImage(imageData: string | Buffer): void;
  disconnect(): void;
}

export class MqttImageSender implements ImageSender {
  private client: mqtt.MqttClient | null = null;
  private topic: string;
  private brokerUrl: string;
  private username: string;
  private password: string;

  constructor(
    topic: string,
    brokerUrl: string,
    username: string,
    password: string,
  ) {
    this.topic = topic;
    this.brokerUrl = brokerUrl;
    this.username = username;
    this.password = password;
  }

  connect() {
    const clientId = "image-flex-" + Math.random().toString(16).substring(2, 8);
    this.client = mqtt.connect(this.brokerUrl, {
      clientId: clientId,
      username: this.username,
      password: this.password,
    });

    return new Promise<void>((resolve, reject) => {
      this.client!.on("connect", () => {
        console.log("Connected to MQTT broker");
        resolve();
      });

      this.client!.on("error", (error) => {
        console.error("MQTT Error:", error);
        reject(error);
      });
    });
  }

  sendImage(imageData: string | Buffer) {
    if (this.client && this.client.connected) {
      this.client.subscribe(this.topic, { qos: 0 }, (error) => {
        if (error) {
          console.log("Subscribe error:", error);
          return;
        }
        console.log(`Subscribed to topic ${this.topic}`);
      });
      this.client.publish(this.topic, imageData, { qos: 0 }, (error) => {
        if (error) {
          console.error(error);
        }
      });
      console.log("SENT");
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
      await this.storage.connect();
      this.storage.sendImage(image);
    } catch (error) {
      console.error("Error while trying to upload image.");
    } finally {
      this.storage.disconnect();
    }
  }
}
