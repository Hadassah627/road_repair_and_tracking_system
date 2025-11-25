import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RRTS</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Welcome to RRTS
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Road Repair and
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
              Tracking System
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform for managing and tracking road repair complaints,
            scheduling maintenance work, and ensuring efficient communication between
            residents and municipal authorities.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <span className="text-3xl">🛣️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Report Issues
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Residents can easily report road damage and track complaint status in real-time.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Schedule Repairs
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Municipal staff can efficiently schedule and manage repair work with resource allocation.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Track Progress
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor repair progress, generate reports, and ensure transparency in operations.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              Get Started Today
            </button>
            <button
              onClick={() => {
                document.getElementById('roles-section').scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 text-lg font-semibold rounded-xl hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
            >
              Explore Roles
            </button>
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div id="roles-section" className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
              Choose Your Role
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Designed for Every Role
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tailored features and dashboards for different user types. Select your role to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Resident Card */}
            <div 
              onClick={() => {
                localStorage.setItem('selectedRole', 'resident');
                navigate('/login');
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-blue-500 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                Resident
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Report road issues, track complaint status, and receive updates on repairs in your area.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 text-lg">✓</span>
                  Submit complaints with photos
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 text-lg">✓</span>
                  Track complaint status
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 text-lg">✓</span>
                  View repair schedules
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md group-hover:shadow-xl">
                Login as Resident
              </button>
            </div>

            {/* Clerk Card */}
            <div 
              onClick={() => {
                localStorage.setItem('selectedRole', 'clerk');
                navigate('/login');
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-purple-500 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                Clerk
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Manage incoming complaints, verify information, and coordinate with supervisors.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2 text-lg">✓</span>
                  Review and validate complaints
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2 text-lg">✓</span>
                  Update complaint status
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2 text-lg">✓</span>
                  Communicate with residents
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-md group-hover:shadow-xl">
                Login as Clerk
              </button>
            </div>

            {/* Supervisor Card */}
            <div 
              onClick={() => {
                localStorage.setItem('selectedRole', 'supervisor');
                navigate('/login');
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-orange-500 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-4xl">👷</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-orange-600 transition-colors">
                Supervisor
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Oversee repair operations, assign resources, and monitor field work progress.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2 text-lg">✓</span>
                  Assign repair tasks
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2 text-lg">✓</span>
                  Manage work schedules
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2 text-lg">✓</span>
                  Track resource allocation
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold shadow-md group-hover:shadow-xl">
                Login as Supervisor
              </button>
            </div>

            {/* Administrator Card */}
            <div 
              onClick={() => {
                localStorage.setItem('selectedRole', 'administrator');
                navigate('/login');
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-teal-500 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-4xl">⚙️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors">
                Administrator
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Manage system settings, user accounts, and oversee all operational aspects.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2 text-lg">✓</span>
                  User management
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2 text-lg">✓</span>
                  System configuration
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2 text-lg">✓</span>
                  Access control
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-md group-hover:shadow-xl">
                Login as Administrator
              </button>
            </div>

            {/* Mayor Card */}
            <div 
              onClick={() => {
                localStorage.setItem('selectedRole', 'mayor');
                navigate('/login');
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-amber-500 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-4xl">🏛️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-amber-600 transition-colors">
                Mayor
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Access comprehensive reports, analytics, and oversee city-wide road maintenance.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2 text-lg">✓</span>
                  View analytics & reports
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2 text-lg">✓</span>
                  Monitor city-wide operations
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2 text-lg">✓</span>
                  Strategic decision making
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-3 rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-all duration-300 font-semibold shadow-md group-hover:shadow-xl">
                Login as Mayor
              </button>
            </div>

            {/* Support Person Card */}
            <div 
              onClick={() => {
                localStorage.setItem('selectedRole', 'support');
                navigate('/login');
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-indigo-500 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-4xl">🔧</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors">
                Support Person
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Execute assigned repair tasks, update work status, and coordinate with supervisors.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 text-lg">✓</span>
                  View assigned work tasks
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 text-lg">✓</span>
                  Update work status
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 text-lg">✓</span>
                  Communicate with supervisors
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 font-semibold shadow-md group-hover:shadow-xl">
                Login as Support Person
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <span className="text-2xl font-bold">RRTS</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering communities with efficient road repair management and transparent tracking systems.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>📧 support@rrts.com</li>
                <li>📞 +1 (555) 123-4567</li>
                <li>📍 City Municipal Office</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Road Repair and Tracking System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
