import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const ProfileScreen = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    jobTitle: '',
    project: '',
    role: '',
    assignedBranches: [],
  });

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchBranches();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/users/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const {
        name = '',
        email = '',
        mobileNumber = '',
        jobTitle = '',
        project = '',
        role = '',
        assignedBranches = [],
      } = res.data;

      setFormData({
        name,
        email,
        mobileNumber,
        jobTitle,
        project: project?._id || '',
        role,
        assignedBranches: assignedBranches.filter(Boolean),
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to load user', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBranches(res.data);
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData };
      if (!payload.project) delete payload.project;

      await axios.put('/users/me', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Profile updated successfully');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    }
  };

  const filteredBranches = query === ''
    ? branches
    : branches.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));

  if (loading && !formData.name) return <p className="text-center p-4">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto p-4 w-full max-w-screen-sm">
      <button
        className="absolute top-4 right-4 text-white text-sm bg-orange-500 px-2 py-1 rounded"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-800">My Profile</h2>

      <div className="grid gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Mobile Number"
          value={formData.mobileNumber || ''}
          onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Job Title"
          value={formData.jobTitle || ''}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
        />
        <input
          className="border p-2 rounded bg-gray-100 cursor-not-allowed text-gray-600"
          placeholder="Role"
          value={formData.role || ''}
          disabled
        />

        {/* Multi-select for Assigned Branches */}
        <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Branches</label>
  <div className="mt-2 flex flex-wrap gap-2">
  {(formData.assignedBranches || []).length > 0 ? (
    formData.assignedBranches.map((b) => {
      const branch =
        typeof b === 'string'
          ? branches.find((br) => String(br._id) === b)
          : b;

      return branch ? (
        <span
          key={branch._id}
          className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-sm"
        >
          {branch.name}
        </span>
      ) : null;
    })
  ) : (
    <p className="text-sm italic text-gray-500">No branches assigned</p>
  )}
</div>



</div>


        <button
          onClick={handleSubmit}
          className="bg-orange-500 text-white py-2 px-4 rounded shadow hover:bg-orange-600"
        >
          Save Profile
        </button>
      </div>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />

    </div>
  );
};

export default ProfileScreen;
