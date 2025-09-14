// frontend/pages/NotesDashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "../utils/axios";

const NotesDashboard = () => {
    const [notes, setNotes] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10); // ✅ fixed missing state
    const [total, setTotal] = useState(0);

    const token = localStorage.getItem("token");

    const fetchNotes = async () => {
        try {
            const res = await axios.get(
                `/attendanceNotes?search=${search}&page=${page}&limit=${limit}`,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search]);

    return (
        <DashboardLayout>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4 text-black">Notes Dashboard</h1>

                {/* Search box */}
                <div className="flex mb-4">
                    <input
                        type="text"
                        placeholder="Search notes..."
                        className="border p-2 rounded flex-1"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // reset to page 1 when search changes
                        }}
                    />
                    <button
                        onClick={fetchNotes}
                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Search
                    </button>
                </div>
                <div className="flex gap-4 mb-4">
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
                            <option key={b._id} value={b.name}>{b.name}</option>
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
                    <button onClick={fetchNotes} className="bg-blue-600 text-white px-4 py-2 rounded">
                        Filter
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
                            {notes.map((n) => (
                                <tr key={n._id}>
                                    <td className="border p-2 text-black">{n.userId?.name || "N/A"}</td>
                                    <td className="border p-2 text-black">{n.userId?.role || "N/A"}</td>
                                    <td className="border p-2 text-black">{n.date}</td>
                                    <td className="border p-2 text-black">{n.note || "—"}</td>
                                    <td className="border p-2 text-black">
                                        {(n.userId?.assignedBranches || [])
                                            .map((b) => b.name)
                                            .join(", ") || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between mt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>
                        Page {page} of {Math.ceil(total / limit) || 1}
                    </span>
                    <button
                        disabled={page * limit >= total}
                        onClick={() => setPage(page + 1)}
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
