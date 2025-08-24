import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "../utils/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast } from "react-toastify";
import {
  GoogleMap,
  MarkerF,
  CircleF,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";

const MAP_STYLE = { height: "300px", width: "100%" };
const DEFAULT_CENTER = { lat: -33.8688, lng: 151.2093 }; // Sydney fallback
const DEFAULT_ZOOM = 5;

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    name: "",
    lat: null,
    lng: null,
    radius: 100,
  });

  const [searchInput, setSearchInput] = useState("");
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  // Load Google Maps + Places library
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback((lat, lng, zoom = 15) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(zoom);
    }
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBranches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setBranches([]);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Reverse geocode using Google
  const reverseGeocode = async (lat, lng) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const { results } = await geocoder.geocode({ location: { lat, lng } });
      return results?.[0]?.formatted_address || "Unknown location";
    } catch (e) {
      console.error("Reverse geocode failed", e);
      return "Unknown location";
    }
  };

  // Handle clicking on the map
  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const address = await reverseGeocode(lat, lng);

    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
      address,
    }));
    setSearchInput(address);
    toast.success("Location selected!");
  };

  // Handle Autocomplete selection
  const onPlaceChanged = async () => {
    const ac = autocompleteRef.current;
    if (!ac) return;
    const place = ac.getPlace();
    if (!place || !place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address || place.name || searchInput;

    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
      address,
    }));
    setSearchInput(address);
    panTo(lat, lng, 15);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.lat || !formData.lng) {
      toast.error("Please provide name and location");
      return;
    }

    const payload = {
      name: formData.name,
      lat: formData.lat,
      lng: formData.lng,
      radius: formData.radius,
      address: formData.address,
    };

    try {
      if (editingId) {
        await axios.put(`/branches/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Branch updated");
      } else {
        await axios.post("/branches", payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Branch created");
      }
      setFormData({ name: "", lat: null, lng: null, radius: 100, address: "" });
      setSearchInput("");
      setEditingId(null);
      fetchBranches();
    } catch (err) {
      console.error("Error saving branch:", err);
      toast.error("Failed to save branch");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this branch?")) return;
    try {
      await axios.delete(`/branches/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Branch deleted");
      fetchBranches();
    } catch (e) {
      toast.error("Failed to delete branch");
    }
  };

  const handleEdit = (branch) => {
    setEditingId(branch._id);
    setFormData({
      name: branch.name,
      lat: branch.lat,
      lng: branch.lng,
      radius: branch.radius,
      address: branch.address || "",
    });
    setSearchInput(branch.address || "");
    if (branch.lat && branch.lng) panTo(branch.lat, branch.lng, 15);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", lat: null, lng: null, radius: 100, address: "" });
    setSearchInput("");
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-black">Manage Branches</h2>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded p-4 mb-6">
          <div className="mb-4">
            <label className="block font-semibold text-black">Branch Name</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-black">Radius (meters)</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={formData.radius}
              onChange={(e) =>
                setFormData({ ...formData, radius: parseInt(e.target.value || "0", 10) })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-black">Address</label>
            <input
              type="text"
              className="w-full border p-2 rounded bg-gray-100"
              readOnly
              value={formData.address || ""}
            />
          </div>

          <p className="text-sm text-gray-500 italic mt-1">
            Tip: Try searching “Mahim Mumbai” or a PIN code if the full address fails.
          </p>

          <div className="mb-4">
            <label className="block font-semibold mb-1 text-black">Search Location</label>
            {isLoaded ? (
              <Autocomplete
                onLoad={(ac) => (autocompleteRef.current = ac)}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  type="text"
                  className="w-full border p-2 rounded mb-2"
                  placeholder="Search for a place"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                className="w-full border p-2 rounded mb-2"
                placeholder="Loading Google..."
                disabled
              />
            )}

            {isLoaded && (
              <GoogleMap
                mapContainerStyle={MAP_STYLE}
                center={
                  formData.lat && formData.lng
                    ? { lat: formData.lat, lng: formData.lng }
                    : DEFAULT_CENTER
                }
                zoom={formData.lat ? 15 : DEFAULT_ZOOM}
                options={{ disableDefaultUI: true, zoomControl: true, clickableIcons: false }}
                onLoad={onMapLoad}
                onClick={handleMapClick}
              >
                {formData.lat && formData.lng && (
                  <>
                    <MarkerF position={{ lat: formData.lat, lng: formData.lng }} />
                    <CircleF
                      center={{ lat: formData.lat, lng: formData.lng }}
                      radius={Number(formData.radius) || 0}
                      options={{ fillOpacity: 0.08, strokeOpacity: 0.4, strokeWeight: 1 }}
                    />
                  </>
                )}
              </GoogleMap>
            )}
          </div>

          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
              {editingId ? "Update Branch" : "Save Branch"}
            </button>
            {editingId && (
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="bg-white shadow rounded p-4">
          <h3 className="text-xl font-bold mb-2" style={{ color: "black" }}>
            All Branches
          </h3>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border" style={{ color: "black" }}>Name</th>
                <th className="p-2 border" style={{ color: "black" }}>Radius (m)</th>
                <th className="p-2 border" style={{ color: "black" }}>Latitude</th>
                <th className="p-2 border" style={{ color: "black" }}>Longitude</th>
                <th className="p-2 border" style={{ color: "black" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(branches) &&
                branches.map((b) => (
                  <tr key={b._id}>
                    <td className="p-2 border" style={{ color: "black" }}>{b.name}</td>
                    <td className="p-2 border" style={{ color: "black" }}>{b.radius}</td>
                    <td className="p-2 border" style={{ color: "black" }}>{b.lat}</td>
                    <td className="p-2 border" style={{ color: "black" }}>{b.lng}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleEdit(b)}
                        className="text-white hover:underline mr-2 bg-orange-500 px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="text-white hover:underline mr-2 bg-orange-500 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {branches.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No branches yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminBranches;
