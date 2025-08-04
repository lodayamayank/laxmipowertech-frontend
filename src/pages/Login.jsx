import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import logo from "../assets/logo.png";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/login', { username, password });
      const data = res.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem("user", JSON.stringify({ ...data.user, _id: data.user.id || data.user._id }));

      localStorage.setItem('loginTime', Date.now());

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <img src={logo} alt="Laxmi Powertech" className="w-80 mb-6" />

      <form onSubmit={handleLogin} className="flex flex-col w-full max-w-md mx-auto align-center">
        <h2 className="text-center text-md font-bold text-gray-800 mb-6 tracking-wide">
          LOGIN TO YOUR ACCOUNT
        </h2>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-2 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
          required
        />

        <div className="text-right text-sm text-gray-600 mb-6">
          <a href="#" className="hover:underline">Forgot Password?</a>
        </div>

        <button
          type="submit"
          className="w-80 mb-3 align-center bg-orange-500 text-white font-bold py-2 rounded-full shadow-md hover:bg-orange-600 transition"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'LOG IN'}
        </button>

        {/* <button
          type="button"
          className="w-80 bg-orange-500 text-white font-bold py-2 rounded-full shadow-md hover:bg-orange-600 transition"
          onClick={() => alert('Staff login pending functionality')}
        >
          STAFF LOG IN
        </button> */}
      </form>
    </div>
  );
};

export default Login;
