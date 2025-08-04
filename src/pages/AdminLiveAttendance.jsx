import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaUserCircle } from "react-icons/fa";

const AdminLiveAttendance = () => {
  const [staffData, setStaffData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ role: "", branch: "" });
  const [branches, setBranches] = useState([]);

  const statusTabs = [
    { label: "All", value: "all" },
    { label: "In", value: "in" },
    { label: "Out", value: "out" },
    { label: "No Punch In", value: "no_punch" },
  ];

  // Fetch branches only
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get("/branches");
        setBranches(res.data || []);
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, []);

  // Fetch live attendance with filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {};
        if (filters.role) params.role = filters.role;
        if (filters.branch) params.branch = filters.branch;

        const res = await axios.get("/attendance/live", { params });
        if (Array.isArray(res.data)) {
          setStaffData(res.data);
        } else {
          console.warn("Live response not an array", res.data);
          setStaffData([]);
        }
      } catch (err) {
        console.error("Failed to fetch live attendance", err);
        setStaffData([]);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [filters]);

  // Apply search & status filters
  useEffect(() => {
    const filtered = Array.isArray(staffData)
      ? staffData.filter((user) => {
          const matchesStatus =
            statusFilter === "all" || user.status === statusFilter;
          const matchesSearch = user.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          return matchesStatus && matchesSearch;
        })
      : [];
    setFilteredData(filtered);
  }, [statusFilter, searchQuery, staffData]);

  const statusCounts = staffData.reduce(
    (acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    },
    { in: 0, out: 0, no_punch: 0 }
  );

  const downloadCSV = () => {
    const csvHeader = "Name,Status,Punch Time,Location";
    const csvRows = filteredData.map(
      (u) => `${u.name},${u.status},${u.punchTime || "-"},${u.location || "-"}`
    );
    const csvContent = [csvHeader, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "live_attendance.csv";
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-orange-600">
            Live Attendance
          </h1>
          <button
            onClick={downloadCSV}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
          >
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-2 py-1 border rounded"
          >
            <option value="">All Roles</option>
            <option value="staff">Staff</option>
            <option value="labour">Labour</option>
            <option value="subcontractor">Subcontractor</option>
          </select>

          <select
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
            className="px-2 py-1 border rounded"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-1 rounded text-sm border transition-all ${
                statusFilter === tab.value
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.value !== "all" && ` (${statusCounts[tab.value] || 0})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
        />

        {/* Staff List */}
        <div className="space-y-3">
          {filteredData.length === 0 ? (
            <div className="text-gray-500 mt-8">No staff found.</div>
          ) : (
            filteredData.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 bg-white border rounded shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  ) : (
                    <FaUserCircle className="w-12 h-12 text-gray-400" />
                  )}

                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    {user.location && (
                      <p className="text-sm text-gray-500">{user.location}</p>
                    )}
                    {/* {user.selfieUrl && (
                      <a
                        href={user.selfieUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 underline"
                      >
                        View Selfie
                      </a>
                    )} */}
                  </div>
                </div>

                <div className="text-right">
                  {user.status === "in" ? (
                    <>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700 mb-1">
                        In
                      </span>
                      <div className="text-sm text-gray-600">{user.punchTime}</div>
                    </>
                  ) : user.status === "out" ? (
                    <>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 mb-1">
                        Out
                      </span>
                      <div className="text-sm text-gray-600">{user.punchTime}</div>
                    </>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                      No Punch In
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLiveAttendance;
