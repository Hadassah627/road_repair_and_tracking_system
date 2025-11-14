import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { complaintsAPI } from '../services/api';
import { FiPlus, FiMapPin, FiEye, FiUser, FiPhone, FiMail, FiX } from 'react-icons/fi';

const ResidentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [formData, setFormData] = useState({
    roadName: '',
    location: { address: '' },
    description: '',
    areaType: 'residential',
    severity: 'low',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

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
      if (formData.image) {
        // If there's an image, use FormData
        const submitData = new FormData();
        submitData.append('roadName', formData.roadName);
        submitData.append('location[address]', formData.location.address);
        submitData.append('description', formData.description);
        submitData.append('areaType', formData.areaType);
        submitData.append('severity', formData.severity);
        submitData.append('image', formData.image);

        await complaintsAPI.create(submitData);
      } else {
        // If no image, send as JSON
        const submitData = {
          roadName: formData.roadName,
          location: {
            address: formData.location.address
          },
          description: formData.description,
          areaType: formData.areaType,
          severity: formData.severity
        };

        await complaintsAPI.create(submitData);
      }

      alert('Complaint submitted successfully!');
      setShowModal(false);
      setFormData({
        roadName: '',
        location: { address: '' },
        description: '',
        areaType: 'residential',
        severity: 'low',
        image: null,
      });
      setImagePreview(null);
      fetchComplaints();
    } catch (error) {
      console.error('Error creating complaint:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit complaint. Please try again.';
      alert(errorMessage);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setFormData({ ...formData, image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleViewDetails = async (complaint) => {
    try {
      // Fetch full complaint details including supervisor info
      const response = await complaintsAPI.getOne(complaint._id);
      setSelectedComplaint(response.data.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      alert('Failed to load complaint details');
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
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Severity',
      render: (row) => <SeverityBadge severity={row.severity} />,
    },
    {
      header: 'Date Raised',
      render: (row) => new Date(row.dateRaised).toLocaleDateString(),
    },
    {
      header: 'Scheduled',
      render: (row) => row.dateScheduled ? (
        <span className="text-green-600 font-medium">
          {new Date(row.dateScheduled).toLocaleDateString()}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <FiEye />
          <span>Details</span>
        </button>
      ),
    },
  ];

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    inProgress: complaints.filter((c) => c.status === 'in-progress').length,
    completed: complaints.filter((c) => c.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Resident Dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-gray-600 mt-2">Total Complaints</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-gray-600 mt-2">Pending</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.inProgress}</p>
              <p className="text-gray-600 mt-2">In Progress</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-gray-600 mt-2">Completed</p>
            </div>
          </Card>
        </div>

        {/* Complaints Table */}
        <Card
          title="My Complaints"
          actions={
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus />
              <span>Submit New Complaint</span>
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

      {/* New Complaint Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setImagePreview(null);
        }}
        title="Submit New Complaint"
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
              Location *
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
              Severity *
            </label>
            <select
              required
              value={formData.severity}
              onChange={(e) =>
                setFormData({ ...formData, severity: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
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
              placeholder="Describe the road issue in detail"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image of Damaged Road *
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500">
                Accepted formats: JPG, PNG, GIF (Max size: 5MB)
              </p>
              
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-48 rounded-lg border-2 border-gray-300 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div>
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
              Submit Complaint
            </button>
          </div>
        </form>
      </Modal>

      {/* Complaint Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Complaint Details"
        size="lg"
      >
        {selectedComplaint && (
          <div className="space-y-4">
            {/* Basic Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Complaint Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Complaint ID:</p>
                  <p className="font-medium">{selectedComplaint.complaintId}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <StatusBadge status={selectedComplaint.status} />
                </div>
                <div>
                  <p className="text-gray-600">Road Name:</p>
                  <p className="font-medium">{selectedComplaint.roadName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Severity:</p>
                  <SeverityBadge severity={selectedComplaint.severity} />
                </div>
                <div>
                  <p className="text-gray-600">Date Raised:</p>
                  <p className="font-medium">{new Date(selectedComplaint.dateRaised).toLocaleDateString()}</p>
                </div>
                {selectedComplaint.dateScheduled && (
                  <div>
                    <p className="text-gray-600">Scheduled Date:</p>
                    <p className="font-medium text-green-600">
                      {new Date(selectedComplaint.dateScheduled).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-gray-600">Location:</p>
                <p className="font-medium">{selectedComplaint.location?.address}</p>
              </div>
              <div className="mt-3">
                <p className="text-gray-600">Description:</p>
                <p className="font-medium">{selectedComplaint.description}</p>
              </div>
            </div>

            {/* Supervisor Details (if scheduled) */}
            {selectedComplaint.status === 'scheduled' && selectedComplaint.scheduledBy && (
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-green-800 flex items-center">
                  <FiUser className="mr-2" />
                  ✅ Scheduled Successfully! - Supervisor Contact Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <FiUser className="mr-2 text-gray-600" />
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedComplaint.scheduledBy.name}</span>
                  </div>
                  <div className="flex items-center">
                    <FiMail className="mr-2 text-gray-600" />
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedComplaint.scheduledBy.email}</span>
                  </div>
                  {selectedComplaint.scheduledBy.phone && (
                    <div className="flex items-center">
                      <FiPhone className="mr-2 text-gray-600" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{selectedComplaint.scheduledBy.phone}</span>
                    </div>
                  )}
                </div>
                {selectedComplaint.assignedSupportPerson && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-gray-600 text-sm font-semibold mb-2">🔧 Assigned Support Person:</p>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{selectedComplaint.assignedSupportPerson.name}</p>
                      <p className="text-gray-600">{selectedComplaint.assignedSupportPerson.email}</p>
                      {selectedComplaint.assignedSupportPerson.phone && (
                        <p className="text-gray-600">{selectedComplaint.assignedSupportPerson.phone}</p>
                      )}
                    </div>
                  </div>
                )}
                {selectedComplaint.supervisorNotes && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-gray-600 text-sm">Supervisor Notes:</p>
                    <p className="text-sm font-medium mt-1">{selectedComplaint.supervisorNotes}</p>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-gray-600">
                    📞 You can contact the supervisor above for any queries or updates regarding your complaint.
                  </p>
                </div>
              </div>
            )}

            {/* Pending Status */}
            {selectedComplaint.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⏳ Your complaint is pending review by our team. You will be notified once it is scheduled.
                </p>
              </div>
            )}

            {/* In Progress Status */}
            {selectedComplaint.status === 'in-progress' && (
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-blue-800 flex items-center">
                  <FiUser className="mr-2" />
                  🚧 Work In Progress!
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Our team is currently working on resolving your complaint.
                </p>
                {selectedComplaint.assignedSupportPerson && (
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">🔧 Support Person Working:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <FiUser className="mr-2 text-gray-600" />
                        <span className="font-medium">{selectedComplaint.assignedSupportPerson.name}</span>
                      </div>
                      <div className="flex items-center">
                        <FiMail className="mr-2 text-gray-600" />
                        <span>{selectedComplaint.assignedSupportPerson.email}</span>
                      </div>
                      {selectedComplaint.assignedSupportPerson.phone && (
                        <div className="flex items-center">
                          <FiPhone className="mr-2 text-gray-600" />
                          <span>{selectedComplaint.assignedSupportPerson.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedComplaint.scheduledBy && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-gray-600">Supervisor: {selectedComplaint.scheduledBy.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      📞 Contact for updates: {selectedComplaint.scheduledBy.email}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Completed Status */}
            {selectedComplaint.status === 'completed' && (
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-green-800 flex items-center">
                  <FiUser className="mr-2" />
                  ✅ Complaint Resolved!
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  Your complaint has been successfully resolved. Thank you for your patience!
                </p>
                {selectedComplaint.dateCompleted && (
                  <p className="text-sm text-gray-600 mb-3">
                    Completed on: {new Date(selectedComplaint.dateCompleted).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                {selectedComplaint.assignedSupportPerson && (
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">🔧 Work Completed By:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <FiUser className="mr-2 text-gray-600" />
                        <span className="font-medium">{selectedComplaint.assignedSupportPerson.name}</span>
                      </div>
                      <div className="flex items-center">
                        <FiMail className="mr-2 text-gray-600" />
                        <span>{selectedComplaint.assignedSupportPerson.email}</span>
                      </div>
                      {selectedComplaint.assignedSupportPerson.phone && (
                        <div className="flex items-center">
                          <FiPhone className="mr-2 text-gray-600" />
                          <span>{selectedComplaint.assignedSupportPerson.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedComplaint.scheduledBy && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm text-gray-600">Supervised by: {selectedComplaint.scheduledBy.name}</p>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-gray-600">
                    💚 Thank you for reporting this issue and helping us maintain our roads!
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResidentDashboard;
