import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Trash2, BookOpen, Search, X } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Note {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const UserNotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch notes on mount
  useEffect(() => {
    if (!token) {
      navigate('/user/login');
      return;
    }
    fetchNotes();
  }, [token, navigate]);

  const fetchNotes = async () => {
    if (!token) return;
    try {
      const response = await apiService.getNotes(token);
      if (response.success && response.data) {
        setNotes(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.message || 'Failed to fetch notes');
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setFormData({ title: '', description: '' });
    setEditingNote(null);
    setError('');
    setShowModal(false);
  };

  const handleAddNote = () => {
    resetModal();
    setShowModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, description: note.description });
    setError('');
    setShowModal(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await apiService.deleteNote(token, noteId);
      if (response.success) {
        setNotes(prev => prev.filter(note => note._id !== noteId));
      } else {
        setError(response.message || 'Failed to delete note');
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError('Failed to delete note');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    setSubmitting(true);

    const trimmedData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    if (!trimmedData.title || !trimmedData.description) {
      setError('Title and description are required');
      setSubmitting(false);
      return;
    }

    try {
      if (editingNote) {
        // Update existing
        const response = await apiService.updateNote(token, editingNote._id, trimmedData);
        if (response.success) {
          await fetchNotes(); // always sync latest data
          resetModal();
        } else {
          setError(response.message || 'Failed to update note');
        }
      } else {
        // Create new
        const response = await apiService.createNote(token, trimmedData);
        if (response.success) {
          await fetchNotes(); // fetch from backend again
          resetModal();
        } else {
          setError(response.message || 'Failed to create note');
        }
      }
    } catch (err) {
      console.error('Error saving note:', err);
      setError('An error occurred while saving the note');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Layout title={`${user?.name}'s Notes`} showLogout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome back, {user?.name}!
            </h2>
          </div>
          <button
            onClick={handleAddNote}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Note</span>
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
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first note to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddNote}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Create Note</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map(note => (
              <div
                key={note._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {note.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-300"
                      aria-label="Edit note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-300"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{note.description}</p>
                <div className="text-xs text-gray-400">
                  <p>Created: {formatDate(note.createdAt)}</p>
                  {note.updatedAt !== note.createdAt && (
                    <p>Updated: {formatDate(note.updatedAt)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingNote ? 'Edit Note' : 'Add New Note'}
                </h3>
                <button
                  onClick={() => resetModal()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter note title"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter note description"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => resetModal()}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <LoadingSpinner /> : editingNote ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserNotesPage;
