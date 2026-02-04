import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Camera.scss";

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const captureFace = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);

    // OPTIONAL: redirect after preview
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="camera-container">
      <h2>Face Capture</h2>

      {!capturedImage && (
        <>
          <video ref={videoRef} autoPlay />
          <div className="buttons">
            <button onClick={startCamera}>Start Camera</button>
            <button onClick={captureFace}>Capture Face</button>
          </div>
        </>
      )}

      {capturedImage && (
        <div className="preview">
          <h3>Captured Face Preview</h3>
          <img src={capturedImage} alt="Captured Face" />
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default Camera;
