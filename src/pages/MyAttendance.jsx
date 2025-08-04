import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const MyAttendance = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const res = await axios.get('/attendance/my', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRecords(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load attendance');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, token]);

    const filteredRecords = records.filter((rec) => {
        const recordDate = new Date(rec.createdAt);
        const now = new Date();

        if (filter === 'today') {
            return recordDate.toDateString() === now.toDateString();
        }

        if (filter === 'week') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            return recordDate >= sevenDaysAgo;
        }

        if (filter === 'month') {
            return (
                recordDate.getMonth() === now.getMonth() &&
                recordDate.getFullYear() === now.getFullYear()
            );
        }

        return true; // 'all'
    });

    const isActive = (type) =>
        filter === type ? 'bg-blue-700' : 'bg-blue-500';

    return (
        <div className="min-h-screen bg-white p-6 max-w-md mx-auto">
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
                    {/* Filter buttons */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <button
                            className={`px-4 py-2 text-white rounded hover:bg-blue-600 ${isActive('today')}`}
                            onClick={() => setFilter('today')}
                        >
                            Today
                        </button>
                        <button
                            className={`px-4 py-2 text-white rounded hover:bg-blue-600 ${isActive('week')}`}
                            onClick={() => setFilter('week')}
                        >
                            Last 7 Days
                        </button>
                        <button
                            className={`px-4 py-2 text-white rounded hover:bg-blue-600 ${isActive('month')}`}
                            onClick={() => setFilter('month')}
                        >
                            This Month
                        </button>
                        <button
                            className={`px-4 py-2 text-white rounded hover:bg-gray-600 ${filter === 'all' ? 'bg-gray-700' : 'bg-gray-500'
                                }`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                    </div>

                    {/* Attendance Table */}
                    {filteredRecords.length === 0 ? (
                        <p className="text-gray-600">No attendance found for selected filter.</p>
                    ) : (
                        <table className="w-full border border-gray-300">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="p-2 text-left text-black">Date</th>
                                    <th className="p-2 text-left text-black">Punch Type</th>
                                    <th className="p-2 text-left text-black">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((rec, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-2 text-black">
                                            {rec.createdAt
                                                ? new Date(rec.createdAt).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="p-2">
                                            {rec.punchType === 'in' ? (
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                                                    Punch In
                                                </span>
                                            ) : rec.punchType === 'out' ? (
                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold">
                                                    Punch Out
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>

                                        <td className="p-2 text-black">
                                            {rec.createdAt
                                                ? new Date(rec.createdAt).toLocaleTimeString()
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
};

export default MyAttendance;
