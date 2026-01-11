
import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, Shield, ShieldCheck, HardHat, Save, Loader2, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { User } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user }) => {
  const { saveUser } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Technicien' as User['role']
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'Technicien'
      });
    }
    setError(null);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await saveUser(formData);
      onClose();
    } catch (err) {
      setError("Erreur lors de l'enregistrement de l'utilisateur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[210] flex flex-col animate-slide-in">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {user ? 'Modifier le membre' : 'Ajouter un membre'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Accès collaborateur</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-rose-600">{error}</p>
            </div>
          )}

          <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
              <div className="relative group">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  type="text"
                  placeholder="ex: Jean Dupont"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  disabled={!!user}
                  type="email"
                  placeholder="nom@entreprise.fr"
                  className={`w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all ${user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              {user && <p className="text-[9px] text-slate-400 italic ml-1">L'adresse email ne peut pas être modifiée.</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rôle et Permissions</label>
              <div className="grid grid-cols-1 gap-3">
                {(['Administrateur', 'Conducteur de travaux', 'Technicien'] as User['role'][]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({...formData, role})}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      formData.role === role 
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      formData.role === role ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {role === 'Administrateur' ? <Shield size={20} /> : role === 'Conducteur de travaux' ? <ShieldCheck size={20} /> : <HardHat size={20} />}
                    </div>
                    <div>
                      <p className={`text-sm font-black ${formData.role === role ? 'text-emerald-900' : 'text-slate-800'}`}>{role}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {role === 'Administrateur' ? 'Accès total et configuration' : role === 'Conducteur de travaux' ? 'Gestion chantiers et clients' : 'Saisie terrain et photos'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-all active:scale-95"
          >
            Annuler
          </button>
          <button 
            type="submit"
            form="user-form"
            disabled={isSubmitting}
            className="flex-[2] py-4 bg-[#1a4d44] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSubmitting ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </>
  );
};

export default UserModal;
