import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get selected role from localStorage
  React.useEffect(() => {
    const role = localStorage.getItem('selectedRole');
    if (!role) {
      // No role selected, redirect to landing page
      setError('Please select a role from the landing page');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setSelectedRole(role);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate role if selected from landing page
    if (selectedRole) {
      // You can add role validation here if needed
      console.log(`Attempting to login as: ${selectedRole}`);
    }

    const result = await login(formData);

    if (result.success) {
      // Check if user's role matches selected role (validation)
      if (selectedRole && result.user && result.user.role !== selectedRole) {
        setError(`Please login with ${selectedRole} credentials`);
        setLoading(false);
        return;
      }
      
      // Clear selected role from localStorage after successful login
      localStorage.removeItem('selectedRole');
      
      // Redirect to role-specific dashboard
      const userRole = result.user.role;
      const dashboardRoutes = {
        resident: '/resident/dashboard',
        clerk: '/clerk/dashboard',
        supervisor: '/supervisor/dashboard',
        administrator: '/admin/dashboard',
        mayor: '/mayor/dashboard',
        support: '/support/dashboard'
      };
      
      navigate(dashboardRoutes[userRole] || '/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  // Helper function to capitalize role name
  const getRoleDisplayName = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get role icon
  const getRoleIcon = (role) => {
    const icons = {
      resident: '👤',
      clerk: '📝',
      supervisor: '👷',
      administrator: '⚙️',
      mayor: '🏛️',
      support: '🔧'
    };
    return icons[role] || '🔐';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 border-2 border-violet-500">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-all duration-200 hover:translate-x-[-4px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home
        </button>

        <div className="text-center mb-8">
          {selectedRole && (
            <div className="text-6xl mb-3 transition-transform duration-300 hover:scale-110">
              {getRoleIcon(selectedRole)}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedRole ? `${getRoleDisplayName(selectedRole)} Login` : 'RRTS Login'}
          </h1>
          <p className="text-gray-600 mt-2">
            {selectedRole 
              ? `Sign in to your ${selectedRole} account`
              : 'Road Repair & Tracking System'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 hover:shadow-lg transform hover:scale-[1.02]"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
