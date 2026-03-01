import React, { useContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SearchInterface from './components/Knowledge/SearchInterface/SearchInterface';
import IntelligentChat from './components/Chat/IntelligentChat/IntelligentChat';
import AnalyticsDashboard from './components/Admin/Analytics/AnalyticsDashboard';
import KnowledgeGraph from './components/Knowledge/KnowledgeGraph/KnowledgeGraph';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import UserDashboard from './components/User/UserDashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import UserList from './components/Admin/UserManagement/UserList';
import DocumentList from './components/Admin/DocumentManagement/DocumentList';
import SystemHealth from './components/Admin/SystemHealth/SystemHealth';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ReportList from './components/Admin/ReportManagement/ReportList';
import UserSettings from './components/User/UserSettings';
import HelpSupport from './components/Common/HelpSupport';
import DomainList from './components/Admin/DomainManagement/DomainList';
import Leaderboard from './components/Knowledge/Leaderboard/Leaderboard';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`text-sm font-medium transition-all duration-200 ${isActive ? 'text-blue-600 bg-blue-50/80 px-4 py-2 rounded-full shadow-sm ring-1 ring-blue-100' : 'text-slate-500 hover:text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-full'}`}
    >
      {children}
    </Link>
  );
};

const MainNavigation = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex gap-2">
      <NavLink to="/">Search</NavLink>
      <NavLink to="/chat">Chat Assistant</NavLink>
      <NavLink to="/graph">Graph View</NavLink>
      <NavLink to="/leaderboard">Leaderboard</NavLink>
      {user && user.role === 'admin' && <NavLink to="/analytics">Analytics</NavLink>}
    </div>
  );
};

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/notifications', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <div className="flex items-center gap-4">
       <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
         {theme === 'dark' ? '☀️' : '🌙'}
       </button>

       {user ? (
         <div className="flex items-center gap-3">
           <div className="relative" ref={notifRef}>
             <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
               <span className="text-xl">🔔</span>
               {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>}
             </button>
             
             {showNotifications && (
               <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                 <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notifications</h3>
                   <span className="text-xs text-slate-400">{unreadCount} unread</span>
                 </div>
                 <div className="max-h-80 overflow-y-auto">
                   {notifications.length === 0 ? (
                     <div className="p-4 text-center text-slate-400 text-sm">No notifications</div>
                   ) : (
                     notifications.map(n => (
                       <div 
                         key={n.id} 
                         onClick={() => !n.isRead && markAsRead(n.id)}
                         className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${n.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                       >
                         <p className="text-sm text-slate-700">{n.message}</p>
                         <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                       </div>
                     ))
                   )}
                 </div>
               </div>
             )}
           </div>

           <span className="text-sm font-medium text-slate-600">{user.username}</span>
           {user.role === 'admin' && (
             <>
               <NavLink to="/admin/users">Users</NavLink>
               <NavLink to="/admin/documents">Docs</NavLink>
               <NavLink to="/admin/reports">Reports</NavLink>
               <NavLink to="/admin/domains">Domains</NavLink>
               <NavLink to="/admin/health">Health</NavLink>
             </>
           )}
           <NavLink to="/settings">Settings</NavLink>
           <NavLink to="/help">Help</NavLink>
           <button onClick={logout} className="text-sm text-slate-400 hover:text-rose-500 transition-colors">Logout</button>
           <Link to="/profile">
             {user.avatar ? (
               <img 
                 src={`http://127.0.0.1:5000${user.avatar}`} 
                 alt={user.username}
                 className="w-9 h-9 rounded-full object-cover shadow-md ring-2 ring-white cursor-pointer hover:ring-blue-200 transition-all"
               />
             ) : (
               <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white cursor-pointer hover:ring-blue-200 transition-all">
                 {user.username.charAt(0).toUpperCase()}
               </div>
             )}
           </Link>
         </div>
       ) : (
         <div className="flex gap-4">
           <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-700">Sign In</Link>
           <Link to="/register" className="text-sm font-medium text-blue-600 hover:text-blue-700">Sign Up</Link>
         </div>
       )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-200">
          <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-3 flex items-center justify-between shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-8">
              <Link to="/" className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-2xl">🧠</span> Knowledge Repo
              </Link>
              <MainNavigation />
            </div>
            <NavBar />
          </nav>
          
          <Routes>
            <Route path="/" element={<SearchInterface />} />
            <Route path="/chat" element={
              <ProtectedRoute>
                <IntelligentChat />
              </ProtectedRoute>
            } />
            <Route path="/graph" element={
              <ProtectedRoute>
                <KnowledgeGraph />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute adminOnly={true}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <HelpSupport />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly={true}>
                <UserList />
              </ProtectedRoute>
            } />
            <Route path="/admin/documents" element={
              <ProtectedRoute adminOnly={true}>
                <DocumentList />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute adminOnly={true}>
                <ReportList />
              </ProtectedRoute>
            } />
            <Route path="/admin/domains" element={
              <ProtectedRoute adminOnly={true}>
                <DomainList />
              </ProtectedRoute>
            } />
            <Route path="/admin/health" element={
              <ProtectedRoute adminOnly={true}>
                <SystemHealth />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/resetpassword/:resettoken" element={<ResetPassword />} />
          </Routes>
        </div>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;