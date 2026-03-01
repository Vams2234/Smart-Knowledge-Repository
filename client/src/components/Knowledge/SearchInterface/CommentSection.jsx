import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const CommentSection = ({ documentId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [documentId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/documents/${documentId}/comments`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/documents/${documentId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await fetch(`http://127.0.0.1:5000/api/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setComments(comments.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Comments ({comments.length})</h3>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 dark:text-white transition-colors"
          rows="2"
        />
        <div className="flex justify-end mt-2">
          <button type="submit" disabled={loading || !newComment.trim()} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            Post Comment
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
               {comment.User?.avatar ? <img src={`http://127.0.0.1:5000${comment.User.avatar}`} alt="User" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">{comment.User?.username?.charAt(0).toUpperCase()}</div>}
            </div>
            <div className="flex-1">
              <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl rounded-tl-none">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{comment.User?.username}</span>
                  <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
              </div>
              {(user.id === comment.userId || user.role === 'admin') && (
                <button onClick={() => handleDelete(comment.id)} className="text-[10px] text-rose-500 hover:text-rose-700 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;