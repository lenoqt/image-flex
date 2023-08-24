import React, { useRef, useState } from "react";
import Image from "next/image";
import { MqttImageSender, UploadRequest } from "./interfaces/ImageSender";

const CameraCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCaptureImage] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);

  const mqttBrokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || "wss://example";
  const mqttTopic = process.env.NEXT_PUBLIC_MQTT_TOPIC || "example/topic"; 
  const mqttUsername = process.env.NEXT_PUBLIC_MQTT_USERNAME || "example";
  const mqttPassword = process.env.NEXT_PUBLIC_MQTT_PASSWORD || "password";

  const imageSender = new MqttImageSender(mqttTopic, mqttBrokerUrl, mqttUsername, mqttPassword);
  const uploadRequest = new UploadRequest(imageSender);

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
  };

  const saveImage = () => {
    if (capturedImage !== null) {
      uploadRequest.upload(capturedImage);
    }
  };

  return (
    <div>
      <h1>Camera Capture Interface</h1>
      <>
        <div>
          {!cameraStarted && <button onClick={startCamera}>Start Camera
          </button>}
          {cameraStarted && (
            <>
              <button style={{ marginRight: "110px" }} onClick={captureImage}>
                Capture Image
              </button>
              <button onClick={saveImage} disabled={!capturedImage}>
                Save
              </button>
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
      </>
    </div>
  );
};

export default CameraCapture;
