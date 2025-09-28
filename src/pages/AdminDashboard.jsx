import DashboardLayout from '../layouts/DashboardLayout';
import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const PunchTypeBadge = ({ type }) => {
  let cls =
    "px-2 py-1 rounded-full text-xs font-medium inline-block capitalize ";

  switch (type) {
    case "in":
      cls += "bg-green-100 text-green-700";
      break;
    case "out":
      cls += "bg-gray-200 text-gray-700";
      break;
    case "half":
      cls += "bg-yellow-100 text-yellow-700";
      break;
    case "absent":
      cls += "bg-red-100 text-red-700";
      break;
    case "weekoff":
      cls += "bg-blue-100 text-blue-700";
      break;
    case "paidleave":
      cls += "bg-purple-100 text-purple-700";
      break;
    case "unpaidleave":
      cls += "bg-pink-100 text-pink-700";
      break;
    case "overtime":
      cls += "bg-orange-100 text-orange-700";
      break;
    case "leave":
      cls += "bg-blue-200 text-blue-800";
      break;
    default:
      cls += "bg-gray-100 text-gray-600";
  }

  const label = type.replace(/([a-z])([A-Z])/g, "$1 $2");
  return <span className={cls}>{label}</span>;
};

const AdminDashboard = () => {
  const [attendances, setAttendances] = useState([]);
  const [searchStaff, setSearchStaff] = useState('');
  const [role, setRole] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const params = { role: role || undefined, page, limit };

      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else {
        params.month = Number(month);
        params.year = Number(year);
      }

      const res = await axios.get('/attendance', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // 🔹 Handle both plain array + paginated object
      if (res.data && Array.isArray(res.data.rows)) {
        setAttendances(res.data.rows);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setAttendances(Array.isArray(res.data) ? res.data : []);
        setTotal(Array.isArray(res.data) ? res.data.length : 0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, month, year, page, limit]);

  const filtered = attendances.filter((r) =>
    r.user?.name?.toLowerCase().includes(searchStaff.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            className="border p-2 rounded"
            placeholder="Search Staff"
            value={searchStaff}
            onChange={(e) => setSearchStaff(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="staff">Staff</option>
            <option value="labour">Labour</option>
            <option value="subcontractor">Subcontractor</option>
          </select>

          {!startDate && !endDate && (
            <>
              <select
                className="border p-2 rounded"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {[...Array(12).keys()].map((m) => (
                  <option key={m + 1} value={m + 1}>
                    {new Date(0, m).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                className="border p-2 rounded"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
            </>
          )}

          <input
            type="date"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Apply
          </button>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2 text-black">Attendance Records</h2>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-black">Name</th>
                <th className="border p-2 text-black">Role</th>
                <th className="border p-2 text-black">Type</th>
                <th className="border p-2 text-black">Date</th>
                <th className="border p-2 text-black">Time</th>
                <th className="border p-2 text-black">Branch</th>
                <th className="border p-2 text-black">Selfie</th>
                <th className="border p-2 text-black">Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id}>
                    <td className="border p-2 text-black">{item.user?.name || 'N/A'}</td>
                    <td className="border p-2 text-black">{item.user?.role || '-'}</td>
                    <td className="border p-2 capitalize text-black">
                      <PunchTypeBadge type={item.punchType} />
                      {item.punchType === "leave" && item.leaveId?.type
                        ? ` • ${item.leaveId.type.charAt(0).toUpperCase()}${item.leaveId.type.slice(1)} Leave`
                        : ""}
                    </td>
                    <td className="border p-2 text-black">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border p-2 text-black">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="border p-2 text-black">{item.branch || 'Outside Assigned Branch'}</td>
                    <td className="border p-2">
                      {item.selfieUrl ? (
                        <img
                          src={item.selfieUrl}
                          alt="selfie"
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        item.punchType === "leave" ? "—" : "N/A"
                      )}
                    </td>
                    <td className="border p-2 text-gray-700 italic">
                      {item.note || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages} · {total} records
            </div>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
