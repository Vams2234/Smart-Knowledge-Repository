import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const UserSettings = () => {
  const { user } = useContext(AuthContext);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    publicProfile: true,
    newsletter: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/users/preferences', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to fetch preferences', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (error) {
      console.error('Save error', error);
      setMessage('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/users/export', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_data_${user.username}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error', error);
      alert('Failed to export data');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading settings...</div>;

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-65px)] transition-colors duration-200">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your preferences and privacy.</p>
        </div>

        <div className="p-8 space-y-8">
          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('success') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
              {message}
            </div>
          )}

          {/* Notifications Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Email Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receive emails about account activity.</p>
                </div>
                <Toggle 
                  checked={preferences.emailNotifications} 
                  onChange={() => handleToggle('emailNotifications')} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Weekly Newsletter</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Get a summary of top knowledge base articles.</p>
                </div>
                <Toggle 
                  checked={preferences.newsletter} 
                  onChange={() => handleToggle('newsletter')} 
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Privacy Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Public Profile</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Allow other users to see your profile details.</p>
                </div>
                <Toggle 
                  checked={preferences.publicProfile} 
                  onChange={() => handleToggle('publicProfile')} 
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Data Management */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Data Management</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Export Data</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Download a copy of your personal data (GDPR).</p>
              </div>
              <button onClick={handleExport} className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Download JSON</button>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
  >
    <span 
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} 
    />
  </button>
);

export default UserSettings;