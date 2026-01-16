
import React, { useState } from 'react';
import { LogOut, ChevronLeft, ChevronRight, X, Building2, Bell } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { View } from '../types';
import { useData } from '../context/DataContext';
import NotificationPanel from './NotificationPanel';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isMobileOpen, onCloseMobile, onLogout }) => {
  const { company, users, userNotifications } = useData();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);

  const currentUserEmail = localStorage.getItem('revo_auth');
  const currentUser = users.find(u => u.email.toLowerCase() === currentUserEmail?.toLowerCase());
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const getUserInitials = (name: string = '') => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside 
        className={`
          fixed inset-y-0 left-0 z-[110] lg:static bg-white border-r border-slate-200 h-screen flex flex-col transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed && !isMobileOpen ? 'w-24' : 'w-72'}
        `}
      >
        {/* Top Section */}
        <div className={`p-6 flex items-center justify-between transition-all ${isCollapsed && !isMobileOpen ? 'px-4' : 'px-8'}`}>
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="min-w-[44px] w-11 h-11 bg-emerald-900 rounded-xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-lg shadow-emerald-900/20">
              R
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-black text-2xl tracking-tight text-slate-800 whitespace-nowrap">
                  REVO
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest truncate max-w-[140px]">
                  {company?.name || 'Chargement...'}
                </span>
              </div>
            )}
          </div>
          
          {isMobileOpen ? (
            <button onClick={onCloseMobile} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          ) : (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 group relative overflow-hidden ${
                currentView === item.id
                  ? 'bg-emerald-50 text-emerald-800 font-black shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-bold'
              }`}
            >
              <span className={`flex-shrink-0 ${currentView === item.id ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 22 })}
              </span>
              
              {(!isCollapsed || isMobileOpen) && (
                <span className="text-[15px] text-left whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              )}

              {currentView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-emerald-600 rounded-r-full shadow-[0_0_8px_rgba(5,150,105,0.4)]"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className={`px-4 pb-8 mt-auto ${isCollapsed && !isMobileOpen ? 'items-center' : ''}`}>
          <div className="pt-6 border-t border-slate-100">
            {/* Notification Bell Button */}
            <button 
              onClick={() => setIsNotifPanelOpen(true)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl mb-2 group relative overflow-hidden text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-bold transition-all ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
            >
              <div className="relative">
                <Bell size={22} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white shadow-sm ring-1 ring-rose-200">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <span className="text-[15px] flex-1 text-left">Centre d'alertes</span>
              )}
            </button>

            <div className={`flex items-center gap-4 px-2 ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}>
              <div className="min-w-[48px] w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black text-sm border border-slate-200 shadow-sm flex-shrink-0 overflow-hidden">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  getUserInitials(currentUser?.name)
                )}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-black text-slate-800 truncate">{currentUser?.name || 'Chargement...'}</p>
                  <p className="text-xs text-slate-500 truncate font-semibold">{currentUser?.email || currentUserEmail}</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={onLogout}
              className={`flex items-center gap-3 py-4 mt-6 text-sm text-red-500 font-black hover:bg-red-50 rounded-xl transition-colors w-full ${isCollapsed && !isMobileOpen ? 'justify-center' : 'px-3'}`}
            >
              <LogOut size={20} />
              {(!isCollapsed || isMobileOpen) && <span>Déconnexion</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Notification Panel Component */}
      <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />
    </>
  );
};

export default Sidebar;
