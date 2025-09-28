import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import axios from '../utils/axios';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    companyName: '',
    contact: '',
    mobile: '',
    office: '',
    email: '',
    gst: '',
    address: '',
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({}); // ✅ track validation errors

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get('/vendors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    }
  };

  // ✅ Validation function
  const validate = () => {
    const newErrors = {};

    if (!formData.mobile) {
      newErrors.mobile = "Mobile No. is required";
    } else if (!/^[0-9]{7,15}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid mobile number (digits only)";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return; // ❌ stop submit if invalid

    try {
      if (editId) {
        await axios.put(`/vendors/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/vendors', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormData({
        companyName: '', contact: '', mobile: '', office: '',
        email: '', gst: '', address: ''
      });
      setEditId(null);
      setErrors({});
      fetchVendors();
    } catch (err) {
      console.error('Failed to submit vendor', err);
    }
  };

  const handleEdit = (vendor) => {
    setFormData(vendor);
    setEditId(vendor._id);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await axios.delete(`/vendors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVendors();
    } catch (err) {
      console.error('Failed to delete vendor', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Manage Vendor</h1>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-black">Company Name</th>
                <th className="border p-2 text-black">Contact</th>
                <th className="border p-2 text-black">Mobile No.</th>
                <th className="border p-2 text-black">Office No.</th>
                <th className="border p-2 text-black">Email</th>
                <th className="border p-2 text-black">GST No.</th>
                <th className="border p-2 text-black">Address</th>
                <th className="border p-2 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id}>
                  <td className="border p-2 text-black">{v.companyName}</td>
                  <td className="border p-2 text-black">{v.contact}</td>
                  <td className="border p-2 text-black">{v.mobile}</td>
                  <td className="border p-2 text-black">{v.office}</td>
                  <td className="border p-2 text-black">{v.email}</td>
                  <td className="border p-2 text-black">{v.gst}</td>
                  <td className="border p-2 text-black">{v.address}</td>
                  <td className="border p-2 text-black">
                    <button className="text-blue-600 mr-2" onClick={() => handleEdit(v)}>Edit</button>
                    <button className="text-red-600" onClick={() => handleDelete(v._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Vendor Form */}
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit Vendor' : '+ Add Vendor'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="border p-2 rounded" placeholder="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />

            <input className="border p-2 rounded" placeholder="Contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />

            <div>
              <input className="border p-2 rounded w-full" placeholder="Mobile No."
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>

            <input className="border p-2 rounded" placeholder="Office No."
              value={formData.office}
              onChange={(e) => setFormData({ ...formData, office: e.target.value })} />

            <div>
              <input className="border p-2 rounded w-full" placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <input className="border p-2 rounded" placeholder="GST No."
              value={formData.gst}
              onChange={(e) => setFormData({ ...formData, gst: e.target.value })} />

            <input className="border p-2 rounded md:col-span-3" placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>
            {editId ? 'Update Vendor' : 'Add Vendor'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminVendors;
