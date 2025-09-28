// frontend/pages/NotesDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import DashboardLayout from "../layouts/DashboardLayout";

const NotesDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [branch, setBranch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const token = localStorage.getItem("token");

  const fetchNotes = async () => {
    try {
      const res = await axios.get(
        `/attendanceNotes?search=${search}&page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(res.data.notes);   // 👈 only set the array, not the whole object
      setTotal(res.data.total);  // optional for pagination
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [page, role, branch, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Notes Dashboard</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            className="border p-2 rounded flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              setPage(1);
              fetchNotes();
            }}
          >
            Search
          </button>

          <select
            className="border p-2 rounded"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Roles</option>
            <option value="labour">Labour</option>
            <option value="subcontractor">Subcontractor</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          <select
            className="border p-2 rounded"
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Branches</option>
            {/* In a real app, you’d fetch these dynamically */}
            <option value="Office">Office</option>
            <option value="Home">Home</option>
            <option value="Highgate st">Highgate st</option>
          </select>
        </div>

        {/* Notes Table */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-black">User</th>
                <th className="border p-2 text-black">Role</th>
                <th className="border p-2 text-black">Branch</th>
                <th className="border p-2 text-black">Date</th>
                <th className="border p-2 text-black">Note</th>
              </tr>
            </thead>
            <tbody>
              {notes.length > 0 ? (
                notes.map((n) => (
                  <tr key={n._id}>
                    <td className="border p-2 text-black">
                      {n.userName || "N/A"}
                    </td>
                    <td className="border p-2 text-black">
                      {n.role || "N/A"}
                    </td>
                    <td className="border p-2 text-black">
                      {n.branch || "N/A"}
                    </td>
                    <td className="border p-2 text-black">{n.date}</td>
                    <td className="border p-2 text-black">{n.note}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No notes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotesDashboard;
