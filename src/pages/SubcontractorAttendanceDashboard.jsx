import DashboardLayout from '../layouts/DashboardLayout';
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const SubcontractorAttendanceDashboard = () => {
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
          params: { role: 'subcontractor', month, year },
        });
        setRecords(res.data || []);
      } catch (err) {
        console.error('Failed to fetch subcontractor summary', err);
      }
    };
    fetchData();
  }, [token, month, year]);

  const filtered = records.filter((r) =>
    r.name?.toLowerCase().includes(searchStaff.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Subcontractor Attendance</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            className="border p-2 rounded"
            placeholder="Search Subcontractor"
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
                {new Date(0, m).toLocaleString('default', { month: 'long' })}
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
                <th className="border p-2 text-black">Paid Leave</th>
                <th className="border p-2 text-black">Unpaid Leave</th>
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
                  <td className="border p-2 text-black">{item.paidLeave}</td>
                  <td className="border p-2 text-black">{item.unpaidLeave}</td>
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

export default SubcontractorAttendanceDashboard;
