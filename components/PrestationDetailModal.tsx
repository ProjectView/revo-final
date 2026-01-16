
import React, { useState } from 'react';
import { X, Wrench, Trash2, Edit3, Info, CheckSquare, Save, Loader2 } from 'lucide-react';
import { Prestation, Status } from '../types';
import { useData } from '../context/DataContext';

interface PrestationDetailModalProps {
  prestationId: string | null;
  onClose: () => void;
}

const PrestationDetailModal: React.FC<PrestationDetailModalProps> = ({ prestationId, onClose }) => {
  const { prestations, updatePrestation, deletePrestation } = useData();
  const prestation = prestations.find(p => p.id === prestationId);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedName, setEditedName] = useState(prestation?.name || '');

  if (!prestationId || !prestation) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updatePrestation(prestation.id, { name: editedName });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer cette prestation ?')) {
      await deletePrestation(prestation.id);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[70] flex flex-col animate-slide-in">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wrench size={20} />
              </div>
              {isEditing ? (
                <input className="text-xl font-black text-slate-900 border-b-2 border-emerald-500 outline-none" 
                  value={editedName} onChange={e => setEditedName(e.target.value)} />
              ) : (
                <h2 className="text-xl font-black text-slate-900">{prestation.name}</h2>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Adresse</p>
              <p className="text-sm font-bold text-slate-800">{prestation.address}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Budget</p>
              <p className="text-xl font-black text-emerald-900">{prestation.budget.toLocaleString()} €</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3">
          {isEditing ? (
            <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <Save size={18} /> Sauvegarder
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex-1 bg-emerald-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <Edit3 size={18} /> Modifier
            </button>
          )}
          <button onClick={handleDelete} className="p-3 border border-red-100 text-red-500 rounded-xl hover:bg-red-50">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default PrestationDetailModal;
