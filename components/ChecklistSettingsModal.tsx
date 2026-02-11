import React, { useState, useEffect } from 'react';
import { X, Settings2, Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';

interface ChecklistSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChecklistSettingsModal: React.FC<ChecklistSettingsModalProps> = ({ isOpen, onClose }) => {
  const { company, updateCompany } = useData();
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (company?.checklistCategories) {
      setCategories([...company.checklistCategories]);
    } else {
      // Par défaut : Technique et ADV
      setCategories(['Technique', 'ADV']);
    }
    setNewCategory('');
  }, [isOpen, company?.checklistCategories]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) return;

    setCategories([...categories, trimmed]);
    setNewCategory('');
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
    setCategories(newCategories);
  };

  const handleMoveDown = (index: number) => {
    if (index >= categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    setCategories(newCategories);
  };

  const handleSave = async () => {
    if (categories.length === 0) {
      alert('Vous devez avoir au moins une catégorie');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCompany({ checklistCategories: categories });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-[95vw] sm:max-w-lg bg-white shadow-2xl z-[90] flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Paramètres Checklist</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Gestion des catégories</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Catégories disponibles</p>
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-2 text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Monter"
                      >
                        <ArrowUp size={18} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === categories.length - 1}
                        className="p-2 text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Descendre"
                      >
                        <ArrowDown size={18} />
                      </button>
                      <button
                        onClick={() => handleRemoveCategory(index)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Ajouter une catégorie</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Nom de la catégorie..."
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddCategory()}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-200 transition-all"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>
              {newCategory && categories.includes(newCategory.trim()) && (
                <p className="text-[10px] text-red-500 font-bold mt-2">Cette catégorie existe déjà</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-[2] py-4 px-6 bg-[#1a4d44] text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
            Enregistrer les changements
          </button>
        </div>
      </div>
    </>
  );
};

export default ChecklistSettingsModal;
