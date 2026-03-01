import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/leaderboard', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user.token]);

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading leaderboard...</div>;

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-65px)] transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Top Contributors</h1>
          <p className="text-slate-500 dark:text-slate-400">Recognizing our most active knowledge sharers.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="px-6 py-4 text-center w-16">Rank</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4 text-center">Docs</th>
                  <th className="px-6 py-4 text-center">Comments</th>
                  <th className="px-6 py-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map((u, index) => (
                  <tr key={u.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors ${index < 3 ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-700 shadow-sm">
                          {u.avatar ? (
                            <img src={`http://127.0.0.1:5000${u.avatar}`} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-300">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{u.username}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{u.department || 'Contributor'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300 font-medium">{u.docCount}</td>
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300 font-medium">{u.commentCount}</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400">{u.score} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;