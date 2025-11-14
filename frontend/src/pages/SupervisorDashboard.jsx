import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { complaintsAPI, scheduleAPI, authAPI, workAssignmentsAPI } from '../services/api';
import { FiEye, FiCalendar, FiCheckCircle, FiBell } from 'react-icons/fi';

const SupervisorDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssessModal, setShowAssessModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    notes: ''
  });
  const [supportPersons, setSupportPersons] = useState([]);
  const [scheduleData, setScheduleData] = useState({
    scheduleDate: '',
    scheduleNotes: '',
    assignedSupportPerson: '',
    workDescription: '',
    deadline: '',
    priority: 'medium'
  });
  const [assessmentData, setAssessmentData] = useState({
    severity: 'medium',
    areaType: 'residential',
    supervisorNotes: '',
    resourceEstimate: {
      materials: [],
      machines: [],
      manpower: { workers: 0, engineers: 0 },
    },
  });

  useEffect(() => {
    fetchComplaints();
    fetchSupportPersons();
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

  const fetchSupportPersons = async () => {
    try {
      const response = await authAPI.getSupportPersons();
      setSupportPersons(response.data.data);
    } catch (error) {
      console.error('Error fetching support persons:', error);
    }
  };

  const handleAssess = (complaint) => {
    setSelectedComplaint(complaint);
    setAssessmentData({
      severity: complaint.severity || 'medium',
      areaType: complaint.areaType || 'residential',
      supervisorNotes: complaint.supervisorNotes || '',
      resourceEstimate: complaint.resourceEstimate || {
        materials: [],
        machines: [],
        manpower: { workers: 0, engineers: 0 },
      },
    });
    setShowAssessModal(true);
  };

  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    try {
      await complaintsAPI.assess(selectedComplaint._id, assessmentData);
      setShowAssessModal(false);
      fetchComplaints();
      alert('Complaint assessed successfully');
    } catch (error) {
      console.error('Error assessing complaint:', error);
      alert('Failed to assess complaint');
    }
  };

  const handleAutoSchedule = async () => {
    try {
      const response = await scheduleAPI.autoSchedule();
      alert(`Successfully scheduled ${response.data.count} complaints`);
      fetchComplaints();
    } catch (error) {
      console.error('Error auto-scheduling:', error);
      alert('Failed to auto-schedule');
    }
  };

  const handleScheduleClick = (complaint) => {
    setSelectedComplaint(complaint);
    // Set default deadline to 7 days from now
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 7);
    
    setScheduleData({
      scheduleDate: new Date().toISOString().split('T')[0],
      scheduleNotes: complaint.supervisorNotes || '',
      assignedSupportPerson: '',
      workDescription: complaint.description || '',
      deadline: defaultDeadline.toISOString().split('T')[0],
      priority: complaint.severity || 'medium'
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await complaintsAPI.schedule(selectedComplaint._id, scheduleData);
      
      // Show detailed success message with supervisor info
      const notification = response.data.notification;
      const workAssignment = response.data.workAssignment;
      
      let message = `✅ Complaint Scheduled Successfully!\n\n` +
        `Complaint ID: ${notification.complaintId}\n` +
        `Road: ${notification.roadName}\n` +
        `Scheduled Date: ${new Date(notification.scheduledDate).toLocaleDateString()}\n\n` +
        `Supervisor Details:\n` +
        `Name: ${notification.supervisorName}\n` +
        `Email: ${notification.supervisorEmail}\n` +
        `Phone: ${notification.supervisorPhone}\n\n`;
      
      if (workAssignment) {
        message += `🔧 Work Assignment Created!\n` +
          `Assigned to: ${workAssignment.assignedTo.name}\n` +
          `Email: ${workAssignment.assignedTo.email}\n` +
          `Phone: ${workAssignment.assignedTo.phone}\n` +
          `Deadline: ${new Date(workAssignment.deadline).toLocaleDateString()}\n\n`;
      }
      
      message += `✉️ Resident ${notification.residentName} has been notified!`;
      
      alert(message);
      
      setShowScheduleModal(false);
      fetchComplaints();
    } catch (error) {
      console.error('Error scheduling complaint:', error);
      alert('Failed to schedule complaint');
    }
  };

  const handleConfirmClick = (complaint) => {
    setSelectedComplaint(complaint);
    setConfirmationNotes('');
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    try {
      await workAssignmentsAPI.confirmCompletion(selectedComplaint._id, {
        confirmed: true,
        confirmationNotes
      });
      
      alert('✅ Completion confirmed successfully!');
      setShowConfirmModal(false);
      fetchComplaints();
    } catch (error) {
      console.error('Error confirming completion:', error);
      alert('Failed to confirm completion');
    }
  };

  const handleStatusUpdateClick = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusUpdateData({
      status: complaint.status === 'scheduled' ? 'in-progress' : complaint.status,
      notes: ''
    });
    setShowStatusUpdateModal(true);
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await complaintsAPI.update(selectedComplaint._id, {
        status: statusUpdateData.status,
        supervisorNotes: statusUpdateData.notes
      });
      
      alert(`✅ Status updated to ${statusUpdateData.status} successfully!`);
      setShowStatusUpdateModal(false);
      fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleSyncNotifications = async () => {
    try {
      // Refresh complaints to get latest status updates from support persons
      await fetchComplaints();
      
      // Count how many complaints have notifications
      const notifiedComplaints = complaints.filter(c => 
        c.supervisorNotified && !c.supervisorConfirmed
      );
      
      if (notifiedComplaints.length > 0) {
        alert(`🔔 ${notifiedComplaints.length} status update(s) from support persons synced!\n\nCheck the Completion Status column for updates.`);
      } else {
        alert('✅ No new notifications. All statuses are up to date!');
      }
    } catch (error) {
      console.error('Error syncing notifications:', error);
      alert('Failed to sync notifications');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'complaintId' },
    { header: 'Road Name', accessor: 'roadName' },
    { header: 'Location', render: (row) => row.location?.address },
    {
      header: 'Area Type',
      render: (row) => <span className="capitalize">{row.areaType}</span>,
    },
    {
      header: 'Severity',
      render: (row) => <SeverityBadge severity={row.severity} />,
    },
    {
      header: 'Priority',
      render: (row) => (
        <span className="font-semibold">{row.priority || '-'}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Resource Status',
      render: (row) => {
        const status = row.resourceRequestStatus;
        if (!status || status === 'not-requested') return <span className="text-gray-400">-</span>;
        
        const colors = {
          'pending-approval': 'bg-yellow-100 text-yellow-800',
          'approved': 'bg-green-100 text-green-800',
          'rejected': 'bg-red-100 text-red-800'
        };
        const labels = {
          'pending-approval': 'Pending',
          'approved': 'Approved',
          'rejected': 'Rejected'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || ''}`}>
            {labels[status] || status}
          </span>
        );
      },
    },
    {
      header: 'Assigned To',
      render: (row) => {
        if (row.assignedSupportPerson) {
          return (
            <div className="text-sm">
              <div className="font-medium text-indigo-600">
                🔧 {row.assignedSupportPerson.name}
              </div>
              <div className="text-xs text-gray-500">
                {row.assignedSupportPerson.email}
              </div>
            </div>
          );
        }
        return <span className="text-gray-400">Not assigned</span>;
      },
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleAssess(row)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          >
            <FiEye />
            <span>View</span>
          </button>
          {row.resourceRequestStatus === 'approved' && row.status !== 'scheduled' && (
            <button
              onClick={() => handleScheduleClick(row)}
              className="flex items-center space-x-1 text-green-600 hover:text-green-800"
            >
              <FiCalendar />
              <span>Schedule</span>
            </button>
          )}
        </div>
      ),
    },
    {
      header: 'Completion Status',
      render: (row) => {
        // Show confirmed status (highest priority)
        if (row.supervisorConfirmed) {
          return (
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border-2 border-green-300">
                ✅ Confirmed
              </span>
            </div>
          );
        }
        
        // Show "Completed" status directly when support person completes
        if (row.status === 'completed') {
          return (
            <div className="text-center">
              <div className="inline-flex flex-col items-center space-y-2">
                <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-green-100 text-green-800 border-2 border-green-400">
                  ✅ Completed
                </span>
                {row.supervisorNotified && (
                  <span className="text-xs text-gray-500 italic">by Support Person</span>
                )}
                <button
                  onClick={() => handleConfirmClick(row)}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold hover:bg-orange-600 transition-colors shadow-md"
                  title="Click to confirm this completion"
                >
                  <FiCheckCircle />
                  <span>Confirm Completion</span>
                </button>
              </div>
            </div>
          );
        }
        
        // Show "In Progress" status directly when support person updates
        if (row.status === 'in-progress') {
          return (
            <div className="text-center">
              <div className="inline-flex flex-col items-center space-y-1">
                <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-blue-100 text-blue-800 border-2 border-blue-400">
                  🔔 In Progress
                </span>
                {row.supervisorNotified && (
                  <span className="text-xs text-gray-500 italic">by Support Person</span>
                )}
              </div>
            </div>
          );
        }
        
        // Show "Scheduled/Assigned" for scheduled complaints with assigned support person
        if (row.status === 'scheduled' && row.assignedSupportPerson) {
          return (
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border-2 border-purple-300">
                📋 Assigned to Support
              </span>
            </div>
          );
        }
        
        // Show "Scheduled" for scheduled complaints without support person
        if (row.status === 'scheduled') {
          return (
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border-2 border-indigo-300">
                📅 Scheduled
              </span>
            </div>
          );
        }
        
        return <span className="text-gray-400 text-center block">-</span>;
      },
    },
  ];

  const stats = {
    pending: complaints.filter((c) => c.status === 'pending').length,
    assessed: complaints.filter((c) => c.severity !== null).length,
    scheduled: complaints.filter((c) => c.status === 'scheduled').length,
    inProgress: complaints.filter((c) => c.status === 'in-progress').length,
    completed: complaints.filter((c) => c.status === 'completed').length,
    notifications: complaints.filter((c) => c.supervisorNotified && !c.supervisorConfirmed).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Supervisor Dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-gray-600 mt-2">Pending Review</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.assessed}</p>
              <p className="text-gray-600 mt-2">Assessed</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.scheduled}</p>
              <p className="text-gray-600 mt-2">Scheduled</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.inProgress}</p>
              <p className="text-gray-600 mt-2">In Progress</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
              <p className="text-gray-600 mt-2">✅ Completed</p>
            </div>
          </Card>
        </div>

        {/* Complaints Table */}
        <Card
          title="Complaints for Review"
          actions={
            <div className="flex items-center space-x-3">
              {/* Notification Button */}
              <button
                onClick={handleSyncNotifications}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors relative"
                title="Sync status updates from support persons"
              >
                <FiBell className="text-lg" />
                <span>Status Updates</span>
                {stats.notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                    {stats.notifications}
                  </span>
                )}
              </button>
              
              {/* Auto Schedule Button */}
              <button
                onClick={handleAutoSchedule}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiCalendar />
                <span>Auto Schedule</span>
              </button>
            </div>
          }
        >
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table columns={columns} data={complaints} />
          )}
        </Card>
      </div>

      {/* Assessment Modal */}
      <Modal
        isOpen={showAssessModal}
        onClose={() => setShowAssessModal(false)}
        title="Assess Complaint"
        size="lg"
      >
        <form onSubmit={handleSubmitAssessment} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Complaint Details</h4>
            <p>
              <strong>Road:</strong> {selectedComplaint?.roadName}
            </p>
            <p>
              <strong>Location:</strong> {selectedComplaint?.location?.address}
            </p>
            <p>
              <strong>Description:</strong> {selectedComplaint?.description}
            </p>
            {selectedComplaint?.photo && (
              <div className="mt-3">
                <p className="font-semibold mb-2">Attached Photo:</p>
                <img
                  src={selectedComplaint.photo}
                  alt="Road damage"
                  className="max-w-full h-auto max-h-64 rounded-lg border-2 border-gray-300 object-cover shadow-md"
                />
              </div>
            )}
          </div>

          {/* Resource Approval Status */}
          {selectedComplaint?.resourceRequestStatus && 
           selectedComplaint.resourceRequestStatus !== 'not-requested' && (
            <div className={`p-4 rounded-lg mb-4 ${
              selectedComplaint.resourceRequestStatus === 'approved' ? 'bg-green-50 border border-green-200' :
              selectedComplaint.resourceRequestStatus === 'rejected' ? 'bg-red-50 border border-red-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}>
              <h4 className="font-semibold mb-2 flex items-center">
                {selectedComplaint.resourceRequestStatus === 'approved' && '✅ '}
                {selectedComplaint.resourceRequestStatus === 'rejected' && '❌ '}
                {selectedComplaint.resourceRequestStatus === 'pending-approval' && '⏳ '}
                Resource Request Status: {' '}
                <span className="capitalize ml-1">
                  {selectedComplaint.resourceRequestStatus.replace('-', ' ')}
                </span>
              </h4>
              
              {selectedComplaint.resourceRequestStatus === 'approved' && (
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Allocated Resources:</strong>
                  </p>
                  {selectedComplaint.resourcesAllocated && (
                    <ul className="ml-4 text-sm">
                      {selectedComplaint.resourcesAllocated.manpower?.workers > 0 && (
                        <li>Workers: {selectedComplaint.resourcesAllocated.manpower.workers}</li>
                      )}
                      {selectedComplaint.resourcesAllocated.manpower?.engineers > 0 && (
                        <li>Engineers: {selectedComplaint.resourcesAllocated.manpower.engineers}</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
              
              {selectedComplaint.administratorNotes && (
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Admin Notes:</strong> {selectedComplaint.administratorNotes}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity *
              </label>
              <select
                required
                value={assessmentData.severity}
                onChange={(e) =>
                  setAssessmentData({ ...assessmentData, severity: e.target.value })
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
                Area Type *
              </label>
              <select
                required
                value={assessmentData.areaType}
                onChange={(e) =>
                  setAssessmentData({ ...assessmentData, areaType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="busy">Busy</option>
                <option value="deserted">Deserted</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workers Required
              </label>
              <input
                type="number"
                min="0"
                value={assessmentData.resourceEstimate.manpower.workers}
                onChange={(e) =>
                  setAssessmentData({
                    ...assessmentData,
                    resourceEstimate: {
                      ...assessmentData.resourceEstimate,
                      manpower: {
                        ...assessmentData.resourceEstimate.manpower,
                        workers: parseInt(e.target.value) || 0,
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engineers Required
              </label>
              <input
                type="number"
                min="0"
                value={assessmentData.resourceEstimate.manpower.engineers}
                onChange={(e) =>
                  setAssessmentData({
                    ...assessmentData,
                    resourceEstimate: {
                      ...assessmentData.resourceEstimate,
                      manpower: {
                        ...assessmentData.resourceEstimate.manpower,
                        engineers: parseInt(e.target.value) || 0,
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor Notes
            </label>
            <textarea
              rows="3"
              value={assessmentData.supervisorNotes}
              onChange={(e) =>
                setAssessmentData({
                  ...assessmentData,
                  supervisorNotes: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any notes or observations"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowAssessModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Assessment
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Complaint"
      >
        {selectedComplaint && (
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Complaint Details</h4>
              <p><strong>ID:</strong> {selectedComplaint.complaintId}</p>
              <p><strong>Road:</strong> {selectedComplaint.roadName}</p>
              <p><strong>Location:</strong> {selectedComplaint.location?.address}</p>
              <p><strong>Severity:</strong> <SeverityBadge severity={selectedComplaint.severity} /></p>
              <p><strong>Status:</strong> <StatusBadge status={selectedComplaint.status} /></p>
              {selectedComplaint.photo && (
                <div className="mt-3">
                  <p className="font-semibold mb-2">Attached Photo:</p>
                  <img
                    src={selectedComplaint.photo}
                    alt="Road damage"
                    className="max-w-full h-auto max-h-64 rounded-lg border-2 border-gray-300 object-cover shadow-md"
                  />
                </div>
              )}
            </div>

            {selectedComplaint.resourcesAllocated && (
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">✅ Allocated Resources</h4>
                <ul className="text-sm space-y-1">
                  {selectedComplaint.resourcesAllocated.manpower?.workers > 0 && (
                    <li>👷 Workers: {selectedComplaint.resourcesAllocated.manpower.workers}</li>
                  )}
                  {selectedComplaint.resourcesAllocated.manpower?.engineers > 0 && (
                    <li>👨‍💼 Engineers: {selectedComplaint.resourcesAllocated.manpower.engineers}</li>
                  )}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Date *
              </label>
              <input
                type="date"
                required
                value={scheduleData.scheduleDate}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduleDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Support Person (Optional)
              </label>
              <select
                value={scheduleData.assignedSupportPerson}
                onChange={(e) => setScheduleData({ ...scheduleData, assignedSupportPerson: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- No Assignment --</option>
                {supportPersons.map(person => (
                  <option key={person._id} value={person._id}>
                    {person.name} ({person.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a support person to create a work assignment
              </p>
            </div>

            {scheduleData.assignedSupportPerson && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Description *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={scheduleData.workDescription}
                    onChange={(e) => setScheduleData({ ...scheduleData, workDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the work to be done"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleData.deadline}
                    onChange={(e) => setScheduleData({ ...scheduleData, deadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    required
                    value={scheduleData.priority}
                    onChange={(e) => setScheduleData({ ...scheduleData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Notes
              </label>
              <textarea
                rows="4"
                value={scheduleData.scheduleNotes}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduleNotes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes about the scheduled work"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                📧 After scheduling, the resident will be notified with your contact details.
                {scheduleData.assignedSupportPerson && (
                  <span className="block mt-1 font-semibold">
                    🔧 A work assignment will be created for the selected support person.
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FiCalendar />
                <span>Confirm Schedule</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Complaint Completion"
        size="md"
      >
        {selectedComplaint && (
          <form onSubmit={handleConfirmSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Complaint Details</h4>
              <p><strong>ID:</strong> {selectedComplaint.complaintId}</p>
              <p><strong>Road:</strong> {selectedComplaint.roadName}</p>
              <p><strong>Location:</strong> {selectedComplaint.location?.address}</p>
              {selectedComplaint.assignedSupportPerson && (
                <>
                  <p className="mt-2"><strong>Completed by:</strong></p>
                  <p>🔧 {selectedComplaint.assignedSupportPerson.name}</p>
                  <p className="text-sm text-gray-600">{selectedComplaint.assignedSupportPerson.email}</p>
                </>
              )}
              {selectedComplaint.dateCompleted && (
                <p className="mt-2">
                  <strong>Date Completed:</strong>{' '}
                  {new Date(selectedComplaint.dateCompleted).toLocaleDateString()}
                </p>
              )}
              {selectedComplaint.photo && (
                <div className="mt-3">
                  <p className="font-semibold mb-2">Attached Photo:</p>
                  <img
                    src={selectedComplaint.photo}
                    alt="Road damage"
                    className="max-w-full h-auto max-h-64 rounded-lg border-2 border-gray-300 object-cover shadow-md"
                  />
                </div>
              )}
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
              <p className="text-sm text-orange-800">
                <strong>⚠️ Important:</strong> By confirming, you verify that the work has been completed satisfactorily and meets quality standards.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmation Notes (Optional)
              </label>
              <textarea
                rows="4"
                value={confirmationNotes}
                onChange={(e) => setConfirmationNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add any notes about the completed work quality, follow-up needed, etc."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FiCheckCircle />
                <span>Confirm Completion</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusUpdateModal}
        onClose={() => setShowStatusUpdateModal(false)}
        title="Update Work Status"
        size="md"
      >
        {selectedComplaint && (
          <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Complaint Details</h4>
              <p><strong>ID:</strong> {selectedComplaint.complaintId}</p>
              <p><strong>Road:</strong> {selectedComplaint.roadName}</p>
              <p><strong>Location:</strong> {selectedComplaint.location?.address}</p>
              <p><strong>Current Status:</strong> <span className="capitalize font-semibold text-blue-600">{selectedComplaint.status}</span></p>
              {selectedComplaint.assignedSupportPerson && (
                <>
                  <p className="mt-2"><strong>Assigned to:</strong></p>
                  <p>🔧 {selectedComplaint.assignedSupportPerson.name}</p>
                  <p className="text-sm text-gray-600">{selectedComplaint.assignedSupportPerson.email}</p>
                </>
              )}
              {selectedComplaint.photo && (
                <div className="mt-3">
                  <p className="font-semibold mb-2">Attached Photo:</p>
                  <img
                    src={selectedComplaint.photo}
                    alt="Road damage"
                    className="max-w-full h-auto max-h-64 rounded-lg border-2 border-gray-300 object-cover shadow-md"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status To *
              </label>
              <select
                required
                value={statusUpdateData.status}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select Status --</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Update Notes (Optional)
              </label>
              <textarea
                rows="4"
                value={statusUpdateData.notes}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes about this status update..."
              />
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-yellow-800">
                <strong>ℹ️ Note:</strong> This will update the complaint status. The support person will see this update in their dashboard.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowStatusUpdateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Update Status</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SupervisorDashboard;
