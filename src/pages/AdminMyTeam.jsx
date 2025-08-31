import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import axios from '../utils/axios';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AdminMyTeam = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterRole, setFilterRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    // email: '',
    password: 'default123',
    contact: '',
    role: 'labour',
    assignedBranches: [],
  });
  const [roleOptions, setRoleOptions] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchBranches();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res.data);
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoleOptions(res.data);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.username || !formData.role) {
        alert("Please fill required fields (name, username, role)");
        return;
      }
  
      // Clone formData
      const payload = { ...formData };
  
      if (editId) {
        // ✅ Update existing user
        if (!formData.password || formData.password.trim() === "") {
          // Don’t send password if empty → keep existing one
          delete payload.password;
        } else {
          payload.password = formData.password.trim();
        }
      } else {
        // ✅ Create new user
        if (!payload.password || payload.password.trim() === "") {
          // Don’t send empty string → backend will fallback to "default123"
          delete payload.password;
        }
      }
  
      if (!editId) delete payload.project;
  
      if (editId) {
        await axios.put(`/users/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditId(null);
      } else {
        await axios.post(`/users/register`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
  
      // Reset form
      setFormData({
        name: "",
        username: "",
        password: "",
        contact: "",
        role: "labour",
        assignedBranches: [],
      });
  
      fetchUsers();
    } catch (err) {
      console.error("Error submitting form", err?.response?.data || err.message);
      alert(`Error: ${err?.response?.data?.message || err.message}`);
    }
  };
  
  
  

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      username: user.username,
      password: '', // clear password for security
      contact: user.contact || '',
      role: user.role,
      assignedBranches: user.assignedBranches?.map((b) => b._id) || [],
      project: user.project?._id || '',
    });
    setEditId(user._id);
    setShowPasswordField(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const filteredUsers = users.filter((user) =>
    (!filterRole || user.role === filterRole) &&
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const handleResetPassword = async (username) => {
    if (!window.confirm(`Reset password for ${username} to default123?`)) return;
    try {
      await axios.post(`/users/reset-password/${username}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Password reset for ${username} to default123`);
    } catch (err) {
      console.error('Failed to reset password', err);
      alert('Error resetting password');
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-black">My Team</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />


          {editId ? (
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-black" >
                <input
                  type="checkbox"
                  checked={showPasswordField}
                  onChange={() => setShowPasswordField(!showPasswordField)}
                  className="mr-2 p-10"
                />
                Change Password
              </label>

              {showPasswordField && (
                <div className="relative">
                  <input
                    className="border p-2 rounded w-full pr-10"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <input
                className="border p-2 rounded w-full pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          )}


          <input
            className="border p-2 rounded"
            placeholder="Contact"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            {Array.isArray(roleOptions) &&
              roleOptions.map((r) => {
                const role = typeof r === 'string' ? r : r.role || '';
                return (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                );
              })}

          </select>
          <br></br>
          {/* Only show project if editing */}
          {/* {editId && (
            <select
              className="border p-2 rounded"
              value={formData.project || ''}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            >
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name}
                </option>
              ))}
            </select>
          )} */}

          {/* Multi-select branches */}
          {formData.role !== 'admin' && (
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Branches</label>
              <select
                multiple
                value={formData.assignedBranches}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignedBranches: Array.from(e.target.selectedOptions, (opt) => opt.value),
                  })
                }
                className="w-full border p-2 rounded h-40"
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Cmd on Mac) to select multiple.</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editId ? 'Update User' : 'Add User'}
          </button>

          <button
            onClick={() => {
              setEditId(null);
              setFormData({
                name: '',
                email: '',
                password: '',
                contact: '',
                role: 'labour',
                assignedBranches: [],
              });
              setShowPasswordField(false);
              setShowPassword(false);
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <select
            className="border p-2 rounded"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by name or username"
            className="border p-2 rounded flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-black">Name</th>
                <th className="border p-2 text-black">Username</th>
                <th className="border p-2 text-black">Contact</th>

                <th className="border p-2 text-black">Role</th>
                {/* <th className="border p-2 text-black">Project</th> */}
                <th className="border p-2 text-black">Branches</th>
                <th className="border p-2 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="border p-2 text-black">{user.name}</td>
                  <td className="border p-2 text-black">{user.username}</td>
                  <td className="border p-2 text-black">{user.contact}</td>
                  <td className="border p-2 text-black">{user.role}</td>
                  {/* <td className="border p-2 text-black">{user.project?.name || '—'}</td> */}
                  <td className="border p-2 text-black">
                    {(user.assignedBranches || []).map((b) => b.name).join(', ') || '—'}
                  </td>
                  <td className="border p-2 text-black">
                    <button
                      className="text-blue-600 mr-2"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleResetPassword(user.username)}
                    >
                      Reset Password
                    </button>
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

export default AdminMyTeam;
