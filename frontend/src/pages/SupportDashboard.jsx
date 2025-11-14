import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { workAssignmentsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiInfo
} from 'react-icons/fi';

const SupportDashboard = () => {
  const { user } = useAuth();
  const [workAssignments, setWorkAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchWorkAssignments();
  }, []);

  const fetchWorkAssignments = async () => {
    try {
      setLoading(true);
      const response = await workAssignmentsAPI.getMyAssignments();
      setWorkAssignments(response.data.data);
    } catch (error) {
      console.error('Error fetching work assignments:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to fetch work assignments' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      setMessage({ type: 'error', text: 'Please select a status' });
      return;
    }

    try {
      await workAssignmentsAPI.updateStatus(selectedWork._id, statusUpdate);
      setMessage({ 
        type: 'success', 
        text: `Work status updated to ${statusUpdate.status}` 
      });
      setShowStatusModal(false);
      setStatusUpdate({ status: '', notes: '' });
      fetchWorkAssignments();
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update status' 
      });
    }
  };

  const openStatusModal = (work) => {
    setSelectedWork(work);
    setStatusUpdate({ 
      status: work.status, 
      notes: work.notes || '' 
    });
    setShowStatusModal(true);
  };

  const openDetailsModal = (work) => {
    setSelectedWork(work);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (deadline, status) => {
    return new Date(deadline) < new Date() && status !== 'completed';
  };

  const stats = {
    total: workAssignments.length,
    pending: workAssignments.filter(w => w.status === 'pending').length,
    inProgress: workAssignments.filter(w => w.status === 'in-progress').length,
    completed: workAssignments.filter(w => w.status === 'completed').length
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Support Person Dashboard" />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading work assignments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Support Person Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}! 👷
          </h2>
          <p className="text-gray-600 mt-2">
            Manage and update your assigned work tasks
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 
            'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tasks</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FiInfo className="text-4xl text-blue-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <FiClock className="text-4xl text-yellow-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <FiAlertCircle className="text-4xl text-blue-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <FiCheckCircle className="text-4xl text-green-500" />
            </div>
          </Card>
        </div>

        {/* Work Assignments Table */}
        <Card>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">My Work Assignments</h3>
            <p className="text-gray-600 text-sm mt-1">
              View and manage your assigned tasks
            </p>
          </div>

          {workAssignments.length === 0 ? (
            <div className="text-center py-12">
              <FiAlertCircle className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No work assignments yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Your supervisor will assign tasks to you
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Road / Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workAssignments.map((work) => (
                    <tr key={work._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{work.complaintId?.complaintId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {work.roadName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <FiMapPin className="mr-1" />
                          {work.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {work.workDescription}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold uppercase ${getPriorityColor(work.priority)}`}>
                          {work.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(work.deadline).toLocaleDateString()}
                        </div>
                        {isOverdue(work.deadline, work.status) && (
                          <span className="text-xs text-red-600 font-semibold">
                            Overdue!
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(work.status)}`}>
                          {work.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openDetailsModal(work)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                        {work.status !== 'completed' && (
                          <button
                            onClick={() => openStatusModal(work)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            Update Status
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedWork && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Work Assignment Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Work ID</p>
                <p className="font-semibold">#{selectedWork.complaintId?.complaintId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedWork.status)}`}>
                  {selectedWork.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Road Name</p>
              <p className="font-semibold">{selectedWork.roadName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 flex items-center">
                <FiMapPin className="mr-1" /> Location
              </p>
              <p className="font-semibold">{selectedWork.location}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Work Description</p>
              <p className="font-semibold">{selectedWork.workDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className={`font-semibold uppercase ${getPriorityColor(selectedWork.priority)}`}>
                  {selectedWork.priority}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center">
                  <FiCalendar className="mr-1" /> Deadline
                </p>
                <p className="font-semibold">
                  {new Date(selectedWork.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedWork.assignedBy && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 font-semibold mb-2">Assigned By (Supervisor)</p>
                <div className="space-y-2 bg-gray-50 p-3 rounded">
                  <div className="flex items-center">
                    <FiUser className="mr-2 text-gray-600" />
                    <span>{selectedWork.assignedBy.name}</span>
                  </div>
                  <div className="flex items-center">
                    <FiMail className="mr-2 text-gray-600" />
                    <span>{selectedWork.assignedBy.email}</span>
                  </div>
                  {selectedWork.assignedBy.phone && (
                    <div className="flex items-center">
                      <FiPhone className="mr-2 text-gray-600" />
                      <span>{selectedWork.assignedBy.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedWork.notes && (
              <div>
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedWork.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <p>Assigned: {formatDate(selectedWork.assignedAt)}</p>
                {selectedWork.startedAt && (
                  <p>Started: {formatDate(selectedWork.startedAt)}</p>
                )}
              </div>
              <div>
                {selectedWork.completedAt && (
                  <p>Completed: {formatDate(selectedWork.completedAt)}</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedWork && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Update Work Status"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status: <span className={`font-bold ${getPriorityColor(selectedWork.status)}`}>
                  {selectedWork.status}
                </span>
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status
              </label>
              <select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select status...</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={statusUpdate.notes}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes about this work..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SupportDashboard;
