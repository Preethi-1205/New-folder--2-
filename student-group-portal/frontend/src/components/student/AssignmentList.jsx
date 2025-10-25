import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Card, { CardHeader, CardTitle, CardContent } from '../shared/Card';
import Modal from '../shared/Modal';
import { FileText, Calendar, Clock, AlertCircle, Send } from 'lucide-react';
import { formatDate, isOverdue, isDueSoon } from '../../utils/helpers';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({ content: '', file_url: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/assignments');
      setAssignments(response.data.assignments || []);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/submissions', {
        assignment_id: selectedAssignment.id,
        content: submissionData.content,
        file_url: submissionData.file_url || null,
      });

      toast.success('Assignment submitted successfully!');
      setShowSubmitModal(false);
      setSubmissionData({ content: '', file_url: '' });
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignment) => {
    if (isOverdue(assignment.due_date)) {
      return <span className="badge badge-danger">Overdue</span>;
    }
    if (isDueSoon(assignment.due_date)) {
      return <span className="badge badge-warning">Due Soon</span>;
    }
    return <span className="badge badge-info">Active</span>;
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
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">View and submit your assignments</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600">Check back later for new assignments</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} hover>
              <CardContent>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="bg-primary-100 p-3 rounded-xl flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                          {getStatusBadge(assignment)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {assignment.description || 'No description provided'}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {formatDate(assignment.due_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {assignment.total_marks} marks
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {assignment.group_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmitModal(true);
                      }}
                      className="btn-primary w-full lg:w-auto"
                      disabled={isOverdue(assignment.due_date)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setSubmissionData({ content: '', file_url: '' });
        }}
        title={`Submit: ${selectedAssignment?.title}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Content *
            </label>
            <textarea
              required
              value={submissionData.content}
              onChange={(e) => setSubmissionData({ ...submissionData, content: e.target.value })}
              className="input-field min-h-[150px] resize-none"
              placeholder="Enter your submission content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File URL (Optional)
            </label>
            <input
              type="url"
              value={submissionData.file_url}
              onChange={(e) => setSubmissionData({ ...submissionData, file_url: e.target.value })}
              className="input-field"
              placeholder="https://drive.google.com/..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste a link to your Google Drive, Dropbox, or other file sharing service
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowSubmitModal(false);
                setSubmissionData({ content: '', file_url: '' });
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssignmentList;
