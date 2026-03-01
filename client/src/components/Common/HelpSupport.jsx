import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

const HelpSupport = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('faq');
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ subject: '', message: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'tickets' && user) {
      fetchTickets();
    }
  }, [activeTab, user]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/support/me', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Ticket submitted successfully!');
        setFormData({ subject: '', message: '', priority: 'medium' });
        setActiveTab('tickets');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    { q: "How do I upload a document?", a: "Navigate to the Search page and click the '+ Contribute' button. You can upload PDF, TXT, or Markdown files." },
    { q: "Who can see my profile?", a: "By default, your profile is visible to all logged-in users. You can change this in Settings > Privacy." },
    { q: "How does the search work?", a: "Our search uses semantic understanding to find relevant content even if keywords don't match exactly." },
    { q: "Can I delete my account?", a: "Yes, please contact an administrator to request account deletion." }
  ];

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-65px)] transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Help & Support</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Find answers or contact our support team.</p>

        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('faq')}
            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'faq' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 dark:text-slate-400'}`}
          >
            FAQ
          </button>
          <button 
            onClick={() => setActiveTab('contact')}
            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'contact' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Contact Support
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'tickets' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 dark:text-slate-400'}`}
          >
            My Tickets
          </button>
        </div>

        {activeTab === 'faq' && (
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-slate-600 dark:text-slate-300">{faq.a}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea 
                  rows="5"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  required
                ></textarea>
              </div>
              <button type="submit" disabled={submitting} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-70">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {tickets.length === 0 ? <p className="text-slate-500 dark:text-slate-400">No tickets found.</p> : tickets.map(ticket => (
              <div key={ticket.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{ticket.subject}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{ticket.message.substring(0, 100)}...</p>
                  <span className="text-xs text-slate-400 mt-2 block">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{ticket.status}</span>
                  <span className={`text-xs font-medium ${ticket.priority === 'high' ? 'text-rose-500' : 'text-slate-500'}`}>{ticket.priority} Priority</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpSupport;