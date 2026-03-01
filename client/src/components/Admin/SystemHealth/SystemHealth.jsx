import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const SystemHealth = () => {
  const { user } = useContext(AuthContext);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const fetchHealth = async () => {
    try {
      const [healthRes, settingsRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/api/health', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        fetch('http://127.0.0.1:5000/api/settings', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
      ]);
      setHealth(await healthRes.json());
      const settings = await settingsRes.json();
      setMaintenanceMode(settings.maintenance_mode === 'true');
    } catch (error) {
      console.error('Failed to fetch health status', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const toggleMaintenance = async () => {
    try {
      const newValue = !maintenanceMode;
      await fetch('http://127.0.0.1:5000/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ key: 'maintenance_mode', value: newValue })
      });
      setMaintenanceMode(newValue);
    } catch (error) {
      console.error('Failed to update maintenance mode', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Checking system status...</div>;
  if (!health) return <div className="p-8 text-center text-rose-500">Failed to load system health.</div>;

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const formatBytes = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

  return (
    <div className="p-8 bg-slate-50 min-h-[calc(100vh-65px)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Health</h1>
            <p className="text-slate-500 mt-1">Real-time server and database monitoring.</p>
          </div>
          <button onClick={fetchHealth} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard 
            label="Overall Status" 
            value={health.status === 'ok' ? 'Operational' : 'Degraded'} 
            status={health.status === 'ok' ? 'success' : 'error'}
          />
          <StatusCard 
            label="Database Connection" 
            value={health.services.database === 'connected' ? 'Connected' : 'Disconnected'} 
            status={health.services.database === 'connected' ? 'success' : 'error'}
          />
          <StatusCard 
            label="Server Uptime" 
            value={formatUptime(health.uptime)} 
            status="neutral"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Memory Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase">RSS</div>
              <div className="text-xl font-mono text-slate-700">{formatBytes(health.memory.rss)}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase">Heap Total</div>
              <div className="text-xl font-mono text-slate-700">{formatBytes(health.memory.heapTotal)}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase">Heap Used</div>
              <div className="text-xl font-mono text-slate-700">{formatBytes(health.memory.heapUsed)}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Maintenance Mode</h3>
            <p className="text-sm text-slate-500">Prevent non-admin users from logging in.</p>
          </div>
          <button 
            onClick={toggleMaintenance}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ label, value, status }) => {
  const colors = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    neutral: 'bg-blue-50 text-blue-700 border-blue-100'
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[status] || colors.neutral}`}>
      <div className="text-sm font-medium opacity-80 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

export default SystemHealth;
