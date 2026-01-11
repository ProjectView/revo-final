
import React, { useState, useEffect, useRef } from 'react';
import { Building2, Users, Shield, Globe, Camera, Plus, Mail, Trash2, Edit2, ShieldCheck, HardHat, UserCircle, Save, Loader2, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Company, User } from '../types';
import UserModal from './UserModal';

type SettingsTab = 'general' | 'users';

const SettingsView: React.FC = () => {
  const { company, users, updateCompany, deleteUser, uploadCompanyLogo } = useData();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editedCompany, setEditedCompany] = useState<Partial<Company>>({
    name: '',
    siret: '',
    website: ''
  });

  useEffect(() => {
    if (company) {
      setEditedCompany({
        name: company.name,
        siret: company.siret || '',
        website: company.website || ''
      });
    }
  }, [company]);

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

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner une image valide.");
      return;
    }

    setIsUploadingLogo(true);
    try {
      await uploadCompanyLogo(file);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur upload logo:", error);
      alert("Erreur lors de l'envoi du logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (email: string) => {
    if (users.length <= 1) {
      alert("Impossible de supprimer le dernier utilisateur.");
      return;
    }
    if (window.confirm("Voulez-vous vraiment supprimer ce collaborateur ?")) {
      try {
        await deleteUser(email);
      } catch (error) {
        console.error("Erreur suppression utilisateur:", error);
      }
    }
  };

  if (!company) return null;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <div className="p-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuration Société</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Gérez l'identité de votre entreprise et les accès de votre équipe.</p>
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
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
              activeTab === 'general' 
                ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 translate-x-1' 
                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100'
            }`}
          >
            <Building2 size={18} /> Général
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
              activeTab === 'users' 
                ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 translate-x-1' 
                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100'
            }`}
          >
            <Users size={18} /> Utilisateurs
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
          {activeTab === 'general' ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 flex flex-col md:flex-row gap-12">
                <div className="flex flex-col items-center gap-4">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                  />
                  <div className="relative group" onClick={handleLogoClick}>
                    <div className="w-32 h-32 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-all overflow-hidden relative">
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
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer">
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
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveCompany}
                  disabled={isSubmitting}
                  className="bg-[#1a4d44] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden animate-in slide-in-from-right-4 duration-500">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Équipe de production</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestion des droits d'accès ({users.length})</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedUser(null); setIsUserModalOpen(true); }}
                  className="bg-[#1a4d44] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-emerald-800 transition-all active:scale-95"
                >
                  <Plus size={16} /> Ajouter un membre
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rôle</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
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
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.email)}
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
