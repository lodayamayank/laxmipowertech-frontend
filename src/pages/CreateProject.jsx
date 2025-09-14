import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import DashboardLayout from '../layouts/DashboardLayout';

const CreateProject = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    branches: [],
  });
  const [projects, setProjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem('token');

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

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`/projects/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/projects', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormData({ name: '', address: '', branches: [] });
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      console.error('Failed to save project', err);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      address: project.address,
      branches: project.branches?.map((b) => b._id) || [],
    });
    setEditingId(project._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      try {
        await axios.delete(`/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProjects();
      } catch (err) {
        console.error('Failed to delete project', err);
      }
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchBranches();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Create New Project</h1>

        <div className="bg-white shadow rounded p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Enter Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Enter Project Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <div>
              <label className="block text-sm font-semibold mb-1 text-black">Assign Branches</label>
              <select
                multiple
                className="border p-2 rounded w-full h-40"
                value={formData.branches}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    branches: Array.from(e.target.selectedOptions, (opt) => opt.value),
                  })
                }
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Cmd on Mac) to select multiple</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-orange-600 text-white px-4 py-2 rounded"
          >
            {editingId ? 'Update' : 'Save'}
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-2 text-black">Project List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-black">Project Name</th>
                <th className="border p-2 text-black">Address</th>
                <th className="border p-2 text-black">Branches</th>
                <th className="border p-2 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr key={proj._id}>
                  <td className="border p-2 text-black">{proj.name}</td>
                  <td className="border p-2 text-black">{proj.address}</td>
                  <td className="border p-2 text-black">
                    {proj.branches?.map((b) => b.name).join(', ') || '—'}
                  </td>
                  <td className="border p-2 flex gap-2">
                    <button className="text-blue-600" onClick={() => handleEdit(proj)}>Edit</button>
                    <button className="text-red-600" onClick={() => handleDelete(proj._id)}>Delete</button>
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

export default CreateProject;
