import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";

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

    const TabButton = ({ id, label }) => (
        <button
            className={`px-3 py-1 rounded-t-md text-sm font-medium ${activeTab === id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            onClick={() => setActiveTab(id)}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-3xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Edit User</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b mb-4">
                    <TabButton id="basic" label="Basic Info" />
                    <TabButton id="personal" label="Personal Details" />
                    <TabButton id="employee" label="Employee Details" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto">
                    {activeTab === "basic" && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Name</label>
                                    <input name="name" value={form.name || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Username</label>
                                    <input name="username" value={form.username || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                                    <input name="mobileNumber" value={form.mobileNumber || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Role</label>
                                    <select name="role" value={form.role || ""} onChange={handleChange} className="input">
                                        <option value="admin">Admin</option>
                                        <option value="staff">Staff</option>
                                        <option value="supervisor">Supervisor</option>
                                        <option value="subcontractor">Subcontractor</option>
                                        <option value="labour">Labour</option>
                                    </select>
                                </div>
                                {/* Project Dropdown */}
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Project</label>
                                    <select
                                        name="project"
                                        value={form.project?._id || form.project || ""}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, project: e.target.value }))
                                        }
                                        className="input"
                                    >
                                        <option value="">Select Project</option>
                                        {projects.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Multi-Branch Select (tag-style) */}
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-600">Assigned Branches</label>
                                    <div className="flex flex-wrap gap-2 border rounded p-2 min-h-[42px]">
                                    {(form.assignedBranches || []).map((branchItem) => {
  const branchId = typeof branchItem === "object" ? branchItem._id : branchItem;
  const branch = branches.find((b) => b._id === branchId);
  return (
    <span
      key={branchId}
      className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs flex items-center gap-1"
    >
      {branch?.name || "Unknown Branch"}
      <button
        type="button"
        onClick={() =>
          setForm((prev) => ({
            ...prev,
            assignedBranches: prev.assignedBranches.filter(
              (b) =>
                (typeof b === "object" ? b._id : b) !== branchId
            ),
          }))
        }
        className="text-orange-700 font-bold ml-1"
      >
        ×
      </button>
    </span>
  );
})}

                                        <select
                                            className="text-sm outline-none"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (!value) return;
                                                setForm((prev) => ({
                                                    ...prev,
                                                    assignedBranches: [...(prev.assignedBranches || []), value],
                                                }));
                                                e.target.value = "";
                                            }}
                                        >
                                            <option value="">+ Add Branch</option>
                                            {branches
                                                .filter(
                                                    (b) =>
                                                        !(form.assignedBranches || []).some(
                                                            (id) => id === b._id || id._id === b._id
                                                        )
                                                )
                                                .map((b) => (
                                                    <option key={b._id} value={b._id}>
                                                        {b.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                            </div>
                        </>
                    )}

                    {activeTab === "personal" && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Personal Email</label>
                                    <input name="personalEmail" value={form.personalEmail || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                                    <input type="date" name="dateOfBirth" value={form.dateOfBirth?.split("T")[0] || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Marital Status</label>
                                    <select name="maritalStatus" value={form.maritalStatus || ""} onChange={handleChange} className="input">
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Aadhaar Number</label>
                                    <input name="aadhaarNumber" value={form.aadhaarNumber || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">PAN Number</label>
                                    <input name="panNumber" value={form.panNumber || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Driving License</label>
                                    <input name="drivingLicense" value={form.drivingLicense || ""} onChange={handleChange} className="input" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-600">Address</label>
                                    <textarea name="address" value={form.address || ""} onChange={handleChange} className="input" rows={2}></textarea>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                                    <input name="emergencyContact" value={form.emergencyContact || ""} onChange={handleChange} className="input" />
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "employee" && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Employee Type</label>
                                    <select name="employeeType" value={form.employeeType || ""} onChange={handleChange} className="input">
                                        <option value="permanent">Permanent</option>
                                        <option value="contract">Contract</option>
                                        <option value="intern">Intern</option>
                                        <option value="consultant">Consultant</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Employee ID</label>
                                    <input name="employeeId" value={form.employeeId || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Department</label>
                                    <input name="department" value={form.department || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Job Title</label>
                                    <input name="jobTitle" value={form.jobTitle || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Date of Joining</label>
                                    <input type="date" name="dateOfJoining" value={form.dateOfJoining?.split("T")[0] || ""} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Date of Leaving</label>
                                    <input type="date" name="dateOfLeaving" value={form.dateOfLeaving?.split("T")[0] || ""} onChange={handleChange} className="input" />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
