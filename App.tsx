import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import CalendarView from './components/CalendarView';
import SiteList from './components/SiteList';
import ClientGrid from './components/ClientGrid';
import ChecklistManager from './components/ChecklistManager';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import { View } from './types';
import { Menu, Loader2, AlertTriangle, X } from 'lucide-react';
import { DataProvider, useData } from './context/DataContext';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { loading, permissionError, setCompanyId } = useData();
  const [showErrorBanner, setShowErrorBanner] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem('revo_auth');
    if (savedAuth) setIsAuthenticated(true);
  }, []);

  const handleLogin = (email: string) => {
    localStorage.setItem('revo_auth', email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('revo_auth');
    setCompanyId(null); // Réinitialise la société
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
        <div className="relative">
          <div className="w-20 h-20 bg-emerald-900 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl animate-pulse relative z-10">R</div>
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
           <div className="flex items-center gap-2">
             <Loader2 className="animate-spin text-emerald-600" size={20} />
             <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Synchronisation Société</p>
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Récupération de vos chantiers...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'pipeline': return <Pipeline />;
      case 'calendar': return <CalendarView />;
      case 'sites': return <SiteList />;
      case 'clients': return <ClientGrid />;
      case 'checklists': return <ChecklistManager />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] overflow-hidden text-slate-900 relative">
      {permissionError && showErrorBanner && (
        <div className="fixed top-0 inset-x-0 z-[200] bg-rose-600 text-white p-4 shadow-2xl flex items-center justify-center gap-4 animate-in slide-in-from-top duration-500">
          <AlertTriangle size={24} className="shrink-0" />
          <div className="flex-1 text-sm font-bold">
            Erreur de Permission : Veuillez vérifier les règles de votre Realtime Database.
          </div>
          <button onClick={() => setShowErrorBanner(false)} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
      )}

      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-emerald-900 text-white p-4 rounded-full shadow-2xl active:scale-95 transition-transform"
      >
        <Menu size={24} />
      </button>

      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }} 
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-y-auto h-screen relative scroll-smooth bg-slate-50/50">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-50/20 to-transparent pointer-events-none"></div>
        <div className={`relative z-10 w-full pb-20 lg:pb-0 ${permissionError && showErrorBanner ? 'pt-16' : ''}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <DataProvider>
    <AppContent />
  </DataProvider>
);

export default App;