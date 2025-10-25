import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Card, { CardHeader, CardTitle, CardContent } from '../shared/Card';
import { Users, Calendar, UserPlus } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.groups || []);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      setMembers(response.data.members || []);
      setSelectedGroup(groupId);
    } catch (error) {
      toast.error('Failed to load members');
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
          <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
          <p className="text-gray-600 mt-1">View and manage your study groups</p>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-600">You haven't joined any groups yet</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} hover className="cursor-pointer" onClick={() => fetchMembers(group.id)}>
              <CardContent>
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
                
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created {formatDate(group.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGroup && members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Group Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupManagement;
