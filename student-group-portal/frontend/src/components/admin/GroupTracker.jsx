import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Card from '../shared/Card';
import Modal from '../shared/Modal';
import { Plus, Edit, Trash2, Users, UserPlus, UserMinus } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const GroupTracker = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.groups || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      setMembers(response.data.members || []);
      setSelectedGroup(groupId);
      setShowMemberModal(true);
    } catch (error) {
      toast.error('Failed to load members');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingGroup) {
        await api.put(`/groups/${editingGroup.id}`, formData);
        toast.success('Group updated successfully');
      } else {
        await api.post('/groups', formData);
        toast.success('Group created successfully');
      }

      setShowGroupModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;

    try {
      await api.delete(`/groups/${id}`);
      toast.success('Group deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  const handleRemoveMember = async (groupId, userId) => {
    if (!window.confirm('Remove this member from the group?')) return;

    try {
      await api.delete(`/groups/${groupId}/members`, { data: { user_id: userId } });
      toast.success('Member removed successfully');
      fetchMembers(groupId);
      fetchData();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
    });
    setShowGroupModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingGroup(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
          <p className="text-gray-600 mt-1">Manage student groups and members</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowGroupModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-600 mb-4">Create your first group to get started</p>
            <button
              onClick={() => setShowGroupModal(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Group
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary-100 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <span className="badge badge-info">{group.member_count || 0} members</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {group.description || 'No description'}
              </p>

              <div className="text-xs text-gray-500 mb-4">
                Created {formatDate(group.created_at)}
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => fetchMembers(group.id)}
                  className="btn-secondary w-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Manage Members
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(group)}
                    className="btn-secondary flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="btn-danger flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Group Modal */}
      <Modal
        isOpen={showGroupModal}
        onClose={() => {
          setShowGroupModal(false);
          resetForm();
        }}
        title={editingGroup ? 'Edit Group' : 'Create New Group'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter group name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="Group description..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowGroupModal(false);
                resetForm();
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingGroup ? 'Update' : 'Create'} Group
            </button>
          </div>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => {
          setShowMemberModal(false);
          setSelectedGroup(null);
          setMembers([]);
        }}
        title="Group Members"
      >
        {members.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No members in this group yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMember(selectedGroup, member.id)}
                  className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                >
                  <UserMinus className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GroupTracker;
