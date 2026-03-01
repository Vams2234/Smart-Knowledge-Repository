import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import SearchResults from './SearchResults';
import ProfileDetails from './ProfileDetails';
import FeedbackModal from '../../Common/FeedbackModal';
import DocumentUpload from './DocumentUpload';

const SearchInterface = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
      fetchRecentSearches();
    }
    fetchTrendingSearches();
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/bookmarks/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const ids = await res.json();
      setBookmarkedIds(new Set(ids));
    } catch (err) {
      console.error("Failed to fetch bookmarks", err);
    }
  };

  const fetchRecentSearches = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/search/history', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecentSearches(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const fetchTrendingSearches = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/search/trending');
      if (res.ok) {
        const data = await res.json();
        setTrendingSearches(data);
      }
    } catch (err) {
      console.error("Failed to fetch trending", err);
    }
  };

  const performSearch = async (searchQuery) => {
    setLoading(true);
    setHasSearched(true);
    setShowHistory(false);
    try {
      // Use Advanced Search for semantic results
      const response = await fetch(`http://127.0.0.1:5000/api/search/advanced?query=${encodeURIComponent(searchQuery)}`, {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {}
      });
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
      if (user) fetchRecentSearches(); // Refresh history after search
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    performSearch(query);
  };

  const handleBookmarkToggle = async (item) => {
    if (!user) return alert("Please login to bookmark items");

    try {
      const res = await fetch('http://127.0.0.1:5000/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          userId: user.id,
          itemId: item.id,
          type: item.type,
          metadata: {
            name: item.name || item.title,
            role: item.role,
            department: item.department
          }
        })
      });
      const data = await res.json();
      
      const newBookmarks = new Set(bookmarkedIds);
      data.bookmarked ? newBookmarks.add(item.id) : newBookmarks.delete(item.id);
      setBookmarkedIds(newBookmarks);
    } catch (err) {
      console.error("Bookmark error", err);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setResults(results.map(r => r.id === updatedProfile.id ? { ...r, ...updatedProfile } : r));
    setSelectedProfile(updatedProfile);
  };

  const handleProfileDelete = (id) => {
    setResults(results.filter(r => r.id !== id));
    setSelectedProfile(null);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-12 px-4 transition-colors duration-200">
      <div className="w-full max-w-3xl text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
          Find Knowledge, <span className="text-blue-600 dark:text-blue-400">Instantly.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Search across documents, profiles, and expertise within the organization.
        </p>
      </div>

      <div className="w-full max-w-2xl mb-12">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all text-lg dark:text-white"
            placeholder="Search for 'Project Alpha' or 'React Experts'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          />
          <button type="submit" className="absolute inset-y-2 right-2 px-6 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
            Search
          </button>

          {/* Recent Searches Dropdown */}
          {showHistory && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20">
              <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-700/50">Recent Searches</div>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
                  onClick={() => { setQuery(term); performSearch(term); }}
                >
                  <span className="text-slate-400">🕒</span> {term}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Trending Topics */}
        {trendingSearches.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-fade-in">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">Trending:</span>
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => { setQuery(term); performSearch(term); }}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
              >
                #{term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controls & Results */}
      <div className="w-full max-w-6xl flex-1 flex flex-col">
        {hasSearched && (
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="text-slate-500 dark:text-slate-400 text-sm">
              Found {results.length} results
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowUpload(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors"
              >
                + Contribute
              </button>
              <button 
                onClick={() => setShowFeedback(true)}
                className="text-sm text-slate-400 hover:text-blue-600 mr-4 transition-colors"
              >
                Give Feedback
              </button>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 flex">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <SearchResults 
          results={results} 
          viewMode={viewMode} 
          isSearching={loading}
          onSelect={setSelectedProfile}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={handleBookmarkToggle}
        />
      </div>

      <ProfileDetails 
        profile={selectedProfile} 
        onClose={() => setSelectedProfile(null)}
        isBookmarked={selectedProfile && bookmarkedIds.has(selectedProfile.id)}
        onToggleBookmark={() => handleBookmarkToggle(selectedProfile)}
        onProfileUpdate={handleProfileUpdate}
        onProfileDelete={handleProfileDelete}
      />

      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)}
        type="search"
      />

      <DocumentUpload 
        isOpen={showUpload} 
        onClose={() => setShowUpload(false)} 
      />
    </div>
  );
};

export default SearchInterface;