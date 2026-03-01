import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const DomainList = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState({ name: '', description: '', icon: '📁' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/domains', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      setDomains(data);
    } catch (error) {
      console.error('Failed to fetch domains', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newDomain)
      });
      if (response.ok) {
        const domain = await response.json();
        setDomains([...domains, domain]);
        setNewDomain({ name: '', description: '', icon: '📁' });
      }
    } catch (error) {
      console.error('Failed to create domain', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this domain?')) return;
    try {
      await fetch(`http://127.0.0.1:5000/api/domains/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setDomains(domains.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete domain', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading domains...</div>;

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-65px)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-8">Knowledge Domains</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add New Domain</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Name</label>
                <input type="text" value={newDomain.name} onChange={e => setNewDomain({...newDomain, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Icon (Emoji)</label>
                <input type="text" value={newDomain.icon} onChange={e => setNewDomain({...newDomain, icon: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Description</label>
                <textarea value={newDomain.description} onChange={e => setNewDomain({...newDomain, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows="3"></textarea>
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Create Domain</button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {domains.map(domain => (
              <div key={domain.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-start group">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                    {domain.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{domain.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{domain.description || 'No description'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(domain.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  🗑️
                </button>
              </div>
            ))}
            {domains.length === 0 && <div className="col-span-2 text-center text-slate-500 dark:text-slate-400 py-8">No domains defined yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainList;