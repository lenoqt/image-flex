import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as mqtt from "mqtt";

const CameraCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCaptureImage] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);
  const [mqttConnected, setMqttConnected] = useState(false);

  const mqttBrokerUrl = process.env.MQTT_BROKER_URL ||
    "mqtt://test.mosquitto.org";
  const mqttTopic = process.env.MQTT_TOPIC || "image-topic";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraStarted(true);
      }
    } catch (error) {
      console.error("error accessing camera", error);
    }
  };

  const connectMqtt = () => {
    const client = mqtt.connect(mqttBrokerUrl);
    client.on("connect", () => {
      setMqttClient(client);
      setMqttConnected(true);
    });
    client.on("close", () => {
      setMqttConnected(false);
    });
  };

  useEffect(() => {
    if (!mqttClient) {
      connectMqtt();
    }
  }, [mqttClient]);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context && videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL("image/png");
      setCaptureImage(imageDataUrl);
    }

    if (mqttClient) {
      mqttClient.end();
      setMqttClient(null);
      setMqttConnected(false);
    }
  };

  const saveImage = () => {
    if (capturedImage && mqttClient) {
      mqttClient.publish(mqttTopic, capturedImage);
    }
  };

  return (
    <div>
      <h4>Camera Capture Interface</h4>
      <div>
        {mqttConnected
          ? <div style={{ color: "green" }}>&#128994;</div>
          : <div style={{ color: "red" }}>&#128308;</div>}
        {!cameraStarted && <button onClick={startCamera}>Start Camera</button>}
        {cameraStarted && (
          <>
            <button style={{ marginRight: "110px" }} onClick={captureImage}>
              Capture Image
            </button>
            <button onClick={saveImage} disabled={!capturedImage}>Save</button>
          </>
        )}
      </div>
      <div>
        {capturedImage && (
          <div>
            <Image
              src={capturedImage}
              alt="Captured"
              width={250}
              height={250}
            />
            <a href={capturedImage} download="captured_image.png">
              Download Captured Image
            </a>
          </div>
        )}
      </div>
      <video
        ref={videoRef}
        style={{ display: cameraStarted ? "block" : "none" }}
        autoPlay
        muted
        playsInline
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default CameraCapture;
