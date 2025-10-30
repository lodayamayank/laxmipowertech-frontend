import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import {
  FaRupeeSign,
  FaCalendarAlt,
  FaUserTie,
  FaFileDownload,
  FaSearch,
  FaFilter,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaUsers,
  FaExclamationTriangle,
  FaClock,
  FaCalendarCheck,
  FaInfoCircle,
} from 'react-icons/fa';
import Select from '../components/Select';

const SalaryDashboard = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  //  AUTO-CALCULATION: Determine correct month based on salary day (10th)
  const getDefaultSalaryMonth = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // ✅ If before 10th, show PREVIOUS month's salary (ready for payment on 10th)
    if (currentDay < 10) {
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      return { 
        month: prevMonth, 
        year: prevYear,
        isPaymentPending: true, // Salary ready but not yet paid
        message: `Showing ${getPreviousMonthName(currentMonth)} salary - Payment due on ${currentMonth}/10/${currentYear}`
      };
    }
    
    // ✅ On or after 10th, show CURRENT month's salary (in progress)
    return { 
      month: currentMonth, 
      year: currentYear,
      isPaymentPending: false, // Current month calculation
      message: `Showing ${getMonthName(currentMonth)} salary - Payment on ${currentMonth === 12 ? 1 : currentMonth + 1}/10/${currentMonth === 12 ? currentYear + 1 : currentYear}`
    };
  };
  
  const getPreviousMonthName = (currentMonth) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[currentMonth === 1 ? 11 : currentMonth - 2];
  };
  
  const getMonthName = (month) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month - 1];
  };
  
  const defaultPeriod = getDefaultSalaryMonth();
  const [month, setMonth] = useState(defaultPeriod.month);
  const [year, setYear] = useState(defaultPeriod.year);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const token = localStorage.getItem('token');

  // Calculate salary date info (10th of every month)
  const salaryDateInfo = useMemo(() => {
    const currentDate = new Date();
    const selectedDate = new Date(year, month - 1, 10);
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const salaryDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    const isPast = salaryDay < today;
    const isToday = salaryDay.getTime() === today.getTime();
    const isFuture = salaryDay > today;
    
    // Calculate next salary date
    const nextSalaryDate = new Date();
    if (currentDate.getDate() >= 10) {
      nextSalaryDate.setMonth(currentDate.getMonth() + 1);
    }
    nextSalaryDate.setDate(10);
    
    // Calculate days until next salary
    const daysUntilSalary = Math.ceil((nextSalaryDate - currentDate) / (1000 * 60 * 60 * 24));
    
    return {
      salaryDate: selectedDate,
      isPast,
      isToday,
      isFuture,
      nextSalaryDate,
      daysUntilSalary,
      isPaymentPending: defaultPeriod.isPaymentPending,
      autoMessage: defaultPeriod.message,
      formattedDate: selectedDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      nextFormattedDate: nextSalaryDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    };
  }, [month, year]);

  // Fetch salary data
  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      const params = { month, year };
      if (roleFilter) params.role = roleFilter;

      const res = await axios.get('/salary/calculate', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalaryData(res.data || []);
    } catch (err) {
      console.error('Failed to fetch salary data:', err);
      // Don't show error toast if it's just a 404 (route not implemented yet)
      if (err.response?.status !== 404) {
        toast.error('Failed to load salary data');
      }
      setSalaryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryData();
  }, [month, year, roleFilter]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    return salaryData.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [salaryData, searchTerm]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalGross = filteredData.reduce((sum, item) => sum + item.grossSalary, 0);
    const totalNet = filteredData.reduce((sum, item) => sum + item.netSalary, 0);
    const totalDeductions = filteredData.reduce((sum, item) => sum + item.deductions.total, 0);
    const employeeCount = filteredData.length;

    return {
      totalGross: Math.round(totalGross),
      totalNet: Math.round(totalNet),
      totalDeductions: Math.round(totalDeductions),
      employeeCount,
    };
  }, [filteredData]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Role',
      'Department',
      'CTC',
      'Salary Type',
      'Gross Salary',
      'Present Days',
      'Absent Days',
      'Half Days',
      'Paid Leave',
      'Unpaid Leave',
      'Payable Days',
      'Deductions',
      'Net Salary',
      'Salary Date',
      'Payment Status',
    ];

    const rows = filteredData.map((item) => [
      item.employeeId,
      item.name,
      item.role,
      item.department,
      item.ctcAmount,
      item.salaryType,
      item.grossSalary,
      item.attendance.presentDays,
      item.attendance.absentDays,
      item.attendance.halfDays,
      item.attendance.paidLeaveDays,
      item.attendance.unpaidLeaveDays,
      item.payableDays,
      item.deductions.total,
      item.netSalary,
      salaryDateInfo.formattedDate,
      salaryDateInfo.isPast ? 'Paid' : salaryDateInfo.isToday ? 'Due Today' : 'Pending',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary_report_${year}_${month}_${salaryDateInfo.formattedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <DashboardLayout title="Salary Management">
      <div className="space-y-6">
        {/* Auto-Calculation Info Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 shadow-lg text-white">
          <div className="flex items-center gap-3">
            <FaInfoCircle size={24} className="opacity-90" />
            <div>
              <h3 className="font-bold text-lg">Auto-Calculated Salary Period</h3>
              <p className="text-sm opacity-90">{salaryDateInfo.autoMessage}</p>
              <p className="text-xs opacity-75 mt-1">
                {salaryDateInfo.isPaymentPending 
                  ? '💰 This salary is finalized and ready for payment' 
                  : '📊 This salary is being calculated based on ongoing attendance'}
              </p>
            </div>
          </div>
        </div>

        {/* Salary Date Alert Banner */}
        <div className={`rounded-xl p-4 shadow-lg ${
          salaryDateInfo.isToday 
            ? 'bg-gradient-to-r from-green-500 to-green-600' 
            : salaryDateInfo.isPast 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
            : 'bg-gradient-to-r from-orange-500 to-orange-600'
        } text-white`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <FaCalendarCheck size={28} className="opacity-90" />
              <div>
                <h3 className="font-bold text-lg">
                  {salaryDateInfo.isToday && '🎉 Salary Day Today!'}
                  {salaryDateInfo.isPast && '✅ Salary Already Paid'}
                  {salaryDateInfo.isFuture && salaryDateInfo.isPaymentPending && '⏳ Payment Pending'}
                  {salaryDateInfo.isFuture && !salaryDateInfo.isPaymentPending && '📊 Salary In Progress'}
                </h3>
                <p className="text-sm opacity-90">
                  Salary Date: <span className="font-semibold">{salaryDateInfo.formattedDate}</span>
                  {!salaryDateInfo.isToday && !salaryDateInfo.isPast && (
                    <span className="ml-2">
                      - Next salary in <span className="font-bold">{salaryDateInfo.daysUntilSalary} days</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            {!salaryDateInfo.isPast && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <FaClock size={16} />
                  <span className="text-sm font-medium">
                    Next: {salaryDateInfo.nextFormattedDate}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaUsers size={24} className="opacity-80" />
              <div className="text-3xl font-bold">{summary.employeeCount}</div>
            </div>
            <p className="text-sm opacity-90">Total Employees</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaMoneyBillWave size={24} className="opacity-80" />
              <div className="text-2xl font-bold">{formatCurrency(summary.totalGross)}</div>
            </div>
            <p className="text-sm opacity-90">Total Gross Salary</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaExclamationTriangle size={24} className="opacity-80" />
              <div className="text-2xl font-bold">{formatCurrency(summary.totalDeductions)}</div>
            </div>
            <p className="text-sm opacity-90">Total Deductions</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaChartLine size={24} className="opacity-80" />
              <div className="text-2xl font-bold">{formatCurrency(summary.totalNet)}</div>
            </div>
            <p className="text-sm opacity-90">Total Net Payable</p>
            <p className="text-xs opacity-75 mt-1">
              {salaryDateInfo.isPaymentPending ? '💰 Ready for payment' : '📊 In progress'}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        {!loading && salaryData.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, username, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="labour">Labour</option>
                  <option value="subcontractor">Subcontractor</option>
                </Select>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  <FaFileDownload />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Salary Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">CTC</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Gross</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Days</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Deductions</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Net Salary</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <React.Fragment key={item.userId}>
                      <tr className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">@{item.username}</p>
                            <p className="text-xs text-gray-400">{item.employeeId}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            item.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                            item.role === 'labour' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-medium">{formatCurrency(item.ctcAmount)}</p>
                          <p className="text-xs text-gray-500">{item.salaryType}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(item.grossSalary)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-sm">
                            <p className="text-green-600 font-semibold">{item.payableDays}</p>
                            <p className="text-xs text-gray-500">of {item.attendance.workingDays}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">
                          {formatCurrency(item.deductions.total)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-bold text-lg text-green-600">
                            {formatCurrency(item.netSalary)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setExpandedRow(expandedRow === item.userId ? null : item.userId)}
                            className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                          >
                            {expandedRow === item.userId ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </tr>
                      {/* Expanded Row Details */}
                      {expandedRow === item.userId && (
                        <tr className="bg-gray-50 border-b">
                          <td colSpan="8" className="px-4 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Attendance Breakdown */}
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <FaCalendarAlt className="text-orange-500" />
                                  Attendance Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Present Days:</span>
                                    <span className="font-medium text-green-600">{item.attendance.presentDays}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Absent Days:</span>
                                    <span className="font-medium text-red-600">{item.attendance.absentDays}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Half Days:</span>
                                    <span className="font-medium text-yellow-600">{item.attendance.halfDays}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Paid Leave:</span>
                                    <span className="font-medium text-blue-600">{item.attendance.paidLeaveDays}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Unpaid Leave:</span>
                                    <span className="font-medium text-orange-600">{item.attendance.unpaidLeaveDays}</span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-700 font-semibold">Working Days:</span>
                                    <span className="font-bold">{item.attendance.workingDays}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Salary Calculation */}
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <FaRupeeSign className="text-orange-500" />
                                  Salary Breakdown
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Gross Salary:</span>
                                    <span className="font-medium">{formatCurrency(item.grossSalary)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Per Day Rate:</span>
                                    <span className="font-medium">{formatCurrency(item.perDaySalary)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Payable Days:</span>
                                    <span className="font-medium">{item.payableDays}</span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-700 font-semibold">Net Salary:</span>
                                    <span className="font-bold text-green-600">{formatCurrency(item.netSalary)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Deductions */}
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <FaExclamationTriangle className="text-orange-500" />
                                  Deductions
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Absent Deduction:</span>
                                    <span className="font-medium text-red-600">{formatCurrency(item.deductions.absent)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Half Day Deduction:</span>
                                    <span className="font-medium text-red-600">{formatCurrency(item.deductions.halfDay)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Unpaid Leave:</span>
                                    <span className="font-medium text-red-600">{formatCurrency(item.deductions.unpaidLeave)}</span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-700 font-semibold">Total Deductions:</span>
                                    <span className="font-bold text-red-600">{formatCurrency(item.deductions.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {filteredData.length} of {salaryData.length} employees
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!loading && salaryData.length === 0 && (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <FaInfoCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Salary Data</h3>
            <p className="text-gray-500">No employees found with salary information for the selected period.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading salary data...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalaryDashboard;