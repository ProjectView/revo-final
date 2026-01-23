
import React, { useState, useEffect, useRef } from 'react';
import { Building2, Users, Shield, Globe, Camera, Plus, Mail, Trash2, Edit2, ShieldCheck, HardHat, UserCircle, Save, Loader2, User, Key, Bell, Smartphone, Gauge, Zap, Radiation, Beaker, Lock, CreditCard, X, Check, Users as UsersIcon, Briefcase } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '../constants';
import { Company, User as UserType } from '../types';
import UserModal from './UserModal';
import { AdminSubscriptionManager } from './AdminSubscriptionManager';

type SettingsTab = 'profile' | 'general' | 'users' | 'subscription';

const HABILITATION_ICONS: Record<string, { icon: React.ReactNode, color: string }> = {
  'Nucléaire (PR1CC)': { icon: <Radiation size={10} />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  'Chimie (N1)': { icon: <Beaker size={10} />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  'Chimie (N2)': { icon: <Beaker size={10} />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  'Secret Défense': { icon: <Lock size={10} />, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  'Electrique': { icon: <Zap size={10} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
};

const SettingsView: React.FC = () => {
  const { company, users, updateCompany, deleteUser, uploadCompanyLogo, uploadUserAvatar, saveUser } = useData();
  const { planConfig, getUsagePercentage, isUnlimited } = useSubscription();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const companyLogoRef = useRef<HTMLInputElement>(null);
  const userAvatarRef = useRef<HTMLInputElement>(null);
  
  const currentUserEmail = localStorage.getItem('revo_auth');
  const currentUser = users.find(u => u.email.toLowerCase() === currentUserEmail?.toLowerCase());

  const [editedCompany, setEditedCompany] = useState<Partial<Company>>({
    name: '',
    siret: '',
    website: '',
    maxSimultaneousSites: 2
  });

  const [editedProfile, setEditedProfile] = useState({
    name: '',
  });

  useEffect(() => {
    if (company) {
      setEditedCompany({
        name: company.name,
        siret: company.siret || '',
        website: company.website || '',
        maxSimultaneousSites: company.maxSimultaneousSites || 2
      });
    }
    if (currentUser) {
      setEditedProfile({
        name: currentUser.name,
      });
    }
  }, [company, currentUser]);

  const handleSaveCompany = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);
    try {
      await updateCompany(editedCompany);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur mise à jour société:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await saveUser({
        ...currentUser,
        name: editedProfile.name
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      await uploadCompanyLogo(file);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      await uploadUserAvatar(file);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!company) return null;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <div className="p-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Réglages</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Personnalisez votre espace de travail et gérez votre compte.</p>
        </div>
        {saveSuccess && (
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2 animate-in slide-in-from-top-2">
            <ShieldCheck size={16} /> Modifications enregistrées !
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden px-8 pb-8 gap-8">
        {/* Navigation Sidebar */}
        <div className="w-64 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
              activeTab === 'profile' 
                ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 translate-x-1' 
                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100 shadow-sm'
            }`}
          >
            <UserCircle size={18} /> Mon profil
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
              activeTab === 'general' 
                ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 translate-x-1' 
                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100 shadow-sm'
            }`}
          >
            <Building2 size={18} /> Société
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
              activeTab === 'users'
                ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 translate-x-1'
                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100 shadow-sm'
            }`}
          >
            <Users size={18} /> Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
              activeTab === 'subscription'
                ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 translate-x-1'
                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100 shadow-sm'
            }`}
          >
            <CreditCard size={18} /> Abonnement
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-10">
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <input 
                      type="file" 
                      ref={userAvatarRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarChange}
                    />
                    <div 
                      onClick={() => userAvatarRef.current?.click()}
                      className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 font-black text-2xl border-2 border-slate-50 shadow-inner overflow-hidden relative cursor-pointer hover:border-emerald-500 transition-all"
                    >
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 z-20 bg-emerald-900/20 flex items-center justify-center">
                          <Loader2 className="animate-spin text-emerald-600" size={24} />
                        </div>
                      )}
                      {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        currentUser?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Camera size={20} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{currentUser?.name}</h3>
                    <p className="text-sm font-medium text-slate-500">{currentUser?.email}</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      <Shield size={12} /> {currentUser?.role}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom d'affichage</label>
                    <div className="relative group">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="text" 
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail (Non modifiable)</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        value={currentUser?.email}
                        readOnly
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-400 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 opacity-50 cursor-not-allowed">
                    <Key size={18} className="text-slate-400" />
                    <span className="text-[11px] font-black uppercase text-slate-500">Changer de mot de passe</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 opacity-50 cursor-not-allowed">
                    <Smartphone size={18} className="text-slate-400" />
                    <span className="text-[11px] font-black uppercase text-slate-500">Appareils connectés</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 opacity-50 cursor-not-allowed">
                    <Bell size={18} className="text-slate-400" />
                    <span className="text-[11px] font-black uppercase text-slate-500">Notifications</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSubmitting}
                  className="bg-[#1a4d44] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Enregistrer mon profil
                </button>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 flex flex-col md:flex-row gap-12">
                <div className="flex flex-col items-center gap-4">
                  <input 
                    type="file" 
                    ref={companyLogoRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                  />
                  <div className="relative group" onClick={() => companyLogoRef.current?.click()}>
                    <div className="w-32 h-32 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-all overflow-hidden relative cursor-pointer">
                      {isUploadingLogo && (
                        <div className="absolute inset-0 z-20 bg-emerald-900/20 flex items-center justify-center">
                          <Loader2 className="animate-spin text-emerald-600" size={24} />
                        </div>
                      )}
                      {company.logo ? (
                        <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={48} className="group-hover:scale-110 transition-transform" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Camera size={24} />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Logo de l'entreprise</p>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de la société</label>
                    <input 
                      type="text" 
                      value={editedCompany.name}
                      onChange={(e) => setEditedCompany({...editedCompany, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SIRET</label>
                    <input 
                      type="text" 
                      value={editedCompany.siret}
                      onChange={(e) => setEditedCompany({...editedCompany, siret: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      placeholder="842 563 124 00021"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site Web</label>
                    <div className="relative group">
                      <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="text" 
                        value={editedCompany.website}
                        onChange={(e) => setEditedCompany({...editedCompany, website: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        placeholder="www.revo-btp.fr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chantiers simultanés</label>
                    <div className="relative group">
                      <Gauge size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="number" 
                        min="1"
                        max="50"
                        value={editedCompany.maxSimultaneousSites}
                        onChange={(e) => setEditedCompany({...editedCompany, maxSimultaneousSites: parseInt(e.target.value) || 1})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveCompany}
                  disabled={isSubmitting}
                  className="bg-[#1a4d44] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Sauvegarder les infos société
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Collaborateurs</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestion des droits ({users.length})</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedUser(null); setIsUserModalOpen(true); }}
                  className="bg-[#1a4d44] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-emerald-800 transition-all active:scale-95"
                >
                  <Plus size={16} /> Ajouter un membre
                </button>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rôle</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Habilitations</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 leading-tight">{user.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                <Mail size={10} /> {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                              user.role === 'Administrateur' 
                                ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                : user.role === 'Conducteur de travaux'
                                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {user.role === 'Administrateur' ? <Shield size={10} /> : user.role === 'Conducteur de travaux' ? <ShieldCheck size={10} /> : <HardHat size={10} />}
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {user.habilitations && user.habilitations.length > 0 ? (
                              user.habilitations.map(hId => {
                                const cfg = HABILITATION_ICONS[hId];
                                return (
                                  <div key={hId} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-tighter ${cfg?.color || 'bg-slate-50 text-slate-400'}`} title={hId}>
                                    {cfg?.icon}
                                    <span className="truncate max-w-[60px]">{hId}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-[8px] font-black text-slate-300 uppercase italic">Aucune</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setSelectedUser(user); setIsUserModalOpen(true); }}
                              className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => deleteUser(user.email)}
                              className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              {/* Current Plan Info */}
              <div className={`rounded-[2.5rem] border shadow-sm p-10 space-y-6 ${
                planConfig.id === 'multi_sites_premium'
                  ? 'bg-emerald-50 border-emerald-200'
                  : planConfig.id === 'chantier_pro'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 mb-2">Plan actuel</h3>
                  <h2 className="text-4xl font-black tracking-tight mb-2">{planConfig.name}</h2>
                  <p className="text-xs text-slate-600 font-medium">{planConfig.tagline}</p>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Clients', usage: getUsagePercentage('clients'), type: 'clients' },
                    { label: 'Chantiers', usage: getUsagePercentage('sites'), type: 'sites' },
                    { label: 'Utilisateurs', usage: getUsagePercentage('users'), type: 'users' }
                  ].map(stat => (
                    <div key={stat.type}>
                      <p className="text-xs font-bold uppercase tracking-tight text-slate-600 mb-2">{stat.label}</p>
                      <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isUnlimited(stat.type as any)
                              ? 'bg-emerald-500 w-0'
                              : stat.usage < 50
                              ? 'bg-emerald-500'
                              : stat.usage < 80
                              ? 'bg-amber-500'
                              : stat.usage < 100
                              ? 'bg-orange-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${isUnlimited(stat.type as any) ? 5 : Math.min(stat.usage, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-black text-slate-600 mt-1">
                        {isUnlimited(stat.type as any) ? 'Illimité' : `${stat.usage}%`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plans Selection */}
              {currentUser?.role === 'Administrateur' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Choisir un plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => {
                      const isCurrentPlan = company?.subscription?.plan === id;
                      const isPremium = id === 'multi_sites_premium';

                      return (
                        <button
                          key={id}
                          onClick={() => setSelectedPlanId(id)}
                          className={`group relative rounded-[2rem] overflow-hidden transition-all duration-300 text-left flex flex-col h-full ${
                            isCurrentPlan
                              ? 'ring-2 ring-emerald-500 shadow-xl'
                              : 'shadow-sm hover:shadow-lg hover:ring-1 hover:ring-slate-300'
                          }`}
                        >
                          {/* Header with background color */}
                          <div className={`${plan.color} px-8 pt-8 pb-6 relative overflow-hidden`}>
                            {/* Decorative circle */}
                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full" />

                            <div className="relative z-10">
                              {isCurrentPlan && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-full mb-3">
                                  <Check size={12} className={plan.textColor} />
                                  <span className={`text-[9px] font-black uppercase tracking-tight ${plan.textColor}`}>
                                    Plan actuel
                                  </span>
                                </div>
                              )}
                              <h4 className={`font-black text-2xl uppercase tracking-tight mb-1 ${plan.textColor}`}>
                                {plan.name}
                              </h4>
                              <p className={`text-xs font-bold ${plan.textColor} opacity-70`}>{plan.tagline}</p>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="px-8 py-6 border-b border-slate-100 bg-white">
                            <p className="text-base font-black text-slate-900">
                              {plan.isFree ? 'Gratuit' : `€${plan.pricing.monthly}`}
                              {!plan.isFree && <span className="text-xs font-bold text-slate-500 ml-1">/mois</span>}
                            </p>
                          </div>

                          {/* Content */}
                          <div className="px-8 py-8 flex-1 bg-white space-y-8 flex flex-col">
                            {/* Limits Grid */}
                            <div className="space-y-4">
                              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-600 flex-shrink-0">
                                  <Users size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Clients</p>
                                  <p className="text-xl font-black text-slate-900">
                                    {plan.limits.maxClients === Infinity ? '∞' : plan.limits.maxClients}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                                <div className="p-3 bg-amber-100 rounded-xl text-amber-600 flex-shrink-0">
                                  <HardHat size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Chantiers</p>
                                  <p className="text-xl font-black text-slate-900">
                                    {plan.limits.maxSites === Infinity ? '∞' : plan.limits.maxSites}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 flex-shrink-0">
                                  <UsersIcon size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Utilisateurs</p>
                                  <p className="text-xl font-black text-slate-900">
                                    {plan.limits.maxUsers === Infinity ? '∞' : plan.limits.maxUsers}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inclus</p>
                              <ul className="space-y-2.5">
                                {plan.features.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-2.5">
                                    <span className="text-emerald-600 font-black mt-0.5 flex-shrink-0">✓</span>
                                    <span className="text-xs font-bold text-slate-700 leading-snug">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="px-8 py-6 bg-white border-t border-slate-100">
                            {isCurrentPlan ? (
                              <div className="py-3 text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-tight">Votre abonnement actuel</p>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlanId(id);
                                }}
                                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-tight transition-all ${
                                  isPremium
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                }`}
                              >
                                Choisir ce plan
                              </button>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin Subscription Manager - Modal */}
              {selectedPlanId && currentUser?.role === 'Administrateur' && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedPlanId(null)} />
                  <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide">
                    <div className="sticky top-0 bg-white p-8 border-b border-slate-100 flex items-center justify-between z-10">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">Modifier l'abonnement</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Gestion du plan</p>
                      </div>
                      <button
                        onClick={() => setSelectedPlanId(null)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div className="p-8">
                      <AdminSubscriptionManager selectedPlanId={selectedPlanId} onClose={() => setSelectedPlanId(null)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Info */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Informations de facturation</h3>
                {company?.subscription ? (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-600 mb-1">Statut</p>
                      <p className="font-black">{company.subscription.status}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-600 mb-1">Période</p>
                      <p className="font-black">{company.subscription.billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-600 mb-1">Fin de période</p>
                      <p className="font-black">{new Date(company.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-600 mb-1">Méthode</p>
                      <p className="font-black">Manuel</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600">Plan non configuré</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <UserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        user={selectedUser} 
      />
    </div>
  );
};

export default SettingsView;
