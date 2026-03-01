import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EditProfileModal from './EditProfileModal';
import SkillsGraph from './SkillsGraph';
import CommentSection from './CommentSection';
import ReportModal from '../../Common/ReportModal';

const ProfileDetails = ({ profile, onClose, isBookmarked, onToggleBookmark, onProfileUpdate, onProfileDelete }) => {
  const [similarProfiles, setSimilarProfiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'graph'
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const isDocument = profile?.type === 'Document';

  useEffect(() => {
    if (profile && !isDocument) {
      setViewMode('list');
      setSimilarProfiles([]); // Reset
      fetch(`http://127.0.0.1:5000/api/profiles/${profile.id}/similar`)
        .then(res => res.json())
        .then(data => setSimilarProfiles(data))
        .catch(err => console.error("Failed to fetch similar profiles", err));
    }
  }, [profile, isDocument]);

  if (!profile) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/${isDocument ? 'documents' : 'profiles'}/${profile.id}`;
    navigator.clipboard.writeText(url);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  const handleDownload = async () => {
    try {
      // Use the download endpoint
      window.open(`http://127.0.0.1:5000/api/documents/${profile.id}/download`, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <AnimatePresence>
      {profile && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl border-l border-slate-100 z-50 overflow-y-auto"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-md ${isDocument ? 'bg-slate-100 text-slate-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'}`}>
                    {isDocument ? '📄' : profile.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                    <p className="text-slate-500 font-medium">{profile.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button 
                      onClick={handleShare}
                      className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                      title="Share"
                    >
                      🔗
                    </button>
                    {showShareTooltip && (
                      <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
                        Link copied!
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                    title="Report Content"
                  >
                    🚩
                  </button>
                  {!isDocument && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Profile"
                    >
                      ✎
                    </button>
                  )}
                  <button 
                    onClick={onToggleBookmark}
                    className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-yellow-50 text-yellow-500' : 'text-slate-300 hover:bg-slate-100'}`}
                  >
                    {isBookmarked ? '★' : '☆'}
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {isDocument ? 'Summary' : 'About'}
                  </h3>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {profile.bio || profile.content?.substring(0, 300) + '...'}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {isDocument ? 'File Type' : 'Expertise & Skills'}
                    </h3>
                    {!isDocument && (
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                List
                            </button>
                            <button 
                                onClick={() => setViewMode('graph')}
                                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'graph' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Graph
                            </button>
                        </div>
                    )}
                  </div>
                  
                  {viewMode === 'list' || isDocument ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.expertise && profile.expertise.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg font-semibold border border-blue-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                  ) : (
                      <SkillsGraph profile={profile} />
                  )}
                </div>

                {!isDocument && similarProfiles.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Similar Experts
                    </h3>
                    <div className="grid gap-3">
                      {similarProfiles.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-slate-100">
                  {isDocument ? (
                    <button onClick={handleDownload} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-200">
                      Download Document
                    </button>
                  ) : (
                    <a href={`mailto:${profile.email}`} className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200">
                      Contact {profile.name.split(' ')[0]}
                    </a>
                  )}
                </div>

                {isDocument && (
                  <CommentSection documentId={profile.id} />
                )}
              </div>
            </div>
          </motion.div>

          <EditProfileModal 
            isOpen={isEditing} 
            onClose={() => setIsEditing(false)} 
            profile={profile}
            onSave={onProfileUpdate}
            onDelete={onProfileDelete}
          />

          <ReportModal 
            isOpen={showReportModal} 
            onClose={() => setShowReportModal(false)} 
            targetId={profile.id}
            targetType={isDocument ? 'Document' : 'Profile'}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileDetails;