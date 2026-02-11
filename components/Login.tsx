
import React, { useState, useEffect, useRef } from 'react';
import { LogIn, ShieldCheck, Loader2, Building2, UserPlus, ArrowLeft, User, AlertCircle, Lock, Key, Camera, Briefcase } from 'lucide-react';
import { useData } from '../context/DataContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

interface LoginProps {
  onLogin: (email: string) => void;
  onBackToLanding?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBackToLanding }) => {
  const { setCompanyId, loginWithEmail, createCompany, checkInvitation, saveUser, uploadAvatarDuringSignup } = useData();
  const [isRegistering, setIsRegistering] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    if (inviteToken) {
      checkInvitation(inviteToken).then(data => {
        if (data) {
          setInvitationData(data);
          setEmail(data.email);
          setUserName(data.name);
          setIsRegistering(true);
        } else {
          setError("Lien d'invitation invalide ou expiré.");
        }
      });
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // Step 1: Check for existing sessions BEFORE Firebase Auth
      const userRef = doc(db, 'users', cleanEmail);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as any;
        const activeSessions = userData.activeSessions || [];
        const maxConcurrentSessions = userData.maxConcurrentSessions || 1;

        // If user already has an active session, reject login
        if (activeSessions.length >= maxConcurrentSessions) {
          setError("Vous êtes déjà connecté sur cet appareil. Veuillez vous déconnecter d'abord.");
          setIsSubmitting(false);
          return;
        }
      }

      // Step 2: Authenticate with Firebase
      await signInWithEmailAndPassword(auth, cleanEmail, password);

      // Step 3: Get company ID and create new session
      const compId = await loginWithEmail(cleanEmail);
      if (compId) {
        // Step 4: Generate unique session ID and store it
        const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        sessionStorage.setItem('revo_session_id', sessionId);

        // Step 5: Update user document with new session
        const now = new Date().toISOString();
        const newSession = {
          sessionId,
          loginTime: now,
          lastActivityTime: now,
        };

        const userRef = doc(db, 'users', cleanEmail);
        await updateDoc(userRef, {
          activeSessions: [newSession], // Remplace les sessions précédentes pour respecter la limite de 1
        });

        setCompanyId(compId);
        onLogin(cleanEmail);
      } else {
        setError("Profil Firestore manquant. Contactez votre administrateur.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Firebase Login Error:", err.code);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("Email ou mot de passe incorrect.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Compte bloqué temporairement (trop d'essais).");
      } else if (err.message === "Vous êtes déjà connecté") {
        // Session limit error - already set above
      } else {
        setError("Erreur d'accès à la plateforme.");
      }
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Éviter les double submissions (particulièrement en mode strict de React)
    if (isSubmitting || isProcessing) {
      return;
    }

    setIsSubmitting(true);
    setIsProcessing(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (invitationData) {
        // 1. Créer l'utilisateur Firebase Auth avec le nouveau mot de passe
        const cleanEmail = invitationData.email.toLowerCase();

        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, password);
        } catch (authErr: any) {
          // Si l'utilisateur existe déjà (peut arriver par double submit ou si Strict Mode)
          if (authErr.code === 'auth/email-already-in-use') {
            console.warn("Utilisateur existe déjà dans Firebase Auth, utilisation du compte existant...");
            // Si l'utilisateur existe, on suppose qu'il est déjà loggé ou on peut se connecter
            // Vérifier si l'utilisateur courant correspond
            if (auth.currentUser?.email?.toLowerCase() === cleanEmail) {
              console.log("Utilisateur déjà loggé avec le bon email");
            } else {
              // Essayer de se connecter avec le nouveau mot de passe
              try {
                await signInWithEmailAndPassword(auth, cleanEmail, password);
              } catch (signInErr: any) {
                // Si la connexion échoue, afficher un message utile
                if (signInErr.code === 'auth/wrong-password') {
                  throw new Error("Le mot de passe ne correspond pas. Veuillez réessayer.");
                }
                throw signInErr;
              }
            }
          } else {
            throw authErr;
          }
        }

        // 2. Upload Avatar si présent
        let avatarUrl = '';
        if (avatarFile) {
          avatarUrl = await uploadAvatarDuringSignup(cleanEmail, avatarFile);
        }

        // 3. Sauvegarde profil utilisateur
        await saveUser({
          email: cleanEmail,
          name: userName,
          role: invitationData.role,
          avatar: avatarUrl || undefined,
          habilitations: invitationData.habilitations
        }, invitationData.companyId);

        // 4. Update Invitation (seulement si le token existe)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('invite');
        if (token) {
          await updateDoc(doc(db, 'invitations', token), { status: 'accepted' });
        }

        setCompanyId(invitationData.companyId);
        onLogin(cleanEmail);
      } else {
        // Inscription classique (Création de société)
        if (!companyName.trim() || !userName.trim() || !cleanEmail) {
          setError("Veuillez remplir tous les champs.");
          setIsSubmitting(false);
          setIsProcessing(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const newCompId = await createCompany(companyName, cleanEmail, userName);
        setCompanyId(newCompId);
        onLogin(cleanEmail);
      }
    } catch (err: any) {
      console.error("Register Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Cet email est déjà utilisé. Si vous avez déjà un compte, veuillez vous connecter.");
      } else if (err.code === 'auth/weak-password') {
        setError("Mot de passe trop court (6 caractères min).");
      } else if (err.code === 'auth/wrong-password') {
        setError("Le mot de passe ne correspond pas au compte existant.");
      } else {
        setError("Échec de l'initialisation de votre profil.");
      }
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-lg px-6 py-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-10 lg:p-14">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-emerald-900 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-emerald-900/30 mb-6">
              R
            </div>
            {invitationData ? (
              <div className="text-center">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bienvenue chez {invitationData.companyName}</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Finalisez votre profil REVO</p>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">REVO</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
                  {isRegistering ? 'Déployer votre espace BTP' : 'Accès Plateforme'}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
            
            {isRegistering && invitationData && (
              <div className="flex flex-col items-center mb-8 gap-4">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center relative cursor-pointer group hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={32} />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Éditer</span>
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photo de profil (Optionnel)</p>
              </div>
            )}

            {isRegistering && !invitationData && (
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
            )}

            {isRegistering && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Votre Nom Complet</label>
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
            )}

            {isRegistering && invitationData && (
               <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Votre Rôle</label>
                <div className="relative group">
                  <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors" />
                  <input 
                    type="text" disabled
                    value={invitationData.role}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Professionnel</label>
              <div className="relative group">
                <LogIn size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                <input 
                  type="email" required
                  disabled={!!invitationData}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all ${invitationData ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="nom@entreprise.fr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {isRegistering ? 'Définir votre mot de passe' : 'Mot de passe'}
              </label>
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
                  Initialisation...
                </>
              ) : (
                invitationData ? 'Activer mon accès' : isRegistering ? 'Initialiser mon activité' : 'Se connecter'
              )}
            </button>
          </form>

          {!invitationData && (
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
              {onBackToLanding && (
                <button
                  onClick={onBackToLanding}
                  className="flex items-center gap-2 text-slate-300 hover:text-slate-500 text-[10px] font-bold uppercase tracking-widest transition-colors mt-2"
                >
                  <ArrowLeft size={14} /> Retour à l'accueil
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
