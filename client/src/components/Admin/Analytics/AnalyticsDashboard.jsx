import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/analytics/dashboard', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.token]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-center text-rose-500">Failed to load data.</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-[calc(100vh-65px)]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Analytics Dashboard</h1>
        <p className="text-slate-500 mb-8">Insights into repository usage and search trends.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Searches" value={data.stats.totalSearches} icon="🔍" color="blue" />
          <StatCard label="Active Users" value={data.stats.activeUsers} icon="👥" color="emerald" />
          <StatCard label="Avg Response Time" value={`${data.stats.avgResponseTime}ms`} icon="⚡" color="amber" />
          <StatCard label="AI Confidence" value={`${(data.stats.avgConfidence * 100).toFixed(0)}%`} icon="🎯" color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Activity Chart (Simple CSS Bar Chart) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Search Activity (Last 7 Days)</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.recentActivity.length > 0 ? (
                data.recentActivity.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex justify-center">
                        <div 
                            className="w-full max-w-[40px] bg-blue-500 rounded-t-md transition-all duration-500 hover:bg-blue-600"
                            style={{ height: `${Math.max(day.count * 10, 4)}px` }} // Scale height
                        ></div>
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                            {day.count} searches
                        </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-medium">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No recent activity data</div>
              )}
            </div>
          </div>

          {/* Recent Events Log */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">System Overview</h3>
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-sm font-medium text-slate-700">Most Searched Term</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">"React Hooks"</div>
                    <div className="text-xs text-slate-500 mt-1">12 queries this week</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-sm font-medium text-slate-700">Top Contributor</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">Sarah Wilson</div>
                    <div className="text-xs text-slate-500 mt-1">5 documents uploaded</div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => {
    const colors = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', purple: 'bg-purple-50 text-purple-600' };
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>{icon}</div>
            <div><div className="text-sm font-medium text-slate-500">{label}</div><div className="text-2xl font-bold text-slate-900">{value}</div></div>
        </div>
    );
};

export default AnalyticsDashboard;