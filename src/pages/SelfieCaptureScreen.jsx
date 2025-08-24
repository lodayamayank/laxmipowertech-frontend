// src/screens/SelfieCaptureScreen.jsx
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import { storeOfflinePunch } from "../utils/syncAttendance";
import api from "../utils/axios"; // ✅ axios instance -> baseURL should be your Render API

const SelfieCaptureScreen = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const webcamRef = useRef(null);

  const [capturedImage, setCapturedImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const locationState = useLocation().state || {};
  const { punchType, location, branchId, timestamp } = locationState;

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setCapturedImage(imageSrc);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!user?._id || !location?.lat || !location?.lng || !punchType || !capturedImage) {
        alert("Missing required data. Please try again.");
        return;
      }

      const selfieFile = dataURLtoFile(capturedImage, "selfie.jpg");

      // Offline fallback
      if (!navigator.onLine) {
        storeOfflinePunch({
          selfie: selfieFile,          // File is fine (File extends Blob)
          punchType,
          lat: location.lat,
          lng: location.lng,
          branchId,
          timestamp,
        });
        alert("📴 You’re offline. Punch saved and will sync when internet is back.");
        navigate("/dashboard");
        return;
      }

      // Build multipart form data
      const formData = new FormData();
      formData.append("selfie", selfieFile);
      formData.append("punchType", punchType);
      formData.append("lat", String(location.lat));
      formData.append("lng", String(location.lng));
      if (branchId) formData.append("branchId", branchId);
      if (timestamp) formData.append("timestamp", String(timestamp));
      // Do NOT append userId unless your backend explicitly requires it; JWT usually provides it.

      const res = await api.post("/attendance/punch", formData);
      if (!res || res.status < 200 || res.status >= 300) {
        throw new Error("Punch failed");
      }

      alert("✅ Punch recorded successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Punch error:",
        err.response?.status,
        err.response?.data || err.message
      );
      alert(`❌ Failed to punch. ${err.response?.data?.message || "Please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  function dataURLtoFile(dataURL, filename) {
    const [header, data] = dataURL.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    const binary = atob(data);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return new File([u8], filename, { type: mime });
  }

  return (
    <div className="min-h-screen bg-white p-4 max-w-md mx-auto relative">
      <button
        className="absolute top-4 left-4 text-white text-sm bg-orange-500 px-2 py-1 rounded"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
        Selfie Attendance
      </h2>

      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        className="rounded-full w-64 h-64 mx-auto border-4 border-orange-500 shadow-lg"
        videoConstraints={{ facingMode: "user" }}
      />

      <button
        onClick={capture}
        disabled={isSubmitting}
        className="mt-6 block w-full bg-orange-500 text-white py-3 rounded font-bold shadow"
      >
        📸 Capture
      </button>

      {showConfirm && (
        <ConfirmModal
          image={capturedImage}
          user={user}
          punchType={punchType}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

export default SelfieCaptureScreen;
