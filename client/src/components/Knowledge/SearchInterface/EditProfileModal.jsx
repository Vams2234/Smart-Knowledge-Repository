import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose, profile, onSave, onDelete }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    bio: '',
    expertise: '',
    avatar: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        role: profile.role || '',
        department: profile.department || '',
        bio: profile.bio || '',
        expertise: Array.isArray(profile.expertise) ? profile.expertise.join(', ') : profile.expertise || '',
        avatar: profile.avatar || ''
      });
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setFormData({ ...formData, avatar: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('role', formData.role);
      data.append('department', formData.department);
      data.append('bio', formData.bio);
      
      const expertiseArray = formData.expertise.split(',').map(s => s.trim()).filter(Boolean);
      data.append('expertise', JSON.stringify(expertiseArray));

      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const response = await fetch(`http://127.0.0.1:5000/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: data
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        onSave(updatedProfile);
        onClose();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/profiles/${profile.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        onDelete(profile.id);
        onClose();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Edit Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden">
              {formData.avatar ? <img src={formData.avatar.startsWith('blob:') ? formData.avatar : `http://127.0.0.1:5000${formData.avatar}`} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
            </div>
            <input type="file" onChange={handleAvatarChange} className="text-sm text-slate-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full px-4 py-2 rounded-xl border border-slate-200" required />
            <input name="role" value={formData.role} onChange={handleChange} placeholder="Role" className="w-full px-4 py-2 rounded-xl border border-slate-200" required />
          </div>
          
          <input name="department" value={formData.department} onChange={handleChange} placeholder="Department" className="w-full px-4 py-2 rounded-xl border border-slate-200" />
          <input name="expertise" value={formData.expertise} onChange={handleChange} placeholder="Skills (comma separated)" className="w-full px-4 py-2 rounded-xl border border-slate-200" />
          <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Bio" rows="3" className="w-full px-4 py-2 rounded-xl border border-slate-200" />

          <div className="flex justify-between pt-4">
            <button type="button" onClick={handleDelete} className="text-rose-500 font-medium hover:text-rose-700">Delete Profile</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;