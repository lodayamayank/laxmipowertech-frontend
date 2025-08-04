// --- frontend/pages/CreateProject.jsx ---
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import DashboardLayout from '../layouts/DashboardLayout';

const CreateProject = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    radius: '',
  });
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem('token');

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`/api/projects/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/projects', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormData({ name: '', address: '', lat: '', lng: '', radius: '' });
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      console.error('Failed to save project', err);
    }
  };

  const handleEdit = (project) => {
    setFormData(project);
    setEditingId(project._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      try {
        await axios.delete(`/api/projects/${id}`, {
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
              placeholder="Enter Branch Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Radius (in metres)"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Latitude"
              value={formData.lat}
              onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Longitude"
              value={formData.lng}
              onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            />
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
                <th className="border p-2 text-black">Radius</th>
                <th className="border p-2 text-black">Lat/Lng</th>
                <th className="border p-2 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr key={proj._id}>
                  <td className="border p-2 text-black">{proj.name}</td>
                  <td className="border p-2 text-black">{proj.address}</td>
                  <td className="border p-2 text-black">{proj.radius}</td>
                  <td className="border p-2 text-black">{proj.lat}, {proj.lng}</td>
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
