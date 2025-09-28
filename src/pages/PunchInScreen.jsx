import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { syncOfflineAttendance } from "../utils/syncAttendance";
import useNotifier from "../hooks/useNotifier";
import { GoogleMap, MarkerF, CircleF, useJsApiLoader } from "@react-google-maps/api";
import { formatIST } from "../utils/date";

// --- utils (unchanged) ---
const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MAP_STYLE = { height: "300px", width: "100%" };
const DEFAULT_ZOOM = 17;

const PunchInScreen = () => {
  const notifier = useNotifier(); // ✅ move hook inside component

  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null); // {lat,lng}
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [punchStatus, setPunchStatus] = useState({
    punchedIn: false,
    punchedOut: false,
  });

  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    // libraries: ["places"], // add when you wire autocomplete
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const recenter = useCallback((lat, lng) => {
    if (mapRef.current && lat && lng) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(DEFAULT_ZOOM);
    }
  }, []);

  const getLocation = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLoadingLocation(false);
        recenter(loc.lat, loc.lng);
      },
      () => {
        notifier.error("Failed to fetch location");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(res.data.user);
    } catch (err) {
      notifier.error("Failed to load user. Please log in again.");
      console.error(err);
    }
  };

  const fetchPunchStatus = async () => {
    try {
      const res = await axios.get("/attendance/today", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPunchStatus({
        punchedIn: res.data.punchedIn,
        punchedOut: res.data.punchedOut,
      });
    } catch (err) {
      console.error("Failed to fetch punch status", err);
    }
  };

  const queuePunchOffline = (data) => {
    const existing = JSON.parse(localStorage.getItem("offlinePunchQueue") || "[]");
    existing.push({ ...data, queuedAt: new Date().toISOString() });
    localStorage.setItem("offlinePunchQueue", JSON.stringify(existing));
    notifier.info("Offline – Punch queued locally and will sync when online.");
  };

  const handlePunchClick = async (type) => {
    if (!location || !user?.assignedBranches?.length) {
      notifier.error("Missing location or branch assignment.");
      return;
    }
    const { lat, lng } = location;

    const nearbyBranch = user.assignedBranches.find((branch) => {
      const d = getDistanceMeters(lat, lng, branch.lat, branch.lng);
      console.log(`🏢 Branch: ${branch.name}, Dist: ${d}m, Radius: ${branch.radius}m`);
      return d <= branch.radius;
    });

    if (!nearbyBranch) {
      notifier.error("You are not within any of your assigned branch locations.");
      return;
    }

    const punchPayload = {
      punchType: type,
      location: { lat, lng },
      branchId: nearbyBranch._id,
      timestamp: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      queuePunchOffline(punchPayload);
      return;
    }

    navigate("/selfie", { state: punchPayload });
  };

  useEffect(() => {
    fetchUser();
    getLocation();
    fetchPunchStatus();
    syncOfflineAttendance();

    const handleOnline = () => {
      console.log("🔌 Back online — syncing offline punches...");
      syncOfflineAttendance();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const renderPunchButton = () => {
    if (!punchStatus.punchedIn) {
      return (
        <button
          onClick={() => handlePunchClick("in")}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold shadow"
        >
          Punch In
        </button>
      );
    } else if (!punchStatus.punchedOut) {
      return (
        <button
          onClick={() => handlePunchClick("out")}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-bold shadow"
        >
          Punch Out
        </button>
      );
    }
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-3 rounded-lg font-bold shadow cursor-not-allowed"
      >
        Attendance Complete for Today
      </button>
    );
  };

  if (!user) return <p className="text-center mt-8 text-gray-600">Loading user...</p>;

  return (
    <div className="min-h-screen bg-white p-4 max-w-md mx-auto w-full">
      <button
        className="absolute top-4 right-4 text-white text-sm bg-orange-500 px-2 py-1 rounded"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-800 w-full">Mark Attendance</h2>

      <div className="relative w-full mb-4 rounded overflow-hidden shadow">
        {isLoaded && location && (
          <GoogleMap
            mapContainerStyle={MAP_STYLE}
            center={{ lat: location.lat, lng: location.lng }}
            zoom={DEFAULT_ZOOM}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              clickableIcons: false,
            }}
            onLoad={onMapLoad}
          >
            <MarkerF position={{ lat: location.lat, lng: location.lng }} />
            {/* Optional: show a 100m circle to match your branch radius feel */}
            <CircleF
              center={{ lat: location.lat, lng: location.lng }}
              radius={100}
              options={{ fillOpacity: 0.08, strokeOpacity: 0.4, strokeWeight: 1 }}
            />
          </GoogleMap>
        )}

        {loadingLocation && <p className="text-sm">Fetching location...</p>}

        <button
          className="top-2 right-2 bg-white text-sm px-3 py-1 rounded shadow border text-gray-800"
          onClick={getLocation}
        >
          🔄 Refresh Location
        </button>
      </div>

      {renderPunchButton()}
    </div>
  );
};

export default PunchInScreen;
