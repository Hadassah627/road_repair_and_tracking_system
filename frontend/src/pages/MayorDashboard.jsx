import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { reportsAPI } from '../services/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { FiTrendingUp, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const MayorDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [areaWise, setAreaWise] = useState([]);
  const [resourceUtilization, setResourceUtilization] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, areaRes, resourceRes, trendsRes] = await Promise.all([
        reportsAPI.getStatistics(),
        reportsAPI.getAreaWise(),
        reportsAPI.getResourceUtilization(),
        reportsAPI.getTrends({ months: 6 }),
      ]);

      setStatistics(statsRes.data.data);
      setAreaWise(areaRes.data.data);
      setResourceUtilization(resourceRes.data.data);
      setTrends(trendsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'];

  // Prepare status data for pie chart
  const statusData = statistics?.byStatus?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];

  // Prepare severity data
  const severityData = statistics?.bySeverity?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];

  // Prepare trends data
  const trendData = trends.map((item) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    total: item.total,
    completed: item.completed,
    pending: item.pending,
  }));

  // Prepare area-wise data
  const areaData = areaWise.map((item) => ({
    area: item._id,
    total: item.total,
    pending: item.pending,
    completed: item.completed,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Mayor Dashboard" />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Mayor Dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiTrendingUp className="text-4xl text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.overview?.total || 0}
                </p>
                <p className="text-gray-600">Total Complaints</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCheckCircle className="text-4xl text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.overview?.completed || 0}
                </p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiClock className="text-4xl text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.overview?.pending || 0}
                </p>
                <p className="text-gray-600">Pending</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertCircle className="text-4xl text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.overview?.averageCompletionDays || 0}
                </p>
                <p className="text-gray-600">Avg. Days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <Card title="Complaints by Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Severity Distribution */}
          <Card title="Complaints by Severity">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Area-wise Performance */}
          <Card title="Area-wise Performance">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#3b82f6" />
                <Bar dataKey="completed" name="Completed" fill="#10b981" />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Resource Utilization */}
          <Card title="Resource Utilization">
            <div className="space-y-4">
              {resourceUtilization.map((resource, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium capitalize">{resource.type}</span>
                    <span className="text-sm text-gray-600">
                      {resource.utilizationPercentage}% utilized
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${resource.utilizationPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Available: {resource.available}</span>
                    <span>In Use: {resource.inUse}</span>
                    <span>Total: {resource.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card title="6-Month Trend Analysis">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="Total Complaints"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="pending"
                name="Pending"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default MayorDashboard;
