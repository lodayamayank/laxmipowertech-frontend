// src/pages/AdminDashboard.jsx
import DashboardLayout from '../layouts/DashboardLayout';
import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import Select from '../components/Select';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';

const PunchTypeBadge = ({ type }) => {
  let cls = "px-2 py-1 rounded-full text-xs font-medium capitalize ";
  switch (type) {
    case "in": cls += "bg-green-100 text-green-700"; break;
    case "out": cls += "bg-gray-200 text-gray-700"; break;
    case "half": cls += "bg-yellow-100 text-yellow-700"; break;
    case "absent": cls += "bg-red-100 text-red-700"; break;
    case "weekoff": cls += "bg-blue-100 text-blue-700"; break;
    case "paidleave": cls += "bg-purple-100 text-purple-700"; break;
    case "unpaidleave": cls += "bg-pink-100 text-pink-700"; break;
    case "overtime": cls += "bg-orange-100 text-orange-700"; break;
    default: cls += "bg-gray-100 text-gray-600";
  }
  return <span className={cls}>{type}</span>;
};

const AdminDashboard = () => {
  const [attendances, setAttendances] = useState([]);
  const [searchStaff, setSearchStaff] = useState('');
  const [role, setRole] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoading(true);
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

      const rows = Array.isArray(res.data) ? res.data : res.data.rows || [];
      setAttendances(rows);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, month, year, startDate, endDate]);

  const filtered = attendances.filter((r) =>
    r.user?.name?.toLowerCase().includes(searchStaff.toLowerCase())
  );

  const downloadCSV = () => {
    if (filtered.length === 0) {
      alert("No records to export");
      return;
    }

    const headers = ["Name", "Role", "Type", "Date", "Time", "Branch", "Note"];
    const rows = filtered.map((item) => [
      item.user?.name || "N/A",
      item.user?.role || "-",
      item.punchType || "-",
      new Date(item.createdAt).toLocaleDateString(),
      new Date(item.createdAt).toLocaleTimeString(),
      item.branch || "Outside Assigned Branch",
      item.note || "-"
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `attendance_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-4">
        {/* Filters */}
        <form
          onSubmit={onSearch}
          className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-4 rounded-xl shadow"
        >
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Search Staff"
            value={searchStaff}
            onChange={(e) => setSearchStaff(e.target.value)}
          />

          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="All Roles"
            options={[
              { value: 'staff', label: 'Staff' },
              { value: 'labour', label: 'Labour' },
              { value: 'subcontractor', label: 'Subcontractor' },
            ]}
            icon={<FaUser size={14} />}
          />


          {!startDate && !endDate && (
            <>
              <Select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                options={[...Array(12).keys()].map((m) => ({
                  value: m + 1,
                  label: new Date(0, m).toLocaleString('default', { month: 'long' })
                }))}
                icon={<FaCalendarAlt size={14} />}
              />

              <Select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                options={Array.from({ length: 5 }, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return { value: y, label: y.toString() };
                })}
                icon={<FaCalendarAlt size={14} />}
              />
            </>
          )}

          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-black text-white"
          >
            Filter
          </button>
        </form>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Time</th>
                <th className="text-left px-4 py-2">Branch</th>
                <th className="text-left px-4 py-2">Selfie</th>
                <th className="text-left px-4 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6" colSpan={8}>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6" colSpan={8}>
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="px-4 py-2 font-medium">{item.user?.name || 'N/A'}</td>
                    <td className="px-4 py-2">{item.user?.role || '-'}</td>
                    <td className="px-4 py-2">
                      <PunchTypeBadge type={item.punchType} />
                    </td>
                    <td className="px-4 py-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2">
                      {item.branch || 'Outside Assigned Branch'}
                    </td>
                    <td className="px-4 py-2">
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
                    <td className="px-4 py-2 text-gray-700 italic">
                      {item.note || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;