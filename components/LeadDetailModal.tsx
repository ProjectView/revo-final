
import React, { useState, useEffect } from 'react';
import { X, User, Building2, Mail, Phone, MapPin, DollarSign, MessageSquare, History, Edit3, Save, Trash2, Loader2, Send, Flag, ChevronDown } from 'lucide-react';
import { Lead, LeadComment, LeadActivity } from '../types';
import { useData } from '../context/DataContext';
import LeadLocationMap from './LeadLocationMap';
import ConfirmationModal from './ConfirmationModal';

interface LeadDetailModalProps {
  leadId: string | null;
  onClose: () => void;
}

type TabType = 'details' | 'comments' | 'history';

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ leadId, onClose }) => {
  const { leads, updateLead, deleteLead, addLeadComment, getLeadComments, getLeadActivities } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<LeadComment[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const lead = leads.find(l => l.id === leadId);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (lead) {
      setEditedLead({ ...lead });
      setIsEditing(false);
      setActiveTab('details');

      const unsubComments = getLeadComments(lead.id, setComments);
      const unsubActivities = getLeadActivities(lead.id, setActivities);

      return () => {
        unsubComments();
        unsubActivities();
      };
    }
  }, [leadId, lead]);

  if (!leadId || !lead) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Comparer pour générer une description d'activité
      let activityDesc = "Informations modifiées";
      if (editedLead.project !== lead.project) activityDesc = `Projet renommé : ${editedLead.project}`;
      else if (editedLead.budget !== lead.budget) activityDesc = `Budget mis à jour : ${editedLead.budget} €`;
      
      await updateLead(lead.id, editedLead, activityDesc);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addLeadComment(lead.id, commentText);
    setCommentText('');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLead(lead.id);
      setIsDeleteModalOpen(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 2 === 0) {
        formatted += ' ';
      }
      formatted += digits[i];
    }
    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setEditedLead({ ...editedLead, phone: formatted });
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[160] flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <User size={20} />
              </div>
              <div>
                {isEditing ? (
                  <input 
                    className="text-xl font-black text-slate-900 border-b-2 border-emerald-500 focus:outline-none bg-emerald-50/30 px-2 rounded-t-lg w-full"
                    value={editedLead.leadName}
                    onChange={e => setEditedLead({...editedLead, leadName: e.target.value})}
                  />
                ) : (
                  <h2 className="text-xl font-black text-slate-900">{lead.leadName}</h2>
                )}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Prospect • {lead.stage}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
          </div>

          <div className="flex gap-1 bg-slate-100/50 p-1 rounded-2xl">
            {[
              { id: 'details', label: 'Infos', icon: <Edit3 size={14} /> },
              { id: 'comments', label: 'Notes', icon: <MessageSquare size={14} /> },
              { id: 'history', label: 'Activité', icon: <History size={14} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {isSubmitting && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Location Map */}
              <LeadLocationMap
                coordinates={lead.coordinates}
                address={lead.address}
                leadName={lead.leadName}
                budget={lead.budget}
              />

              {/* Budget Card */}
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl shadow-sm">
                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-2">Budget prévisionnel</p>
                {isEditing ? (
                  <div className="relative">
                    <DollarSign size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-600" />
                    <input
                      type="number"
                      className="w-full bg-white/40 border border-emerald-200 text-2xl font-black text-emerald-900 pl-7 pr-3 py-2 outline-none rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-400"
                      value={editedLead.budget}
                      onChange={e => setEditedLead({...editedLead, budget: Number(e.target.value)})}
                    />
                  </div>
                ) : (
                  <p className="text-3xl font-black text-emerald-900">{lead.budget.toLocaleString()} <span className="text-lg text-emerald-700">€</span></p>
                )}
              </div>

              {/* Project Section */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Description du projet</p>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                  {isEditing ? (
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white resize-none"
                      rows={3}
                      value={editedLead.project}
                      onChange={e => setEditedLead({...editedLead, project: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{lead.project}</p>
                  )}
                </div>
              </div>

              {/* Contact Info Section */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Coordonnées du contact</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Company */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Société</p>
                    {isEditing ? (
                      <input
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-400"
                        value={editedLead.company}
                        onChange={e => setEditedLead({...editedLead, company: e.target.value})}
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-700">{lead.company || '—'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-400"
                        value={editedLead.email}
                        onChange={e => setEditedLead({...editedLead, email: e.target.value})}
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-700 truncate">{lead.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Téléphone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        maxLength={14}
                        placeholder="06 00 00 00 00"
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-400 tracking-wider"
                        value={editedLead.phone}
                        onChange={e => handlePhoneChange(e.target.value)}
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-700 tracking-wider">{lead.phone}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl col-span-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Adresse</p>
                    {isEditing ? (
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                        rows={2}
                        value={editedLead.address}
                        onChange={e => setEditedLead({...editedLead, address: e.target.value})}
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">{lead.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Priority & Comment Section */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Autres infos</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Priority */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Priorité</p>
                    {isEditing ? (
                      <div className="relative">
                        <select
                          className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-400 appearance-none pr-8 ${
                            editedLead.priority === 'Haute' ? 'text-red-600' :
                            editedLead.priority === 'Moyenne' ? 'text-amber-600' :
                            'text-blue-600'
                          }`}
                          value={editedLead.priority}
                          onChange={e => setEditedLead({...editedLead, priority: e.target.value as 'Haute' | 'Moyenne' | 'Basse'})}
                        >
                          <option value="Haute" className="text-red-600">Haute</option>
                          <option value="Moyenne" className="text-amber-600">Moyenne</option>
                          <option value="Basse" className="text-blue-600">Basse</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Flag size={12} className={`${
                          lead.priority === 'Haute' ? 'text-red-500' :
                          lead.priority === 'Moyenne' ? 'text-amber-500' :
                          'text-blue-500'
                        }`} />
                        <span className={`text-xs font-black ${
                          lead.priority === 'Haute' ? 'text-red-600' :
                          lead.priority === 'Moyenne' ? 'text-amber-600' :
                          'text-blue-600'
                        }`}>{lead.priority}</span>
                      </div>
                    )}
                  </div>

                  {/* Comment */}
                  {lead.comment && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl col-span-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Commentaire</p>
                      <p className="text-xs text-slate-700">{lead.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6 animate-in fade-in duration-300 flex flex-col h-full">
              <form onSubmit={handleAddComment} className="relative">
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-12 text-sm text-slate-800 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none min-h-[100px] resize-none"
                  placeholder="Ajouter une note interne..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button type="submit" className="absolute right-3 bottom-3 p-2 bg-emerald-900 text-white rounded-xl shadow-lg active:scale-95 transition-all">
                  <Send size={16} />
                </button>
              </form>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                    <MessageSquare size={32} className="opacity-20 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Aucune note pour le moment</p>
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-900">{c.user}</span>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(c.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {activities.map(a => (
                  <div key={a.id} className="relative">
                    <div className="absolute -left-[22px] top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 z-10" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{a.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-900 uppercase">{a.user}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(a.timestamp).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-white transition-all shadow-sm"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Enregistrer
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a4d44] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg active:scale-[0.98]"
              >
                <Edit3 size={18} /> Modifier le prospect
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-3 border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Supprimer le prospect"
        message="Voulez-vous vraiment supprimer ce prospect ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default LeadDetailModal;
