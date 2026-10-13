import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import {
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
  CheckCheck,
} from 'lucide-react';

const Navbar = ({ onOpenMobileSidebar, unreadCount, onRefreshNotifications }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = async () => {
    if (!notificationsDropdownOpen) {
      try {
        const res = await notificationService.getNotifications();
        if (res.data) {
          setRecentNotifications(res.data.slice(0, 5));
        }
      } catch {
        // ignore
      }
    }
    setNotificationsDropdownOpen(!notificationsDropdownOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      if (onRefreshNotifications) onRefreshNotifications();
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
          Welcome back, <strong className="text-slate-800">{user?.fullName}</strong>
        </span>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotifications}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full relative transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notificationsDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 text-xs hover:bg-slate-50 transition ${
                        !notif.isRead ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <p className="font-semibold text-slate-800">{notif.title}</p>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    No notifications yet
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setNotificationsDropdownOpen(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
              {initials}
            </div>
            <span className="hidden md:inline-block text-xs font-semibold text-slate-700 max-w-[120px] truncate">
              {user?.fullName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline-block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
