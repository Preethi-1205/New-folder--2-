import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Card from '../shared/Card';
import { Users, FileText, Send, CheckCircle, TrendingUp, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
    gradedSubmissions: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [groupsRes, assignmentsRes, submissionsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/assignments'),
        api.get('/submissions'),
      ]);

      const submissions = submissionsRes.data.submissions || [];

      setStats({
        totalGroups: groupsRes.data.groups?.length || 0,
        totalAssignments: assignmentsRes.data.assignments?.length || 0,
        totalSubmissions: submissions.length,
        gradedSubmissions: submissions.filter(s => s.status === 'graded').length,
      });

      setRecentActivity(submissions.slice(0, 10));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Groups', value: stats.totalGroups, icon: Users, color: 'bg-blue-500', trend: '+12%' },
    { title: 'Assignments', value: stats.totalAssignments, icon: FileText, color: 'bg-purple-500', trend: '+5%' },
    { title: 'Submissions', value: stats.totalSubmissions, icon: Send, color: 'bg-green-500', trend: '+23%' },
    { title: 'Graded', value: stats.gradedSubmissions, icon: CheckCircle, color: 'bg-orange-500', trend: '+8%' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of all portal activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">{stat.trend}</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Recent Submissions</h2>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Send className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Send className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.student_name}</p>
                    <p className="text-sm text-gray-600">{activity.assignment_title}</p>
                  </div>
                </div>
                <span className={`badge ${
                  activity.status === 'graded' ? 'badge-success' :
                  activity.status === 'submitted' ? 'badge-info' :
                  'badge-warning'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
