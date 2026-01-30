import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, Mail, Shield, HardHat, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface ConfirmDeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (email: string) => Promise<void>;
}

const ConfirmDeleteUserModal: React.FC<ConfirmDeleteUserModalProps> = ({ isOpen, onClose, user, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(user.email);
      handleClose();
    } catch (err: any) {
      console.error('Delete user error:', err);
      setError('Erreur lors de la suppression. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] animate-fade-in" onClick={handleClose} />
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-scale-in">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg mt-0.5">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Supprimer un utilisateur</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Action irréversible</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Warning Message */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <p className="text-sm font-bold text-rose-700 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est <strong>irréversible</strong> et tous ses données seront perdues.
              </p>
            </div>

            {/* User Details */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Utilisateur à supprimer</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 font-black text-sm overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                      <Mail size={12} /> {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rôle</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                  user.role === 'Administrateur'
                    ? 'bg-purple-50 text-purple-600 border-purple-100'
                    : user.role === 'Conducteur de travaux'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {user.role === 'Administrateur' ? <Shield size={10} /> : user.role === 'Conducteur de travaux' ? <ShieldCheck size={10} /> : <HardHat size={10} />}
                  {user.role}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-gap-3 gap-3">
                <AlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-700">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  Supprimer définitivement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDeleteUserModal;
