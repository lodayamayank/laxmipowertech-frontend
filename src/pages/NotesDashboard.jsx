import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import DashboardLayout from "../layouts/DashboardLayout";

const NotesDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");       // ✅ define role state
  const [branch, setBranch] = useState("");   // ✅ define branch state
  const [branches, setBranches] = useState([]); 
  const [startDate, setStartDate] = useState(""); // ✅ date filter
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const token = localStorage.getItem("token");

  // ✅ Fetch branches for dropdown
  const fetchBranches = async () => {
    try {
      const res = await axios.get("/api/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res.data);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  // ✅ Fetch notes
  const fetchNotes = async () => {
    try {
      const res = await axios.get("/api/attendance-notes", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search,
          role,
          branch,
          startDate,
          endDate,
          page,
          limit,
        },
      });
      setNotes(res.data.notes || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchNotes();
  }, [page]);

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Notes Dashboard</h1>

        {/* 🔎 Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            className="border p-2 rounded flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Roles</option>
            <option value="labour">Labour</option>
            <option value="supervisor">Supervisor</option>
            <option value="subcontractor">Subcontractor</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={fetchNotes}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Filter
          </button>
        </div>

        {/* 📋 Notes Table */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">User</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Note</th>
                <th className="border p-2">Branch</th>
              </tr>
            </thead>
            <tbody>
              {notes.length > 0 ? (
                notes.map((n) => (
                  <tr key={n._id}>
                    <td className="border p-2">{n.userId?.name || "N/A"}</td>
                    <td className="border p-2">{n.userId?.role || "N/A"}</td>
                    <td className="border p-2">{n.date}</td>
                    <td className="border p-2">{n.note || "—"}</td>
                    <td className="border p-2">{n.branch || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border p-2 text-center" colSpan="5">
                    No notes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {Math.ceil(total / limit) || 1}
          </span>
          <button
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotesDashboard;
