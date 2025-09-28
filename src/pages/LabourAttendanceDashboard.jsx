import DashboardLayout from '../layouts/DashboardLayout';
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const LeaveBadge = ({ count, type }) => {
  if (!count || count === 0) return null;

  let cls =
    "px-2 py-1 rounded-full text-xs font-medium inline-block mr-1 capitalize ";

  switch (type) {
    case "paidLeave":
      cls += "bg-purple-100 text-purple-700";
      break;
    case "unpaidLeave":
      cls += "bg-pink-100 text-pink-700";
      break;
    case "sickLeave":
      cls += "bg-teal-100 text-teal-700";
      break;
    case "casualLeave":
      cls += "bg-indigo-100 text-indigo-700";
      break;
    default:
      cls += "bg-gray-100 text-gray-700";
  }

  const label =
    type === "paidLeave"
      ? "Paid"
      : type === "unpaidLeave"
      ? "Unpaid"
      : type === "sickLeave"
      ? "Sick"
      : type === "casualLeave"
      ? "Casual"
      : type;

  return <span className={cls}>{label}: {count}</span>;
};

const LabourAttendanceDashboard = () => {
  const [records, setRecords] = useState([]);
  const [searchStaff, setSearchStaff] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/attendance/summary', {
          headers: { Authorization: `Bearer ${token}` },
          params: { role: 'labour', month, year },
        });
        setRecords(res.data || []);
      } catch (err) {
        console.error('Failed to fetch labour summary', err);
      }
    };
    fetchData();
  }, [token, month, year]);

  const filtered = records.filter((r) =>
    r.name?.toLowerCase().includes(searchStaff.toLowerCase())
  );

  // ✅ CSV Export Function
  const exportToCSV = () => {
    if (!filtered.length) {
      alert("No records to export");
      return;
    }

    const headers = [
      "Name",
      "Employee ID",
      "Present",
      "Absent",
      "Half Day",
      "Week Off",
      "Paid Leave",
      "Unpaid Leave",
      "Sick Leave",
      "Casual Leave",
      "Overtime",
    ];

    const rows = filtered.map((item) => [
      item.name,
      item.employeeId,
      item.present,
      item.absent,
      item.halfDay,
      item.weekOff,
      item.paidLeave || 0,
      item.unpaidLeave || 0,
      item.sickLeave || 0,
      item.casualLeave || 0,
      item.overtime,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Labour_Attendance_${month}_${year}.csv`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Labour Attendance</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            className="border p-2 rounded"
            placeholder="Search Labour"
            value={searchStaff}
            onChange={(e) => setSearchStaff(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {[...Array(12).keys()].map((m) => (
              <option key={m + 1} value={m + 1}>
                {new Date(0, m).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* ✅ Export Button */}
          <button
            onClick={exportToCSV}
            className="ml-auto bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-black">Name</th>
                <th className="border p-2 text-black">Employee ID</th>
                <th className="border p-2 text-black">Present</th>
                <th className="border p-2 text-black">Absent</th>
                <th className="border p-2 text-black">Half Day</th>
                <th className="border p-2 text-black">Week Off</th>
                <th className="border p-2 text-black">Leaves</th>
                <th className="border p-2 text-black">Overtime</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={i}>
                  <td className="border p-2 text-black">{item.name}</td>
                  <td className="border p-2 text-black">{item.employeeId}</td>
                  <td className="border p-2 text-black">{item.present}</td>
                  <td className="border p-2 text-black">{item.absent}</td>
                  <td className="border p-2 text-black">{item.halfDay}</td>
                  <td className="border p-2 text-black">{item.weekOff}</td>
                  <td className="border p-2 text-black">
                    <LeaveBadge count={item.paidLeave} type="paidLeave" />
                    <LeaveBadge count={item.unpaidLeave} type="unpaidLeave" />
                    <LeaveBadge count={item.sickLeave} type="sickLeave" />
                    <LeaveBadge count={item.casualLeave} type="casualLeave" />
                  </td>
                  <td className="border p-2 text-black">{item.overtime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabourAttendanceDashboard;
