import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, FolderOpen, BookOpen, MessageSquare, HelpCircle, BarChart3, Settings, Plus, Menu, X, LogOut, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ToastContainer } from './UI';

const navItems = [
  { path: '/app', icon: Home, label: 'Inicio' },
  { path: '/app/sets', icon: BookOpen, label: 'Mis Sets' },
  { path: '/app/folders', icon: FolderOpen, label: 'Carpetas' },
  { path: '/app/resolve', icon: HelpCircle, label: 'Resolver' },
  { path: '/app/progress', icon: BarChart3, label: 'Progreso' },
  { path: '/app/settings', icon: Settings, label: 'Configuración' },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-violet-50/30">
      <ToastContainer />
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-orange-500" />
          <span className="font-bold text-gray-800">KallpaLearn</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-violet-400 flex items-center justify-center text-white text-xs font-bold">
          {user?.name?.[0] || 'U'}
        </div>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg leading-tight">KallpaLearn</h1>
              <span className="text-[10px] font-medium text-violet-500 uppercase tracking-wider">AI</span>
            </div>
          </div>

          {/* Create button */}
          <div className="px-4 mb-4">
            <NavLink to="/app/create" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
              <Plus size={18} />
              Crear nuevo set
            </NavLink>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}>
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-violet-400 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition" title="Cerrar sesión">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
