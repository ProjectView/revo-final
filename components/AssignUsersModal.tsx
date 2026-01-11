
import React, { useState } from 'react';
import { X, Search, Check, User as UserIcon, HardHat, ShieldCheck, Loader2 } from 'lucide-react';
import { User } from '../types';
import { useData } from '../context/DataContext';

interface AssignUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedUserIds: string[];
  onAssign: (userIds: string[]) => Promise<void>;
}

const AssignUsersModal: React.FC<AssignUsersModalProps> = ({ isOpen, onClose, assignedUserIds, onAssign }) => {
  const { users } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(assignedUserIds);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onAssign(selectedIds);
      onClose();
    } catch (error) {
      console.error("Erreur assignation utilisateurs:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'Administrateur': return <ShieldCheck size={14} className="text-purple-500" />;
      case 'Conducteur de travaux': return <HardHat size={14} className="text-blue-500" />;
      default: return <UserIcon size={14} className="text-slate-400" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[160] flex flex-col animate-slide-in">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Assigner l'équipe</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Sélectionnez les membres du chantier</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text"
              placeholder="Rechercher un membre..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300 text-center">
              <UserIcon size={48} strokeWidth={1} className="opacity-20 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Aucun membre trouvé</p>
            </div>
          ) : (
            filteredUsers.map(user => {
              const isSelected = selectedIds.includes(user.id);
              return (
                <div 
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}>
                    {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {getRoleIcon(user.role)}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.role}</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 group-hover:border-slate-300'
                  }`}>
                    {isSelected && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>
              );
            })
          )}
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
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-[2] py-4 bg-[#1a4d44] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
            {isSubmitting ? 'Enregistrement...' : `Confirmer (${selectedIds.length})`}
          </button>
        </div>
      </div>
    </>
  );
};

export default AssignUsersModal;
