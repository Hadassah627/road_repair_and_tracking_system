import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Get selected role from localStorage if coming from role card
  const [selectedRole, setSelectedRole] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    area: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for selected role on mount
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
      setFormData(prev => ({ ...prev, role: role }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      mayor: '🏛️'
    };
    return icons[role] || '🔐';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);

    if (result.success) {
      // Clear selected role from localStorage after successful registration
      localStorage.removeItem('selectedRole');
      
      // Redirect to role-specific dashboard
      const userRole = formData.role;
      const dashboardRoutes = {
        resident: '/resident/dashboard',
        clerk: '/clerk/dashboard',
        supervisor: '/supervisor/dashboard',
        administrator: '/admin/dashboard',
        mayor: '/mayor/dashboard'
      };
      
      navigate(dashboardRoutes[userRole] || '/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
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
            <div className="text-6xl mb-3">
              {getRoleIcon(selectedRole)}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedRole ? `${getRoleDisplayName(selectedRole)} Registration` : 'Create Account'}
          </h1>
          <p className="text-gray-600 mt-2">
            {selectedRole 
              ? `Register as a ${selectedRole}`
              : 'Join the RRTS platform'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="w-full px-4 py-2 border-2 border-blue-300 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-gray-800 font-medium flex items-center">
                <span className="text-2xl mr-2">{getRoleIcon(selectedRole)}</span>
                {getRoleDisplayName(selectedRole)}
              </span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Selected</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Role selected from landing page (cannot be changed)
            </p>
          </div>

          {formData.role === 'supervisor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area *
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your area"
              />
            </div>
          )}

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
