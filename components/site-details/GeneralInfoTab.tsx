
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, Clock, MessageSquare, Users, Phone, Mail, Loader2, ChevronDown, AlertTriangle, Send, Navigation, Edit3, Trash2, Check, X } from 'lucide-react';
import { Site, Client, SiteComment, DatePeriod } from '../../types';
import { useData } from '../../context/DataContext';
import { useAddressSearch } from '../../hooks/useAddressSearch';
import { COLOR_PALETTE } from '../../constants';
import DatePeriodsManager from '../DatePeriodsManager';

interface GeneralInfoTabProps {
  site: Site;
  client?: Client;
  isEditing?: boolean;
  isReadOnly?: boolean;
  onUpdate?: (updates: Partial<Site>) => void;
  onOpenAssignModal?: () => void;
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ site, client, isEditing, isReadOnly, onUpdate, onOpenAssignModal }) => {
  const { clients, users, checkCapacity, company, addSiteComment, getSiteComments, updateSiteComment, deleteSiteComment, currentUser: ctxUser } = useData();
  const [comments, setComments] = useState<SiteComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const {
    addressSearch,
    suggestions,
    isLoadingAddress,
    showSuggestions,
    suggestionRef,
    handleAddressChange,
    selectAddress,
  } = useAddressSearch({
    initialValue: site.address,
    onChange: (val) => onUpdate?.({ address: val }),
    onSelect: (s) => onUpdate?.({
      address: s.label,
      coordinates: [s.geometry.coordinates[1], s.geometry.coordinates[0]],
    }),
  });

  // Récupérer le nom de l'utilisateur actuel
  const currentUserName = useMemo(() => {
    if (ctxUser) return ctxUser.name;
    const email = localStorage.getItem('revo_auth');
    if (!email) return 'Inconnu';
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? user.name : email;
  }, [users, ctxUser]);

  useEffect(() => {
    if (site.id) {
      const unsub = getSiteComments(site.id, setComments);
      return () => unsub();
    }
  }, [site.id]);

  const capacityWarning = useMemo(() => {
    if (site.startDate && site.endDate) {
      const result = checkCapacity(site.startDate, site.endDate, site.id);
      return result.exceeds ? result.maxCount : null;
    }
    return null;
  }, [site.startDate, site.endDate, site.id, checkCapacity]);

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;
    await addSiteComment(site.id, newComment.trim());
    setNewComment('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const openDirections = () => {
    const encodedAddress = encodeURIComponent(site.address);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const handleEditComment = (commentId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditingText(text);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingText.trim()) return;
    await updateSiteComment(site.id, commentId, editingText.trim());
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      await deleteSiteComment(site.id, commentId);
    }
  };

  const assignedUsers = users.filter(u => site.assignedUserIds?.includes(u.id));

  if (isEditing) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {capacityWarning !== null && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
            <p className="text-[10px] text-amber-900 font-bold uppercase leading-relaxed tracking-tight">
              Attention : ce changement de planning place {capacityWarning + 1} chantiers en simultané (limite : {company?.maxSimultaneousSites}).
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse du chantier</label>
            <div className="relative group" ref={suggestionRef}>
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all text-slate-600 font-bold" value={addressSearch} onChange={e => handleAddressChange(e.target.value)} />
              {isLoadingAddress && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" />}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => selectAddress(s)} className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-0">
                      <span className="text-xs font-bold text-slate-800">{s.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium uppercase">{s.postcode} {s.city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client</label>
              <div className="relative">
                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-700 outline-none appearance-none" value={site.clientId} onChange={e => onUpdate && onUpdate({ clientId: e.target.value })}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company} - {c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget (€)</label>
              <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-black text-emerald-700 outline-none" value={site.budget} onChange={e => onUpdate && onUpdate({ budget: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold" value={site.startDate} onChange={e => onUpdate && onUpdate({ startDate: e.target.value })} />
            <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold" value={site.endDate} onChange={e => onUpdate && onUpdate({ endDate: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Couleur</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => {
                const isSelected = site.color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdate && onUpdate({ color: c })}
                    aria-label={`Couleur ${c}`}
                    aria-pressed={isSelected}
                    className={`w-8 h-8 rounded-full ${c} transition-all ${
                      isSelected ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-110 opacity-80 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Gestionnaire de périodes multiples */}
        <div className="pt-4 border-t border-slate-100">
          <DatePeriodsManager
            periods={site.datePeriods || []}
            isEditing={true}
            isReadOnly={isReadOnly}
            onUpdate={(periods) => onUpdate && onUpdate({ datePeriods: periods })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Affichage des périodes multiples si disponibles */}
      {site.datePeriods && site.datePeriods.length > 0 ? (
        <DatePeriodsManager
          periods={site.datePeriods}
          isEditing={false}
          isReadOnly={isReadOnly}
          onUpdate={() => {}}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Début du chantier</label>
            <div className="flex items-center gap-3 text-slate-700">
              <Calendar size={16} className="text-emerald-600" />
              <span className="text-sm font-bold">{new Date(site.startDate).toLocaleDateString('fr-FR')}</span>
              <Clock size={16} className="text-slate-400 ml-auto" />
              <span className="text-sm font-medium">{site.startTime || '08:00'}</span>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fin prévue</label>
            <div className="flex items-center gap-3 text-slate-700">
              <Calendar size={16} className="text-emerald-600" />
              <span className="text-sm font-bold">{new Date(site.endDate).toLocaleDateString('fr-FR')}</span>
              <Clock size={16} className="text-slate-400 ml-auto" />
              <span className="text-sm font-medium">{site.endTime || '17:30'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Équipe assignée</h3>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {assignedUsers.map((u) => (
              <div key={u.id} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-1 ring-slate-100 overflow-hidden" title={u.name}>
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                ) : (
                  u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                )}
              </div>
            ))}
            <button
              onClick={onOpenAssignModal}
              disabled={isReadOnly}
              className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${
                isReadOnly
                  ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:border-emerald-300'
              }`}>
              <Users size={16} />
            </button>
          </div>
          <span className={`text-xs font-medium ml-2 ${isReadOnly ? 'text-slate-400' : 'text-slate-500'}`}>
            {assignedUsers.length === 0 ? 'Aucun membre assigné' : `${assignedUsers.length} membre(s) assigné(s)`}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Coordonnées</h3>
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 flex items-start gap-3 border-b border-slate-50">
            <MapPin size={18} className="text-emerald-600 mt-0.5" />
            <div className="flex-1"><p className="text-sm font-bold text-slate-800">{site.address}</p><p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Adresse du chantier</p></div>
            <button
              onClick={openDirections}
              className="ml-auto flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all active:scale-95 whitespace-nowrap"
              title="Calculer l'itinéraire"
            >
              <Navigation size={16} />
              <span className="text-[10px] font-black uppercase tracking-tight">Itinéraire</span>
            </button>
          </div>
          {client && (
            <div className="p-4 bg-slate-50/50 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${client.color} flex items-center justify-center text-white text-[10px] font-black`}>{client.initials}</div>
                <div className="flex-1"><p className="text-xs font-bold text-slate-800">{client.name}</p><p className="text-[10px] text-slate-500">{client.company}</p></div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${client.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:text-emerald-700 transition-all"><Phone size={12} /> Appeler</a>
                <a href={`mailto:${client.email}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:text-emerald-700 transition-all"><Mail size={12} /> Email</a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Commentaires & Notes</h3>

        {isReadOnly ? (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Ce chantier est en lecture seule</p>
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors z-10">
              <MessageSquare size={18} />
            </div>
            <textarea
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none min-h-[80px] resize-none shadow-inner"
              placeholder="Ajouter une note de chantier... (Entrée pour valider)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => handleAddComment()}
              className="absolute right-3 bottom-3 p-2 bg-emerald-900 text-white rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-30"
              disabled={!newComment.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {comments.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-50 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest italic">Aucun commentaire historisé</p>
            </div>
          ) : (
            comments.map(c => {
              const isOwnComment = c.user === currentUserName;
              const isEditing = editingCommentId === c.id;

              return (
                <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[10px] font-black text-emerald-900 uppercase tracking-tighter">{c.user}</span>
                      {isOwnComment && (
                        <span className="text-[8px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">Vous</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400">
                        {new Date(c.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOwnComment && !isReadOnly && (
                        <div className="flex gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(c.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                                title="Enregistrer"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingText('');
                                }}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                                title="Annuler"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditComment(c.id, c.text)}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                title="Modifier"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-lg p-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{c.text}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;
