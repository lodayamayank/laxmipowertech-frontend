import DashboardLayout from '../layouts/DashboardLayout';
import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const AdminDashboard = () => {
  const [attendances, setAttendances] = useState([]);
  const [searchStaff, setSearchStaff] = useState('');
  const [role, setRole] = useState(''); // all by default
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const params = { role: role || undefined };

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

      setAttendances(res.data || []);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, month, year]); // auto-refresh on role/month/year

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

          {/* Show month/year only if no date range */}
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

          {/* Date range filter */}
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
              {filtered.map((item) => (
                <tr key={item._id}>
                  <td className="border p-2 text-black">{item.user?.name || 'N/A'}</td>
                  <td className="border p-2 text-black">{item.user?.role || '-'}</td>
                  <td className="border p-2 capitalize text-black">{item.punchType}</td>
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
                      'N/A'
                    )}
                  </td>
                  <td className="border p-2 text-gray-700 italic">
                    {item.note || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
