import React, { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const MINUTES_HALF_DAY = 240;
const MINUTES_FULL_DAY = 480;
const WEEK_OFF_DAYS = [0]; // Sunday

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("calendar"); // calendar | summary | list
  const [selectedDay, setSelectedDay] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/attendance/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecords(res.data || []);
      } catch (err) {
        console.error("Failed to load attendance", err);
        setError("Failed to load attendance");
      } finally {
        setLoading(false); // ✅ stop loading regardless of success/fail
      }
    };
  
    // fetch immediately on mount
    fetchData();
  
    // also listen for leave updates
    const refresh = () => fetchData();
    window.addEventListener("leave-updated", refresh);
    return () => window.removeEventListener("leave-updated", refresh);
  }, [token]);
  

  // --- filter punches
  const filteredRecords = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);

    return (records || []).filter((rec) => {
      const ts = new Date(rec.createdAt);
      if (Number.isNaN(ts.getTime())) return false;

      if (filter === "today") return ts.toDateString() === now.toDateString();
      if (filter === "week") return ts >= new Date(sevenDaysAgo.setHours(0, 0, 0, 0));
      if (filter === "month")
        return ts.getMonth() === now.getMonth() && ts.getFullYear() === now.getFullYear();
      return true;
    });
  }, [records, filter]);

  // --- daily aggregation
  const dailySummary = useMemo(() => {
    const keyOf = (iso) => {
      const d = new Date(iso);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
    };
  
    const byDay = new Map();
    for (const p of records) {
      const ts = p.createdAt;
      if (!ts) continue;
      const k = keyOf(ts);
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(p);
    }
  
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const out = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = keyOf(d);
      const punches = byDay.get(key) || [];
      const dow = d.getDay();
  
      let status;
      let firstIn = null, lastOut = null, minutes = 0;
  
      if (d > today) {
        status = "Future";
      } else if (punches.some((p) => p.punchType === "leave")) {
        const leavePunch = punches.find((p) => p.punchType === "leave");
        const type = leavePunch?.leaveId?.type || "unpaid";
        status =
          type === "paid"
            ? "Paid Leave"
            : type === "unpaid"
            ? "Unpaid Leave"
            : type === "sick"
            ? "Sick Leave"
            : "Casual Leave";
      } else if (
        punches.some((p) => p.punchType === "in") &&
        punches.some((p) => p.punchType === "out")
      ) {
        const ins = punches.filter((p) => p.punchType === "in").map((x) => new Date(x.createdAt));
        const outs = punches.filter((p) => p.punchType === "out").map((x) => new Date(x.createdAt));
        firstIn = new Date(Math.min(...ins.map((x) => x.getTime())));
        lastOut = new Date(Math.max(...outs.map((x) => x.getTime())));
        minutes = Math.max(0, Math.round((lastOut - firstIn) / 60000));
  
        if (!WEEK_OFF_DAYS.includes(dow)) {
          status =
            minutes >= MINUTES_FULL_DAY
              ? "Present"
              : minutes >= MINUTES_HALF_DAY
              ? "Half Day"
              : "Absent";
        } else {
          status = "Week Off";
        }
      } else if (punches.length && !WEEK_OFF_DAYS.includes(dow)) {
        status = "Half Day";
      } else if (WEEK_OFF_DAYS.includes(dow)) {
        status = "Week Off";
      } else {
        status = "Absent";
      }
  
      out.push({ date: key, status, minutes, firstIn, lastOut, punches });
    }
  
    return out;
  }, [records, month, year]);
  

  // summary counts
  const counts = useMemo(
    () => ({
      present: dailySummary.filter((d) => d.status === "Present").length,
      half: dailySummary.filter((d) => d.status === "Half Day").length,
      absent: dailySummary.filter((d) => d.status === "Absent").length,
      off: dailySummary.filter((d) => d.status === "Week Off").length,
      leave: dailySummary.filter((d) => d.status.includes("Leave")).length,
    }),
    [dailySummary]
  );
  

  const isActive = (type) => (filter === type ? "bg-blue-700" : "bg-blue-500");
  const isViewActive = (v) => (view === v ? "bg-indigo-700" : "bg-indigo-500");

  const openDayDetail = async (day) => {
    try {
      const res = await axios.get(`/attendance/notes/${user._id}/${day.date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedDay({ ...day, note: res.data?.note || "" });
    } catch {
      setSelectedDay({ ...day, note: "" });
    }
  };

  const saveNote = async () => {
    if (!selectedDay) return;
    await axios.post(
      `/attendance/notes/${user._id}/${selectedDay.date}`,
      { note: selectedDay.note },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSelectedDay(null);
  };

  return (
    <div className="min-h-screen bg-white p-6 max-w-md mx-auto relative">
      <button
        className="absolute top-4 right-4 text-white text-sm bg-orange-500 px-2 py-1 rounded"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1 className="text-xl font-bold mb-4">My Attendance</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {/* View toggle */}
          <div className="flex gap-2 mb-4">
            <p className="text-gray-800 font-semibold">Select View</p>
            <button className={`px-3 py-1 rounded text-white ${isViewActive("calendar")}`} onClick={() => setView("calendar")}>Calendar</button>
            <button className={`px-3 py-1 rounded text-white ${isViewActive("summary")}`} onClick={() => setView("summary")}>Summary</button>
            <button className={`px-3 py-1 rounded text-white ${isViewActive("list")}`} onClick={() => setView("list")}>List</button>
          </div>

          {/* Calendar view */}
          {view === "calendar" && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <button className="px-2 py-1 bg-orange-500 rounded" onClick={() => {
                  if (month === 0) { setMonth(11); setYear(year - 1); }
                  else setMonth(month - 1);
                }}>◀</button>
                <div className="font-semibold text-black">
                  {months[month]} {year}
                </div>
                <button className="px-2 py-1 bg-orange-500 rounded" onClick={() => {
                  if (month === 11) { setMonth(0); setYear(year + 1); }
                  else setMonth(month + 1);
                }}>▶</button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Chip label={`Present ${counts.present}`} />
                <Chip label={`Half ${counts.half}`} />
                <Chip label={`Absent ${counts.absent}`} />
                <Chip label={`Leave ${counts.leave}`} />
                <Chip label={`Off ${counts.off}`} />
              </div>
              {/* Calendar grid same as before */}
              <CalendarGrid dailySummary={dailySummary} openDayDetail={openDayDetail} />
              <Legend />
            </div>
          )}

          {/* Summary view */}
          {view === "summary" && (
            <ul className="divide-y">
              {dailySummary.map((d) => (
                <li key={d.date} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{d.date}</div>
                    <div className="text-sm opacity-70 text-gray-600">
                      {d.firstIn && d.lastOut
                        ? `IN ${fmt(d.firstIn)} • OUT ${fmt(d.lastOut)} • ${d.minutes} min`
                        : "—"}
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </li>
              ))}
            </ul>
          )}

          {/* List view */}
          {view === "list" && (
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left text-black">Date</th>
                  <th className="p-2 text-left text-black">Status</th>
                </tr>
              </thead>
              <tbody>
                {dailySummary.map((d) => (
                  <tr key={d.date} className="border-t">
                    <td className="p-2 text-black">{d.date}</td>
                    <td className="p-2"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Day detail modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 w-80">
            <h2 className="text-lg font-semibold mb-2 text-black">{selectedDay.date}</h2>
            <p className="mb-2 text-black">Status: <StatusBadge status={selectedDay.status} /></p>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              value={selectedDay.note || ""}
              placeholder="Add a note"
              onChange={(e) => setSelectedDay({ ...selectedDay, note: e.target.value })}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setSelectedDay(null)} className="px-3 py-1">Close</button>
              <button onClick={saveNote} className="bg-blue-500 text-white px-3 py-1 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- helpers
function CalendarGrid({ dailySummary, openDayDetail }) {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: offset }).map((_, i) => (
        <div key={`blank-${i}`} className="h-12"></div>
      ))}
      {dailySummary.map((d) => (
        <div
          key={d.date}
          className={`h-12 flex items-center justify-center rounded cursor-pointer ${statusColor(d.status)}`}
          onClick={() => openDayDetail(d)}
        >
          {new Date(d.date).getDate()}
        </div>
      ))}
    </div>
  );
}

function Chip({ label }) {
  return <span className="px-3 py-1 rounded-full bg-gray-200 text-sm">{label}</span>;
}

function StatusBadge({ status }) {
  const bg = {
    Present: "bg-green-500",
    "Half Day": "bg-yellow-500",
    Absent: "bg-red-500",
    "Week Off": "bg-gray-500",
    "Future": "bg-gray-100 text-gray-400",
    "Paid Leave": "bg-blue-500",
    "Unpaid Leave": "bg-purple-500",
    "Sick Leave": "bg-orange-500",
    "Casual Leave": "bg-pink-500",
  }[status] || "bg-gray-200";
  return <span className={`px-2 py-1 rounded ${bg} text-sm text-white`}>{status}</span>;
}

function statusColor(status) {
  return {
    Present: "bg-green-500 text-white",
    "Half Day": "bg-yellow-400 text-black",
    Absent: "bg-red-500 text-white",
    "Week Off": "bg-gray-300 text-black",
    Future: "bg-gray-100 text-gray-400",
    "Paid Leave": "bg-blue-500 text-white",
    "Unpaid Leave": "bg-purple-500 text-white",
    "Sick Leave": "bg-orange-500 text-white",
    "Casual Leave": "bg-pink-500 text-white",
  }[status] || "bg-gray-100";
}

function Legend() {
  const items = [
    { label: "Present", color: "bg-green-500" },
    { label: "Half Day", color: "bg-yellow-400" },
    { label: "Absent", color: "bg-red-500" },
    { label: "Week Off", color: "bg-gray-300" },
    { label: "Paid Leave", color: "bg-blue-500" },
    { label: "Unpaid Leave", color: "bg-purple-500" },
    { label: "Sick Leave", color: "bg-orange-500" },
    { label: "Casual Leave", color: "bg-pink-500" },
    { label: "Future", color: "bg-gray-100 border" },
  ];
  return (
    <div className="flex flex-wrap gap-4 mt-4 text-sm">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1">
          <span className={`inline-block w-4 h-4 rounded ${i.color}`}></span>
          <span className="text-gray-800">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

function fmt(d) {
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default MyAttendance;
