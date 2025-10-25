import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Card, { CardHeader, CardTitle, CardContent } from '../shared/Card';
import ProgressBar from '../shared/ProgressBar';
import { Send, Clock, CheckCircle, FileText, Award } from 'lucide-react';
import { formatDateTime, getStatusColor, calculatePercentage } from '../../utils/helpers';

const SubmissionTracker = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/submissions');
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'submitted':
        return <Send className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
          <p className="text-gray-600 mt-1">Track your assignment submissions and grades</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Send className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-600">Start by submitting your first assignment</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} hover>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-primary-100 p-3 rounded-xl flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {submission.assignment_title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(submission.status)}
                            <span className={`badge ${getStatusColor(submission.status)}`}>
                              {submission.status}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {submission.content}
                        </p>
                        
                        <div className="text-xs text-gray-500">
                          Submitted on {formatDateTime(submission.submitted_at)}
                        </div>
                      </div>
                    </div>

                    {submission.status === 'graded' && (
                      <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-900">Grade Received</span>
                          </div>
                          <span className="text-lg font-bold text-green-900">
                            {submission.marks_obtained}/{submission.total_marks}
                          </span>
                        </div>
                        
                        <ProgressBar
                          value={submission.marks_obtained}
                          max={submission.total_marks}
                          color={
                            calculatePercentage(submission.marks_obtained, submission.total_marks) >= 70
                              ? 'success'
                              : calculatePercentage(submission.marks_obtained, submission.total_marks) >= 50
                              ? 'warning'
                              : 'danger'
                          }
                        />
                        
                        {submission.feedback && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded border border-green-200">
                              {submission.feedback}
                            </p>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Graded on {formatDateTime(submission.graded_at)}
                        </div>
                      </div>
                    )}

                    {submission.file_url && (
                      <div className="mt-3">
                        <a
                          href={submission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Attached File →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionTracker;
