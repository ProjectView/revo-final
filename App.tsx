
import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import { View } from './types';

// Code-split the main views: each is loaded only when navigated to.
const Dashboard = lazy(() => import('./components/Dashboard'));
const Pipeline = lazy(() => import('./components/Pipeline'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const SiteList = lazy(() => import('./components/SiteList'));
const PrestationList = lazy(() => import('./components/PrestationList'));
const ClientGrid = lazy(() => import('./components/ClientGrid'));
const ChecklistManager = lazy(() => import('./components/ChecklistManager'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const Login = lazy(() => import('./components/Login'));
const LandingPage = lazy(() => import('./components/LandingPage'));
import { EXTERNAL_ALLOWED_VIEWS } from './constants';
import { Menu, Loader2, AlertTriangle, X } from 'lucide-react';
import { DataProvider, useData } from './context/DataContext';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = check en cours
  const [showLanding, setShowLanding] = useState(true);
  const { loading, permissionError, setCompanyId, loginWithEmail, isExternalUser } = useData();
  const [showErrorBanner, setShowErrorBanner] = useState(true);
  const [sessionTerminatedError, setSessionTerminatedError] = useState(false);
  const authCheckRef = React.useRef(false);
  const sessionCheckIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Only process auth state once on initial load
      if (authCheckRef.current) return;

      if (user && user.email) {
        // L'utilisateur est connecté à Auth, vérifions son rattachement Firestore
        const compId = await loginWithEmail(user.email);
        if (compId) {
          localStorage.setItem('revo_auth', user.email);
          setCompanyId(compId);
          setIsAuthenticated(true);
          authCheckRef.current = true;
        } else {
          // Cas où le compte Auth existe mais pas le profil (ex: suppression manuelle Firestore)
          setIsAuthenticated(false);
          authCheckRef.current = true;
        }
      } else {
        setIsAuthenticated(false);
        authCheckRef.current = true;
      }
    });
    return () => unsubscribe();
  }, []);

  // Garde de navigation pour les utilisateurs externes
  useEffect(() => {
    if (!loading && isExternalUser && !EXTERNAL_ALLOWED_VIEWS.includes(currentView)) {
      setCurrentView('sites');
    }
  }, [loading, isExternalUser, currentView]);

  // Vérifier régulièrement si la session a été terminée par une autre connexion
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSessionValidity = async () => {
      try {
        const sessionId = sessionStorage.getItem('revo_session_id');
        const email = localStorage.getItem('revo_auth');

        if (!sessionId || !email) return;

        // Vérifier que la session est toujours valide en Firestore
        const userRef = doc(db, 'users', email);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data() as any;
        const activeSessions = userData.activeSessions || [];

        // Chercher la session courante dans les sessions actives
        const currentSessionExists = activeSessions.some(
          (s: any) => s.sessionId === sessionId
        );

        // Si la session n'existe plus, c'est qu'elle a été tuée par une nouvelle connexion
        if (!currentSessionExists && activeSessions.length > 0) {
          setSessionTerminatedError(true);
          // Force logout
          await signOut(auth);
          localStorage.removeItem('revo_auth');
          sessionStorage.removeItem('revo_session_id');
          setIsAuthenticated(false);
          setShowLanding(true);
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };

    // Vérifier toutes les 5 secondes
    sessionCheckIntervalRef.current = setInterval(checkSessionValidity, 5000);

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [isAuthenticated]);

  const handleLogin = (email: string) => {
    // Store auth email in localStorage (onAuthStateChanged might be skipped by authCheckRef)
    localStorage.setItem('revo_auth', email.toLowerCase());
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      // Clean up session before logout
      const sessionId = sessionStorage.getItem('revo_session_id');
      const email = localStorage.getItem('revo_auth');

      if (sessionId && email) {
        const userRef = doc(db, 'users', email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data() as any;
          const updatedSessions = (userData.activeSessions || [])
            .filter((s: any) => s.sessionId !== sessionId);
          await updateDoc(userRef, { activeSessions: updatedSessions });
        }
      }

      await signOut(auth);
      localStorage.removeItem('revo_auth');
      sessionStorage.removeItem('revo_session_id');
      authCheckRef.current = false;
      setCompanyId(null);
      setIsAuthenticated(false);
      setShowLanding(true);
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout même en cas d'erreur
      await signOut(auth);
      localStorage.removeItem('revo_auth');
      sessionStorage.removeItem('revo_session_id');
      setIsAuthenticated(false);
      setShowLanding(true);
    }
  };

  const PageLoader = (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-emerald-900" size={32} />
    </div>
  );

  // État initial de branchement
  if (isAuthenticated === null) {
    return PageLoader;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={PageLoader}>
        {showLanding
          ? <LandingPage onGoToLogin={() => setShowLanding(false)} />
          : <Login onLogin={handleLogin} onBackToLanding={() => setShowLanding(true)} />}
      </Suspense>
    );
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
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Récupération de vos données...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onViewChange={setCurrentView} />;
      case 'pipeline': return <Pipeline />;
      case 'calendar': return <CalendarView />;
      case 'sites': return <SiteList />;
      case 'prestations': return <PrestationList />;
      case 'clients': return <ClientGrid />;
      case 'checklists': return <ChecklistManager />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] overflow-hidden text-slate-900 relative">
      {sessionTerminatedError && (
        <div className="fixed top-0 inset-x-0 z-[200] bg-amber-600 text-white p-4 shadow-2xl flex items-center justify-center gap-4 animate-in slide-in-from-top duration-500">
          <AlertTriangle size={24} className="shrink-0" />
          <div className="flex-1 text-sm font-bold">
            Votre session a été fermée car vous avez vous connecté depuis un autre appareil.
          </div>
          <button onClick={() => setSessionTerminatedError(false)} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
      )}
      {permissionError && showErrorBanner && (
        <div className="fixed top-0 inset-x-0 z-[200] bg-rose-600 text-white p-4 shadow-2xl flex items-center justify-center gap-4 animate-in slide-in-from-top duration-500">
          <AlertTriangle size={24} className="shrink-0" />
          <div className="flex-1 text-sm font-bold">
            Erreur de Permission : Accès restreint ou problème de base de données.
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
      
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden h-screen relative scroll-smooth bg-slate-50/50 w-full">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-50/20 to-transparent pointer-events-none"></div>
        <div className={`relative z-10 w-full pb-20 lg:pb-0 ${permissionError && showErrorBanner ? 'pt-16' : ''}`}>
          <Suspense fallback={PageLoader}>
            {renderContent()}
          </Suspense>
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
