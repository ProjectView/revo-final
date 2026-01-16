
import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Plus, Trash2, AlertTriangle, Type, AlignLeft, Tag, Save, Loader2 } from 'lucide-react';
import { ChecklistItem, ChecklistTemplate } from '../types';
import { useData } from '../context/DataContext';

interface NewChecklistTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ChecklistTemplate | null;
}

const NewChecklistTemplateModal: React.FC<NewChecklistTemplateModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addChecklistTemplate, updateChecklistTemplate } = useData();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Électricité');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<Partial<ChecklistItem>[]>([
    { id: '1', label: '', isCritical: false }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setItems(initialData.items);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const categories = ['Électricité', 'Plomberie', 'Maçonnerie', 'Finitions', 'Logistique', 'Menuiserie', 'Peinture'];

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), label: '', isCritical: false }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || items.some(i => !i.label)) return;

    setIsSubmitting(true);
    try {
      const templateData = {
        title,
        category,
        description,
        items: items as ChecklistItem[],
        lastUsed: initialData?.lastUsed || null
      };

      if (initialData) {
        await updateChecklistTemplate(initialData.id, templateData);
      } else {
        await addChecklistTemplate(templateData);
      }
      
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du modèle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Électricité');
    setDescription('');
    setItems([{ id: '1', label: '', isCritical: false }]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[130] flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {initialData ? 'Modifier le Modèle' : 'Créer un Modèle'}
              </h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Bibliothèque de qualité</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {isSubmitting && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          )}
          <form id="new-template-form" onSubmit={handleSubmit} className="space-y-8">
            {/* General Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre du modèle</label>
                <div className="relative group">
                  <Type size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    required
                    type="text"
                    placeholder="ex: Réception Plomberie Cuisine"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corps d'état</label>
                  <div className="relative">
                    <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 appearance-none focus:ring-4 focus:ring-emerald-500/10 outline-none"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Propriétaire</label>
                  <div className="flex items-center gap-2 h-[54px] bg-slate-50 border border-slate-100 rounded-2xl px-4">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-[10px] font-black">ENT</div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Votre Société</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description courte</label>
                <div className="relative group">
                  <AlignLeft size={18} className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <textarea 
                    placeholder="Instructions générales pour ce contrôle..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-slate-600 min-h-[100px] focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none resize-none shadow-inner"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Checklist Items Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points de contrôle</label>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">{items.length} étapes</span>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="group flex items-start gap-3 animate-in slide-in-from-right-2 duration-300">
                    <div className="mt-4 text-[10px] font-black text-slate-300 w-4 text-center">{index + 1}</div>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 relative">
                        <input 
                          type="text"
                          placeholder="Action à vérifier..."
                          className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm"
                          value={item.label}
                          onChange={e => updateItem(item.id!, { label: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => updateItem(item.id!, { isCritical: !item.isCritical })}
                        title="Marquer comme critique"
                        className={`p-3.5 rounded-xl border transition-all ${
                          item.isCritical 
                          ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-sm' 
                          : 'bg-white border-slate-100 text-slate-300 hover:text-amber-500 hover:border-amber-100'
                        }`}
                      >
                        <AlertTriangle size={18} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => removeItem(item.id!)}
                        className="p-3.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="button"
                onClick={addItem}
                className="w-full py-5 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Ajouter un point de contrôle
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            form="new-template-form"
            disabled={isSubmitting}
            className="flex-[2] py-4 px-6 bg-[#1a4d44] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {initialData ? 'Mettre à jour le modèle' : 'Sauvegarder le modèle'}
          </button>
        </div>
      </div>
    </>
  );
};

export default NewChecklistTemplateModal;
