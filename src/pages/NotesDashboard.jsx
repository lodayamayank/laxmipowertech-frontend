// frontend/pages/NotesDashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "../utils/axios";

const NotesDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchNotes = async () => {
    try {
      const res = await axios.get(
        `/api/attendance-notes?search=${search}&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotes(res.data.notes);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };
  

  useEffect(() => {
    fetchNotes();
  }, [page, search]);

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Notes Dashboard</h1>

        {/* Search bar */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            className="border p-2 rounded flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => fetchNotes()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>

        {/* Notes Table */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-black">User</th>
                <th className="border p-2 text-black">Role</th>
                <th className="border p-2 text-black">Date</th>
                <th className="border p-2 text-black">Note</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center p-4">
                    Loading...
                  </td>
                </tr>
              ) : notes.length > 0 ? (
                notes.map((n) => (
                  <tr key={n._id}>
                    <td className="border p-2 text-black">{n.userId?.name || "N/A"}</td>
                    <td className="border p-2 text-black">{n.userId?.role || "N/A"}</td>
                    <td className="border p-2 text-black">{n.date}</td>
                    <td className="border p-2 text-black">{n.note}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-4">
                    No notes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotesDashboard;
