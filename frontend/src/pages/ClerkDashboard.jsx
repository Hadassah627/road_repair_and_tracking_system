import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import { complaintsAPI } from '../services/api';
import { FiPlus } from 'react-icons/fi';

const ClerkDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    roadName: '',
    location: { address: '' },
    description: '',
    areaType: 'residential',
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintsAPI.getAll();
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await complaintsAPI.create(formData);
      setShowModal(false);
      setFormData({
        roadName: '',
        location: { address: '' },
        description: '',
        areaType: 'residential',
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error creating complaint:', error);
      alert('Failed to enter complaint');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'complaintId' },
    { header: 'Road Name', accessor: 'roadName' },
    { 
      header: 'Location', 
      render: (row) => row.location?.address 
    },
    {
      header: 'Area Type',
      accessor: 'areaType',
      render: (row) => (
        <span className="capitalize">{row.areaType}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Date Raised',
      render: (row) => new Date(row.dateRaised).toLocaleDateString(),
    },
  ];

  const stats = {
    today: complaints.filter(
      (c) =>
        new Date(c.dateRaised).toDateString() === new Date().toDateString()
    ).length,
    thisWeek: complaints.filter((c) => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(c.dateRaised) >= oneWeekAgo;
    }).length,
    total: complaints.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Clerk Dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.today}</p>
              <p className="text-gray-600 mt-2">Entries Today</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.thisWeek}</p>
              <p className="text-gray-600 mt-2">This Week</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.total}</p>
              <p className="text-gray-600 mt-2">Total Entries</p>
            </div>
          </Card>
        </div>

        {/* Complaints Table */}
        <Card
          title="All Complaints"
          actions={
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus />
              <span>Enter New Complaint</span>
            </button>
          }
        >
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table columns={columns} data={complaints} />
          )}
        </Card>
      </div>

      {/* New Complaint Entry Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Enter New Complaint"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Road Name *
            </label>
            <input
              type="text"
              required
              value={formData.roadName}
              onChange={(e) =>
                setFormData({ ...formData, roadName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter road name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Address *
            </label>
            <input
              type="text"
              required
              value={formData.location.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { address: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Type *
            </label>
            <select
              required
              value={formData.areaType}
              onChange={(e) =>
                setFormData({ ...formData, areaType: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="busy">Busy</option>
              <option value="deserted">Deserted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Description *
            </label>
            <textarea
              required
              rows="4"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter complaint details from phone/written form"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClerkDashboard;
