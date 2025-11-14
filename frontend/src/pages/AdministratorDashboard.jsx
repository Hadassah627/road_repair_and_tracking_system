import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { resourcesAPI, complaintsAPI } from '../services/api';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiEye } from 'react-icons/fi';

const AdministratorDashboard = () => {
  const [resources, setResources] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' or 'requests'
  
  const [resourceFormData, setResourceFormData] = useState({
    type: 'material',
    name: '',
    category: '',
    quantity: 0,
    totalQuantity: 0,
    unit: 'units',
    status: 'available',
    notes: '',
  });

  const [approvalData, setApprovalData] = useState({
    action: 'approve', // 'approve' or 'reject'
    resourcesAllocated: {
      materials: [],
      machines: [],
      manpower: { workers: 0, engineers: 0 }
    },
    administratorNotes: ''
  });

  useEffect(() => {
    fetchResources();
    fetchComplaints();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourcesAPI.getAll();
      setResources(response.data.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await complaintsAPI.getAll();
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const handleAdd = () => {
    setEditingResource(null);
    setResourceFormData({
      type: 'material',
      name: '',
      category: '',
      quantity: 0,
      totalQuantity: 0,
      unit: 'units',
      status: 'available',
      notes: '',
    });
    setShowResourceModal(true);
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setResourceFormData({
      type: resource.type,
      name: resource.name,
      category: resource.category || '',
      quantity: resource.quantity,
      totalQuantity: resource.totalQuantity,
      unit: resource.unit,
      status: resource.status,
      notes: resource.notes || '',
    });
    setShowResourceModal(true);
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await resourcesAPI.update(editingResource._id, resourceFormData);
      } else {
        await resourcesAPI.create(resourceFormData);
      }
      setShowResourceModal(false);
      fetchResources();
      alert('Resource saved successfully!');
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Failed to save resource');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourcesAPI.delete(id);
        fetchResources();
        alert('Resource deleted successfully!');
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Failed to delete resource');
      }
    }
  };

  const handleViewRequest = (complaint) => {
    setSelectedComplaint(complaint);
    setApprovalData({
      action: 'approve',
      resourcesAllocated: {
        materials: complaint.resourceEstimate?.materials || [],
        machines: complaint.resourceEstimate?.machines || [],
        manpower: complaint.resourceEstimate?.manpower || { workers: 0, engineers: 0 }
      },
      administratorNotes: ''
    });
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (approvalData.action === 'approve') {
        await complaintsAPI.approveResources(selectedComplaint._id, {
          resourcesAllocated: approvalData.resourcesAllocated,
          administratorNotes: approvalData.administratorNotes
        });
        alert('Resource request approved successfully!');
      } else {
        await complaintsAPI.rejectResources(selectedComplaint._id, {
          administratorNotes: approvalData.administratorNotes
        });
        alert('Resource request rejected');
      }
      setShowApprovalModal(false);
      fetchComplaints();
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Failed to process resource request');
    }
  };

  const resourceColumns = [
    {
      header: 'Type',
      render: (row) => (
        <span className="capitalize font-medium">{row.type}</span>
      ),
    },
    { header: 'Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Quantity',
      render: (row) => `${row.quantity} / ${row.totalQuantity} ${row.unit}`,
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-800"
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  const requestColumns = [
    { header: 'ID', accessor: 'complaintId' },
    { header: 'Road Name', accessor: 'roadName' },
    { header: 'Location', render: (row) => row.location?.address },
    {
      header: 'Severity',
      render: (row) => <SeverityBadge severity={row.severity} />,
    },
    {
      header: 'Workers',
      render: (row) => row.resourceEstimate?.manpower?.workers || 0,
    },
    {
      header: 'Engineers',
      render: (row) => row.resourceEstimate?.manpower?.engineers || 0,
    },
    {
      header: 'Machines',
      render: (row) => row.resourceEstimate?.machines?.length || 0,
    },
    {
      header: 'Materials',
      render: (row) => row.resourceEstimate?.materials?.length || 0,
    },
    {
      header: 'Status',
      render: (row) => {
        const status = row.resourceRequestStatus;
        const colors = {
          'pending-approval': 'bg-yellow-100 text-yellow-800',
          'approved': 'bg-green-100 text-green-800',
          'rejected': 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || ''}`}>
            {status.replace('-', ' ').toUpperCase()}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleViewRequest(row)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          disabled={row.resourceRequestStatus !== 'pending-approval'}
        >
          <FiEye />
          <span>Review</span>
        </button>
      ),
    },
  ];

  const pendingRequests = complaints.filter(c => c.resourceRequestStatus === 'pending-approval');

  const stats = {
    materials: resources.filter((r) => r.type === 'material').length,
    machines: resources.filter((r) => r.type === 'machine').length,
    manpower: resources.filter((r) => r.type === 'manpower').length,
    pendingRequests: complaints.filter(c => c.resourceRequestStatus === 'pending-approval').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Administrator Dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.materials}</p>
              <p className="text-gray-600 mt-2">Materials</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.machines}</p>
              <p className="text-gray-600 mt-2">Machines</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.manpower}</p>
              <p className="text-gray-600 mt-2">Manpower</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.pendingRequests}</p>
              <p className="text-gray-600 mt-2">Pending Requests</p>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'resources'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Resource Management
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Resource Requests {stats.pendingRequests > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {stats.pendingRequests}
              </span>
            )}
          </button>
        </div>

        {/* Resources Table */}
        {activeTab === 'resources' && (
          <Card
            title="Resource Management"
            actions={
              <button
                onClick={handleAdd}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus />
                <span>Add Resource</span>
              </button>
            }
          >
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table columns={resourceColumns} data={resources} />
            )}
          </Card>
        )}

        {/* Resource Requests Table */}
        {activeTab === 'requests' && (
          <Card title="Resource Requests from Supervisors">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending resource requests
              </div>
            ) : (
              <Table columns={requestColumns} data={pendingRequests} />
            )}
          </Card>
        )}
      </div>

      {/* Resource Modal */}
      <Modal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        title={editingResource ? 'Edit Resource' : 'Add New Resource'}
      >
        <form onSubmit={handleResourceSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type *
            </label>
            <select
              required
              value={resourceFormData.type}
              onChange={(e) => setResourceFormData({ ...resourceFormData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="material">Material</option>
              <option value="machine">Machine</option>
              <option value="manpower">Manpower</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={resourceFormData.name}
              onChange={(e) => setResourceFormData({ ...resourceFormData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Cement, Roller, Worker"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              value={resourceFormData.category}
              onChange={(e) =>
                setResourceFormData({ ...resourceFormData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Construction, Heavy Equipment"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={resourceFormData.quantity}
                onChange={(e) =>
                  setResourceFormData({ ...resourceFormData, quantity: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={resourceFormData.totalQuantity}
                onChange={(e) =>
                  setResourceFormData({
                    ...resourceFormData,
                    totalQuantity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <input
                type="text"
                required
                value={resourceFormData.unit}
                onChange={(e) => setResourceFormData({ ...resourceFormData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., kg, tons, units"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={resourceFormData.status}
                onChange={(e) =>
                  setResourceFormData({ ...resourceFormData, status: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              rows="3"
              value={resourceFormData.notes}
              onChange={(e) => setResourceFormData({ ...resourceFormData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional information"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowResourceModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingResource ? 'Update' : 'Add'} Resource
            </button>
          </div>
        </form>
      </Modal>

      {/* Approval/Rejection Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Review Resource Request"
        size="lg"
      >
        {selectedComplaint && (
          <form onSubmit={handleApprovalSubmit} className="space-y-4">
            {/* Complaint Details */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Complaint Details</h4>
              <p><strong>ID:</strong> {selectedComplaint.complaintId}</p>
              <p><strong>Road:</strong> {selectedComplaint.roadName}</p>
              <p><strong>Location:</strong> {selectedComplaint.location?.address}</p>
              <p><strong>Description:</strong> {selectedComplaint.description}</p>
              <p><strong>Severity:</strong> <SeverityBadge severity={selectedComplaint.severity} /></p>
            </div>

            {/* Requested Resources */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Requested Resources</h4>
              
              {/* Manpower */}
              {(selectedComplaint.resourceEstimate?.manpower?.workers > 0 || 
                selectedComplaint.resourceEstimate?.manpower?.engineers > 0) && (
                <div className="mb-3">
                  <p className="font-medium">Manpower:</p>
                  <ul className="ml-4 list-disc">
                    {selectedComplaint.resourceEstimate.manpower.workers > 0 && (
                      <li>Workers: {selectedComplaint.resourceEstimate.manpower.workers}</li>
                    )}
                    {selectedComplaint.resourceEstimate.manpower.engineers > 0 && (
                      <li>Engineers: {selectedComplaint.resourceEstimate.manpower.engineers}</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Machines */}
              {selectedComplaint.resourceEstimate?.machines?.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium">Machines:</p>
                  <ul className="ml-4 list-disc">
                    {selectedComplaint.resourceEstimate.machines.map((m, i) => (
                      <li key={i}>{m.name} - Quantity: {m.quantity}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Materials */}
              {selectedComplaint.resourceEstimate?.materials?.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium">Materials:</p>
                  <ul className="ml-4 list-disc">
                    {selectedComplaint.resourceEstimate.materials.map((m, i) => (
                      <li key={i}>{m.name} - {m.quantity} {m.unit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Supervisor Notes */}
              {selectedComplaint.supervisorNotes && (
                <div className="mt-3">
                  <p className="font-medium">Supervisor Notes:</p>
                  <p className="text-gray-700">{selectedComplaint.supervisorNotes}</p>
                </div>
              )}
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="approve"
                    checked={approvalData.action === 'approve'}
                    onChange={(e) => setApprovalData({ ...approvalData, action: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">Approve</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="reject"
                    checked={approvalData.action === 'reject'}
                    onChange={(e) => setApprovalData({ ...approvalData, action: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">Reject</span>
                </label>
              </div>
            </div>

            {/* Allocated Resources (only if approving) */}
            {approvalData.action === 'approve' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Allocate Resources</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Workers
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={approvalData.resourcesAllocated.manpower.workers}
                      onChange={(e) =>
                        setApprovalData({
                          ...approvalData,
                          resourcesAllocated: {
                            ...approvalData.resourcesAllocated,
                            manpower: {
                              ...approvalData.resourcesAllocated.manpower,
                              workers: parseInt(e.target.value) || 0
                            }
                          }
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engineers
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={approvalData.resourcesAllocated.manpower.engineers}
                      onChange={(e) =>
                        setApprovalData({
                          ...approvalData,
                          resourcesAllocated: {
                            ...approvalData.resourcesAllocated,
                            manpower: {
                              ...approvalData.resourcesAllocated.manpower,
                              engineers: parseInt(e.target.value) || 0
                            }
                          }
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Administrator Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Notes
              </label>
              <textarea
                rows="3"
                value={approvalData.administratorNotes}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, administratorNotes: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes about your decision"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  approvalData.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {approvalData.action === 'approve' ? (
                  <span className="flex items-center"><FiCheck className="mr-2" /> Approve</span>
                ) : (
                  <span className="flex items-center"><FiX className="mr-2" /> Reject</span>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdministratorDashboard;
