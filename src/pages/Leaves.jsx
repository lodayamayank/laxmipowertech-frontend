// src/pages/Leaves.jsx
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";



const StatusBadge = ({ status }) => {
  const cls =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
};

export default function Leaves() {
    const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "paid",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/leaves/my");
      setLeaves(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/leaves", form);
      alert("Leave request submitted!");
      setForm({ type: "paid", startDate: "", endDate: "", reason: "" });
      loadLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to submit leave request");
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  return (
    <div className="p-4 space-y-6">
        <button
        className="absolute top-4 right-4 text-white text-sm bg-orange-500 px-2 py-1 rounded"
        onClick={() => navigate('/dashboard')}
      >
        ← Back
      </button>
      {/* Page Title */}
      <h1 className="text-xl font-semibold">Leaves</h1>

      {/* Request Leave Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-4 space-y-4"
      >
        <h2 className="font-medium text-base">Request Leave</h2>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
              placeholder="Enter reason (optional)"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-black text-white font-medium"
        >
          Submit
        </button>
      </form>

      {/* Leave History */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="font-medium text-base mb-3">My Leave History</h2>
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : leaves.length === 0 ? (
          <p className="text-gray-500">No leave requests yet.</p>
        ) : (
          <ul className="divide-y">
            {leaves.map((l) => {
              const days =
                (new Date(l.endDate) - new Date(l.startDate)) /
                  (1000 * 60 * 60 * 24) +
                1;
              return (
                <li key={l._id} className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium capitalize">{l.type}</p>
                      <p className="text-sm text-gray-600">
                        {dayjs(l.startDate).format("DD MMM YYYY")} →{" "}
                        {dayjs(l.endDate).format("DD MMM YYYY")} ({Math.max(
                          1,
                          days
                        )}{" "}
                        days)
                      </p>
                      {l.reason && (
                        <p className="text-sm text-gray-500 mt-1">
                          Reason: {l.reason}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
