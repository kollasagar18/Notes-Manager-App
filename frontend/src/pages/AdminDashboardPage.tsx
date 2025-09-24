import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Trash2, Search, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  isVerified: boolean;
}

interface Note {
  _id: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'notes'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [token, isAdmin, navigate]);

  const fetchData = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const [usersResponse, notesResponse] = await Promise.all([
        apiService.getAllUsers(token),
        apiService.getAllNotes(token)
      ]);

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }
      
      if (notesResponse.success && notesResponse.data) {
        setNotes(notesResponse.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await apiService.deleteUser(token, userId);
      if (response.success) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        // Also remove notes by this user
        setNotes(prev => prev.filter(note => note.userId !== userId));
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await apiService.deleteAnyNote(token, noteId);
      if (response.success) {
        setNotes(prev => prev.filter(note => note._id !== noteId));
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout title="Admin Dashboard" showLogout>
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Users</p>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
              <div className="bg-blue-400/30 p-3 rounded-full">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Notes</p>
                <p className="text-3xl font-bold">{notes.length}</p>
              </div>
              <div className="bg-purple-400/30 p-3 rounded-full">
                <BookOpen className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-300 ${
              activeTab === 'users'
                ? 'bg-white shadow text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Users Management</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-300 ${
              activeTab === 'notes'
                ? 'bg-white shadow text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Notes Management</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
            {activeTab === 'users' ? (
              // Users Table
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">User</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Contact</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Joined</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-800">{user.name}</div>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {user.email || user.phone}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              user.isVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="inline-flex items-center space-x-1 text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1 rounded-md transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              // Notes Table
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Title</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Author</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Created</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Updated</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No notes found
                        </td>
                      </tr>
                    ) : (
                      filteredNotes.map((note) => (
                        <tr key={note._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-800 mb-1">{note.title}</div>
                            <div className="text-gray-600 text-sm line-clamp-2">
                              {note.description}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-gray-800">{note.userName}</div>
                            <div className="text-gray-600 text-sm">{note.userEmail}</div>
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm">
                            {formatDate(note.createdAt)}
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm">
                            {note.updatedAt !== note.createdAt ? formatDate(note.updatedAt) : '-'}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="inline-flex items-center space-x-1 text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1 rounded-md transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

       
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;