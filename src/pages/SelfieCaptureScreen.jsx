import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import { storeOfflinePunch } from "../utils/syncAttendance";
const SelfieCaptureScreen = () => {
  const user = JSON.parse(localStorage.getItem("user")); // ✅ fetch from localStorage
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const locationState = useLocation().state || {};
  const { punchType, location, branchId, timestamp } = locationState;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowConfirm(true);
  };
  console.log("🧍 User from storage:", user);

  const handleConfirm = async () => {
    if (isSubmitting) return; // prevent double submission
    setIsSubmitting(true);
  
    try {
      console.log("🚀 Punch Payload:", {
        userId: user._id,
        punchType,
        lat: location?.lat,
        lng: location?.lng,
        branchId,
        timestamp,
      });
  
      if (!user?._id || !location?.lat || !location?.lng || !punchType || !capturedImage) {
        alert("Missing required data. Please try again.");
        return;
      }
  
      const selfieBlob = dataURLtoBlob(capturedImage);
  
      // Offline fallback
      if (!navigator.onLine) {
        storeOfflinePunch({
          selfie: selfieBlob,
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
  
      const payload = {
        userId: user._id,
        punchType,
        lat: location.lat,
        lng: location.lng,
        branchId,
        timestamp,
      };
  
      const formData = new FormData();
      formData.append("selfie", selfieBlob, "selfie.jpg");
      Object.entries(payload).forEach(([key, val]) =>
        formData.append(key, val)
      );
  
      const res = await fetch(`/api/attendance/punch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
  
      if (!res.ok) throw new Error("Punch failed");
  
      alert("✅ Punch recorded successfully!");
      navigate("/dashboard");
  
    } catch (err) {
      alert("❌ Failed to punch. Try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false); // always run this
    }
  };
  
  

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

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
