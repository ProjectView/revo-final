
import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, Shield, ShieldCheck, HardHat, Save, Loader2, AlertCircle, CheckCircle2, Zap, Radiation, Beaker, Lock, Send, Plus, UserCog, Trash2, Eye } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSubscription } from '../hooks/useSubscription';
import { User, CustomRole, CustomHabilitation } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const HABILITATIONS_LIST = [
  { id: 'Nucléaire (PR1CC)', icon: <Radiation size={14} />, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { id: 'Chimie (N1)', icon: <Beaker size={14} />, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { id: 'Chimie (N2)', icon: <Beaker size={14} />, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  { id: 'Secret Défense', icon: <Lock size={14} />, color: 'text-rose-600 bg-rose-50 border-rose-100' },
  { id: 'Electrique', icon: <Zap size={14} />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
];

const DEFAULT_ROLES = [
  { id: 'Administrateur', name: 'Administrateur', description: 'Accès total', icon: Shield },
  { id: 'Conducteur de travaux', name: 'Conducteur de travaux', description: 'Gestion chantiers', icon: ShieldCheck },
  { id: 'Technicien', name: 'Technicien', description: 'Saisie terrain', icon: HardHat },
  { id: 'Utilisateur Externe', name: 'Utilisateur Externe', description: 'Accès limité sous-traitant', icon: Eye },
];

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user }) => {
  const { saveUser, inviteUser, company, updateCompany } = useData();
  const { canAddUser } = useSubscription();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [showNewHabilitationForm, setShowNewHabilitationForm] = useState(false);
  const [newHabilitationName, setNewHabilitationName] = useState('');
  const [newHabilitationColor, setNewHabilitationColor] = useState('text-slate-600 bg-slate-50 border-slate-100');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Technicien',
    habilitations: [] as string[]
  });

  const customRoles = company?.customRoles || [];
  const customHabilitations = company?.customHabilitations || [];

  const HABILITATION_COLORS = [
    { id: 'amber', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { id: 'blue', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { id: 'indigo', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { id: 'rose', color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { id: 'emerald', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { id: 'purple', color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { id: 'cyan', color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
    { id: 'orange', color: 'text-orange-600 bg-orange-50 border-orange-100' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        habilitations: user.habilitations || []
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'Technicien',
        habilitations: []
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
      if (user) {
        // Simple mise à jour des métadonnées Firestore
        await saveUser(formData);
      } else {
        // Envoi d'une invitation réelle
        const limitCheck = canAddUser();
        if (!limitCheck.allowed) {
          setError(`Limite atteinte: ${limitCheck.current}/${limitCheck.max} utilisateurs. Upgradez votre plan pour ajouter plus.`);
          setIsSubmitting(false);
          return;
        }
        await inviteUser(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'opération.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHabilitation = (hId: string) => {
    setFormData(prev => ({
      ...prev,
      habilitations: prev.habilitations.includes(hId)
        ? prev.habilitations.filter(id => id !== hId)
        : [...prev.habilitations, hId]
    }));
  };

  const handleAddCustomRole = async () => {
    if (!newRoleName.trim()) return;
    const newRole: CustomRole = {
      id: `custom_${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDescription.trim() || 'Rôle personnalisé'
    };
    await updateCompany({
      customRoles: [...customRoles, newRole]
    });
    setFormData({ ...formData, role: newRole.name });
    setNewRoleName('');
    setNewRoleDescription('');
    setShowNewRoleForm(false);
  };

  const handleDeleteCustomRole = async (roleId: string) => {
    const updatedRoles = customRoles.filter(r => r.id !== roleId);
    await updateCompany({ customRoles: updatedRoles });
    // Si le rôle supprimé était sélectionné, revenir à Technicien
    const deletedRole = customRoles.find(r => r.id === roleId);
    if (deletedRole && formData.role === deletedRole.name) {
      setFormData({ ...formData, role: 'Technicien' });
    }
  };

  const handleAddCustomHabilitation = async () => {
    if (!newHabilitationName.trim()) return;
    const newHabilitation: CustomHabilitation = {
      id: `hab_${Date.now()}`,
      name: newHabilitationName.trim(),
      color: newHabilitationColor
    };
    await updateCompany({
      customHabilitations: [...customHabilitations, newHabilitation]
    });
    setNewHabilitationName('');
    setNewHabilitationColor('text-slate-600 bg-slate-50 border-slate-100');
    setShowNewHabilitationForm(false);
  };

  const handleDeleteCustomHabilitation = async (habId: string) => {
    const updatedHabilitations = customHabilitations.filter(h => h.id !== habId);
    await updateCompany({ customHabilitations: updatedHabilitations });
    // Retirer l'habilitation supprimée de la sélection
    const deletedHab = customHabilitations.find(h => h.id === habId);
    if (deletedHab && formData.habilitations.includes(deletedHab.name)) {
      setFormData({
        ...formData,
        habilitations: formData.habilitations.filter(h => h !== deletedHab.name)
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-md:max-w-full max-w-[95vw] sm:max-w-md bg-white shadow-2xl z-[210] flex flex-col animate-slide-in">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {user ? 'Modifier le membre' : 'Inviter un membre'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Accès collaborateur</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-rose-600">{error}</p>
            </div>
          )}

          <form id="user-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
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
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rôle et Permissions</label>
                <button
                  type="button"
                  onClick={() => setShowNewRoleForm(!showNewRoleForm)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Plus size={14} />
                  Créer un rôle
                </button>
              </div>

              {showNewRoleForm && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                  <input
                    type="text"
                    placeholder="Nom du rôle"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Description (optionnel)"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowNewRoleForm(false); setNewRoleName(''); setNewRoleDescription(''); }}
                      className="flex-1 py-2.5 border border-emerald-200 rounded-xl text-[10px] font-black uppercase text-emerald-700 hover:bg-white transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomRole}
                      disabled={!newRoleName.trim()}
                      className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {/* Default roles */}
                {DEFAULT_ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({...formData, role: role.name})}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      formData.role === role.name
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      formData.role === role.name ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <role.icon size={20} />
                    </div>
                    <div>
                      <p className={`text-sm font-black ${formData.role === role.name ? 'text-emerald-900' : 'text-slate-800'}`}>{role.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{role.description}</p>
                    </div>
                  </button>
                ))}

                {/* Custom roles */}
                {customRoles.map((role) => (
                  <div
                    key={role.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      formData.role === role.name
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: role.name})}
                      className="flex items-center gap-4 flex-1 text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        formData.role === role.name ? 'bg-emerald-600 text-white' : 'bg-purple-100 text-purple-500'
                      }`}>
                        <UserCog size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-black ${formData.role === role.name ? 'text-emerald-900' : 'text-slate-800'}`}>{role.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{role.description}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomRole(role.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Habilitations</label>
                <button
                  type="button"
                  onClick={() => setShowNewHabilitationForm(!showNewHabilitationForm)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Plus size={14} />
                  Créer une habilitation
                </button>
              </div>

              {showNewHabilitationForm && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                  <input
                    type="text"
                    placeholder="Nom de l'habilitation"
                    value={newHabilitationName}
                    onChange={(e) => setNewHabilitationName(e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500">Couleur</label>
                    <div className="flex flex-wrap gap-2">
                      {HABILITATION_COLORS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setNewHabilitationColor(c.color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${c.color} ${
                            newHabilitationColor === c.color ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowNewHabilitationForm(false); setNewHabilitationName(''); }}
                      className="flex-1 py-2.5 border border-emerald-200 rounded-xl text-[10px] font-black uppercase text-emerald-700 hover:bg-white transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomHabilitation}
                      disabled={!newHabilitationName.trim()}
                      className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {/* Habilitations par défaut */}
                {HABILITATIONS_LIST.map((h) => {
                  const isSelected = formData.habilitations.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleHabilitation(h.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-all ${
                        isSelected
                          ? h.color + ' ring-2 ring-emerald-500/10'
                          : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {isSelected ? <CheckCircle2 size={14} className="shrink-0" /> : h.icon}
                      {h.id}
                    </button>
                  );
                })}

                {/* Habilitations personnalisées */}
                {customHabilitations.map((h) => {
                  const isSelected = formData.habilitations.includes(h.name);
                  return (
                    <div key={h.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => toggleHabilitation(h.name)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-all ${
                          isSelected
                            ? h.color + ' ring-2 ring-emerald-500/10'
                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 size={14} className="shrink-0" /> : <Shield size={14} className="shrink-0" />}
                        {h.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomHabilitation(h.id)}
                        className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  );
                })}
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
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (user ? <Save size={18} /> : <Send size={18} />)}
            {isSubmitting ? 'Opération...' : (user ? 'Sauvegarder' : 'Envoyer l\'invitation')}
          </button>
        </div>
      </div>
    </>
  );
};

export default UserModal;
