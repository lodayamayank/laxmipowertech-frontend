import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";
import Select from "../components/Select";
import {
    FaUser,
    FaUserTag,
    FaPhone,
    FaEnvelope,
    FaCalendarAlt,
    FaBriefcase,
    FaMapMarkerAlt,
    FaIdCard,
    FaTimes,
    FaBuilding,
    FaUserCircle,
    FaAddressCard,
    FaUserTie,
} from "react-icons/fa";

const EditUserModal = ({ user, onClose, onSave }) => {
    const token = localStorage.getItem("token");
    const [activeTab, setActiveTab] = useState("basic");
    const [form, setForm] = useState(user || {});
    const [branches, setBranches] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        setForm(user || {});
        fetchMeta();
    }, [user]);

    const fetchMeta = async () => {
        try {
            const [projRes, branchRes] = await Promise.all([
                axios.get("/projects", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/branches", { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setProjects(projRes.data || []);
            setBranches(branchRes.data || []);
        } catch (err) {
            console.error("Failed to load meta data", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`/users/${user._id}`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("User updated successfully");
            onSave(res.data);
        } catch (err) {
            toast.error("Failed to update user");
            console.error(err);
        }
    };

    const TabButton = ({ id, label, icon }) => (
        <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
                activeTab === id
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab(id)}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const InputField = ({ label, name, type = "text", icon, ...props }) => (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={form[name] || ""}
                    onChange={handleChange}
                    className={`w-full border border-gray-300 rounded-lg py-2.5 ${
                        icon ? "pl-10 pr-3" : "px-3"
                    } bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    {...props}
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl transform transition-all animate-slideUp">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <FaUserCircle className="text-orange-500 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Edit User</h2>
                            <p className="text-sm text-gray-500">Update user information</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-6 pt-4 border-b border-gray-200">
                    <TabButton id="basic" label="Basic Info" icon={<FaUser size={14} />} />
                    <TabButton id="personal" label="Personal" icon={<FaAddressCard size={14} />} />
                    <TabButton id="employee" label="Employment" icon={<FaBriefcase size={14} />} />
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
                        {activeTab === "basic" && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="Full Name"
                                        name="name"
                                        icon={<FaUser size={14} />}
                                        placeholder="Enter full name"
                                    />
                                    <InputField
                                        label="Username"
                                        name="username"
                                        icon={<FaUserTag size={14} />}
                                        placeholder="Enter username"
                                    />
                                    <InputField
                                        label="Mobile Number"
                                        name="mobileNumber"
                                        icon={<FaPhone size={14} />}
                                        placeholder="Enter mobile number"
                                    />
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Role
                                        </label>
                                        <Select
                                            value={form.role || ""}
                                            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                                            options={[
                                                { value: "admin", label: "Admin" },
                                                { value: "staff", label: "Staff" },
                                                { value: "supervisor", label: "Supervisor" },
                                                { value: "subcontractor", label: "Subcontractor" },
                                                { value: "labour", label: "Labour" },
                                            ]}
                                            icon={<FaUserTie size={14} />}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Project
                                        </label>
                                        <Select
                                            value={form.project?._id || form.project || ""}
                                            onChange={(e) => setForm((prev) => ({ ...prev, project: e.target.value }))}
                                            placeholder="Select Project"
                                            options={projects.map((p) => ({ value: p._id, label: p.name }))}
                                            icon={<FaBuilding size={14} />}
                                        />
                                    </div>
                                </div>

                                {/* Assigned Branches */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Assigned Branches
                                    </label>
                                    <div className="flex flex-wrap gap-2 border border-gray-300 rounded-lg p-3 min-h-[50px] bg-gray-50">
                                        {(form.assignedBranches || []).map((branchItem) => {
                                            const branchId = typeof branchItem === "object" ? branchItem._id : branchItem;
                                            const branch = branches.find((b) => b._id === branchId);
                                            return (
                                                <span
                                                    key={branchId}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors"
                                                >
                                                    <FaMapMarkerAlt size={12} />
                                                    {branch?.name || "Unknown Branch"}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                assignedBranches: prev.assignedBranches.filter(
                                                                    (b) => (typeof b === "object" ? b._id : b) !== branchId
                                                                ),
                                                            }))
                                                        }
                                                        className="ml-1 hover:text-orange-900 font-bold"
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </span>
                                            );
                                        })}

                                        <Select
                                            value=""
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (!value) return;
                                                setForm((prev) => ({
                                                    ...prev,
                                                    assignedBranches: [...(prev.assignedBranches || []), value],
                                                }));
                                            }}
                                            placeholder="+ Add Branch"
                                            options={branches
                                                .filter(
                                                    (b) =>
                                                        !(form.assignedBranches || []).some(
                                                            (id) => id === b._id || id._id === b._id
                                                        )
                                                )
                                                .map((b) => ({ value: b._id, label: b.name }))}
                                            icon={<FaMapMarkerAlt size={14} />}
                                            className="flex-1 min-w-[200px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "personal" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Personal Email"
                                    name="personalEmail"
                                    type="email"
                                    icon={<FaEnvelope size={14} />}
                                    placeholder="email@example.com"
                                />
                                <InputField
                                    label="Date of Birth"
                                    name="dateOfBirth"
                                    type="date"
                                    icon={<FaCalendarAlt size={14} />}
                                    value={form.dateOfBirth?.split("T")[0] || ""}
                                />
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Marital Status
                                    </label>
                                    <Select
                                        value={form.maritalStatus || ""}
                                        onChange={(e) => setForm((prev) => ({ ...prev, maritalStatus: e.target.value }))}
                                        options={[
                                            { value: "single", label: "Single" },
                                            { value: "married", label: "Married" },
                                            { value: "other", label: "Other" },
                                        ]}
                                    />
                                </div>

                                <InputField
                                    label="Aadhaar Number"
                                    name="aadhaarNumber"
                                    icon={<FaIdCard size={14} />}
                                    placeholder="XXXX-XXXX-XXXX"
                                />
                                <InputField
                                    label="PAN Number"
                                    name="panNumber"
                                    icon={<FaIdCard size={14} />}
                                    placeholder="ABCDE1234F"
                                />
                                <InputField
                                    label="Driving License"
                                    name="drivingLicense"
                                    icon={<FaIdCard size={14} />}
                                    placeholder="DL Number"
                                />

                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={form.address || ""}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Enter complete address"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <InputField
                                        label="Emergency Contact"
                                        name="emergencyContact"
                                        icon={<FaPhone size={14} />}
                                        placeholder="Emergency contact number"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "employee" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Employee Type
                                    </label>
                                    <Select
                                        value={form.employeeType || ""}
                                        onChange={(e) => setForm((prev) => ({ ...prev, employeeType: e.target.value }))}
                                        options={[
                                            { value: "permanent", label: "Permanent" },
                                            { value: "contract", label: "Contract" },
                                            { value: "intern", label: "Intern" },
                                            { value: "consultant", label: "Consultant" },
                                        ]}
                                        icon={<FaBriefcase size={14} />}
                                    />
                                </div>

                                <InputField
                                    label="Employee ID"
                                    name="employeeId"
                                    icon={<FaIdCard size={14} />}
                                    placeholder="EMP-001"
                                />
                                <InputField
                                    label="Department"
                                    name="department"
                                    icon={<FaBuilding size={14} />}
                                    placeholder="e.g., Engineering"
                                />
                                <InputField
                                    label="Job Title"
                                    name="jobTitle"
                                    icon={<FaUserTie size={14} />}
                                    placeholder="e.g., Senior Developer"
                                />
                                <InputField
                                    label="Date of Joining"
                                    name="dateOfJoining"
                                    type="date"
                                    icon={<FaCalendarAlt size={14} />}
                                    value={form.dateOfJoining?.split("T")[0] || ""}
                                />
                                <InputField
                                    label="Date of Leaving"
                                    name="dateOfLeaving"
                                    type="date"
                                    icon={<FaCalendarAlt size={14} />}
                                    value={form.dateOfLeaving?.split("T")[0] || ""}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors shadow-md hover:shadow-lg"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;