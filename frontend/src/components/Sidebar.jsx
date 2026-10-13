import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  PlusCircle,
  FolderKanban,
  History,
  Trophy,
  Bell,
  User,
  GraduationCap,
} from 'lucide-react';

const Sidebar = ({ unreadCount = 0, onCloseMobile }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'All Quizzes', path: '/quizzes', icon: Compass },
    { name: 'Create Quiz', path: '/quizzes/create', icon: PlusCircle },
    { name: 'My Quizzes', path: '/my-quizzes', icon: FolderKanban },
    { name: 'My Attempts', path: '/my-attempts', icon: History },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <NavLink to="/dashboard" className="flex items-center space-x-3 text-indigo-600 font-bold text-lg">
          <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-900 font-extrabold tracking-tight block text-base leading-tight">
              QuizMaster
            </span>
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
              Online Quiz App
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                <span>{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
