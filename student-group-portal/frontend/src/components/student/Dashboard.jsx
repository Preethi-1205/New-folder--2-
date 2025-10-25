import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Card, { CardHeader, CardTitle, CardContent } from '../shared/Card';
import { Users, FileText, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatRelativeTime, isOverdue } from '../../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    groups: 0,
    assignments: 0,
    submissions: 0,
    pending: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
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

      const assignments = assignmentsRes.data.assignments || [];
      const submissions = submissionsRes.data.submissions || [];

      setStats({
        groups: groupsRes.data.groups?.length || 0,
        assignments: assignments.length,
        submissions: submissions.length,
        pending: submissions.filter(s => s.status === 'pending' || s.status === 'submitted').length,
      });

      setRecentAssignments(assignments.slice(0, 5));
      setRecentSubmissions(submissions.slice(0, 5));
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
    { title: 'My Groups', value: stats.groups, icon: Users, color: 'bg-blue-500' },
    { title: 'Assignments', value: stats.assignments, icon: FileText, color: 'bg-purple-500' },
    { title: 'Submissions', value: stats.submissions, icon: Send, color: 'bg-green-500' },
    { title: 'Pending', value: stats.pending, icon: Clock, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your studies</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No assignments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{assignment.group_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Due {formatRelativeTime(assignment.due_date)}
                      </p>
                    </div>
                    {isOverdue(assignment.due_date) ? (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Send className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{submission.assignment_title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Submitted {formatRelativeTime(submission.submitted_at)}
                      </p>
                      {submission.marks_obtained !== null && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Score: {submission.marks_obtained}/{submission.total_marks}
                        </p>
                      )}
                    </div>
                    <span className={`badge ${
                      submission.status === 'graded' ? 'badge-success' :
                      submission.status === 'submitted' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
