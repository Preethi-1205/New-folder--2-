import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Card from '../shared/Card';
import ProgressBar from '../shared/ProgressBar';
import { TrendingUp, Users, FileText, Target, Award, Activity } from 'lucide-react';
import { calculatePercentage } from '../../utils/helpers';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalGroups: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
    submissionRate: 0,
    averageScore: 0,
    gradedRate: 0,
  });
  const [groupStats, setGroupStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [groupsRes, assignmentsRes, submissionsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/assignments'),
        api.get('/submissions'),
      ]);

      const groups = groupsRes.data.groups || [];
      const assignments = assignmentsRes.data.assignments || [];
      const submissions = submissionsRes.data.submissions || [];

      const gradedSubmissions = submissions.filter(s => s.status === 'graded');
      const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.marks_obtained || 0), 0);
      const totalPossible = gradedSubmissions.reduce((sum, s) => sum + s.total_marks, 0);

      setAnalytics({
        totalStudents: new Set(submissions.map(s => s.user_id)).size,
        totalGroups: groups.length,
        totalAssignments: assignments.length,
        totalSubmissions: submissions.length,
        submissionRate: assignments.length > 0 
          ? calculatePercentage(submissions.length, assignments.length) 
          : 0,
        averageScore: totalPossible > 0 
          ? calculatePercentage(totalScore, totalPossible) 
          : 0,
        gradedRate: submissions.length > 0 
          ? calculatePercentage(gradedSubmissions.length, submissions.length) 
          : 0,
      });

      // Calculate group stats
      const groupStatsData = groups.map(group => {
        const groupAssignments = assignments.filter(a => a.group_id === group.id);
        const groupSubmissions = submissions.filter(s => 
          groupAssignments.some(a => a.id === s.assignment_id)
        );

        return {
          name: group.name,
          members: group.member_count || 0,
          assignments: groupAssignments.length,
          submissions: groupSubmissions.length,
          completionRate: groupAssignments.length > 0
            ? calculatePercentage(groupSubmissions.length, groupAssignments.length)
            : 0,
        };
      });

      setGroupStats(groupStatsData);
    } catch (error) {
      toast.error('Failed to load analytics');
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

  const metrics = [
    { title: 'Active Students', value: analytics.totalStudents, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Groups', value: analytics.totalGroups, icon: FileText, color: 'bg-purple-500' },
    { title: 'Assignments', value: analytics.totalAssignments, icon: Target, color: 'bg-green-500' },
    { title: 'Submissions', value: analytics.totalSubmissions, icon: Activity, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive portal analytics and insights</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                </div>
                <div className={`${metric.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Submission Rate</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">{analytics.submissionRate}%</span>
              <span className="text-sm text-gray-600">
                {analytics.totalSubmissions} / {analytics.totalAssignments * analytics.totalStudents}
              </span>
            </div>
            <ProgressBar 
              value={analytics.submissionRate} 
              max={100}
              color={analytics.submissionRate >= 70 ? 'success' : analytics.submissionRate >= 50 ? 'warning' : 'danger'}
            />
            <p className="text-xs text-gray-500 mt-2">
              Overall submission completion rate
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Average Score</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">{analytics.averageScore}%</span>
            </div>
            <ProgressBar 
              value={analytics.averageScore} 
              max={100}
              color={analytics.averageScore >= 70 ? 'success' : analytics.averageScore >= 50 ? 'warning' : 'danger'}
            />
            <p className="text-xs text-gray-500 mt-2">
              Average score across all graded submissions
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Grading Progress</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">{analytics.gradedRate}%</span>
            </div>
            <ProgressBar 
              value={analytics.gradedRate} 
              max={100}
              color={analytics.gradedRate >= 70 ? 'success' : analytics.gradedRate >= 50 ? 'warning' : 'danger'}
            />
            <p className="text-xs text-gray-500 mt-2">
              Percentage of submissions that have been graded
            </p>
          </div>
        </Card>
      </div>

      {/* Group Performance */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Group Performance</h2>
        </div>

        {groupStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No group data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupStats.map((group, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{group.name}</h4>
                    <p className="text-sm text-gray-600">
                      {group.members} members · {group.assignments} assignments
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{group.completionRate}%</span>
                </div>
                <ProgressBar 
                  value={group.completionRate} 
                  max={100}
                  showLabel={false}
                  color={group.completionRate >= 70 ? 'success' : group.completionRate >= 50 ? 'warning' : 'danger'}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Analytics;
