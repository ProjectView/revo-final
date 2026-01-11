
import React, { useState } from 'react';
import { LogIn, ShieldCheck, Loader2, Building2, UserPlus, ArrowLeft, User, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { setCompanyId, loginWithEmail, createCompany } = useData();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const compId = await loginWithEmail(email);
      if (compId) {
        setCompanyId(compId);
        onLogin(email);
      } else {
        setError("Identifiant inconnu. Veuillez créer une société si c'est votre première visite.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !userName.trim() || !email.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newCompId = await createCompany(companyName, email, userName);
      setCompanyId(newCompId);
      onLogin(email);
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la création. La société existe peut-être déjà.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 lg:p-12">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-emerald-900 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-emerald-900/30 mb-6">
              R
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">REVO</h1>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-2 text-center">
              {isRegistering ? 'Déployer votre espace BTP' : 'Accès Plateforme'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
            
            {isRegistering && (
              <>
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de votre société</label>
                  <div className="relative group">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                    <input 
                      type="text" required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      placeholder="ex: BTP Excellence"
                    />
                  </div>
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Votre Nom complet</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                    <input 
                      type="text" required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      placeholder="ex: Adelin Hugot"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Professionnel</label>
              <div className="relative group">
                <LogIn size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                <input 
                  type="email" required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  placeholder="nom@entreprise.fr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
              <div className="relative group">
                <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                <input 
                  type="password" required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Patientez...
                </>
              ) : (
                isRegistering ? 'Initialiser mon activité' : 'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col items-center gap-4">
             {isRegistering ? (
               <button 
                onClick={() => { setIsRegistering(false); setError(null); }}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors"
               >
                 <ArrowLeft size={16} /> Retour à la connexion
               </button>
             ) : (
               <button 
                onClick={() => { setIsRegistering(true); setError(null); }}
                className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 text-xs font-black uppercase tracking-widest transition-colors"
               >
                 <UserPlus size={16} /> Créer ma société
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
