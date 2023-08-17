import React, { useRef, useState } from "react";
import Image from "next/image";

const CameraCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCaptureImage] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);

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

  return (
    <div>
      <h1>Camera Capture Interface</h1>
      <div>
        {!cameraStarted && <button onClick={startCamera}>Start Camera</button>}
        {cameraStarted && (
          <>
            <button onClick={captureImage}>Capture Image</button>
            <p>Click Capture Image when ready</p>
          </>
        )}
      </div>
      <div>
        {capturedImage && (
          <div>
            <Image
              src={capturedImage}
              alt="Captured"
              width={100}
              height={100}
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
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default CameraCapture;
