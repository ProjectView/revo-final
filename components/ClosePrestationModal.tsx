
import React, { useState } from 'react';
import { X, AlertTriangle, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { Prestation } from '../types';

interface ClosePrestationModalProps {
  isOpen: boolean;
  prestation: Prestation | null;
  onClose: () => void;
  onConfirm: (prestationId: string) => Promise<void>;
}

const ClosePrestationModal: React.FC<ClosePrestationModalProps> = ({ isOpen, prestation, onClose, onConfirm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !prestation) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(prestation.id);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la clôture:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl z-[210] animate-in zoom-in-95 fade-in duration-300 p-8 m-4">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
            <Lock size={32} className="text-amber-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Clôturer la prestation
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Cette action va archiver définitivement cette prestation
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800 mb-2">Prestation concernée :</p>
              <p className="text-sm font-black text-slate-900">{prestation.name}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">{prestation.address}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-3">
            <p className="text-[10px] font-bold text-amber-700 flex items-start gap-2">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Une fois clôturée, cette prestation sera déplacée dans l'historique du client et ne sera plus modifiable.</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-[2] flex items-center justify-center gap-2 bg-amber-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Clôture en cours...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Confirmer la clôture
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ClosePrestationModal;
