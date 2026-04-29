
import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Download, MoreVertical, FilePlus, Loader2, Trash2, Eye, X, Link as LinkIcon, Cloud, Edit3 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Site, SiteDocument } from '../../types';
import ConfirmationModal from '../ConfirmationModal';

interface DocsTabProps {
  siteId: string;
  site?: Site;
  isReadOnly?: boolean;
  onUpdate?: (updates: Partial<Site>) => void;
}

const DocsTab: React.FC<DocsTabProps> = ({ siteId, site, isReadOnly, onUpdate }) => {
  const { uploadSiteDocument, getSiteDocuments, deleteSiteDocument, currentUser: ctxUser } = useData();
  const [documents, setDocuments] = useState<SiteDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<SiteDocument | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<SiteDocument | null>(null);
  const [cloudLink, setCloudLink] = useState(site?.cloudLink || '');
  const [isEditingCloudLink, setIsEditingCloudLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Listen to real-time updates for documents of this site
    const unsub = getSiteDocuments(siteId, (docs) => {
      setDocuments(docs);
    });
    return () => unsub();
  }, [siteId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    // Use context user name, fallback to email from localStorage
    const currentUser = ctxUser?.name || localStorage.getItem('revo_auth') || 'Inconnu';

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadSiteDocument(siteId, files[i], currentUser);
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      const message = error instanceof Error ? error.message : "Erreur lors de l'envoi du fichier.";
      alert(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteClick = (doc: SiteDocument) => {
    setDocToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(docToDelete.id);
    try {
      await deleteSiteDocument(siteId, docToDelete.id, (docToDelete as any).fileName || docToDelete.name);
      setIsDeleteModalOpen(false);
      setDocToDelete(null);
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression du fichier.");
      setIsDeleting(null);
    }
  };

  const handleSaveCloudLink = () => {
    if (onUpdate && cloudLink.trim()) {
      onUpdate({ cloudLink: cloudLink.trim() });
      setIsEditingCloudLink(false);
    }
  };

  const handleDeleteCloudLink = () => {
    if (onUpdate) {
      onUpdate({ cloudLink: '' });
    }
  };

  const getCloudServiceIcon = () => {
    const url = cloudLink.toLowerCase();
    if (url.includes('drive.google')) return '🔵'; // Google Drive
    if (url.includes('onedrive') || url.includes('sharepoint')) return '🟢'; // OneDrive
    if (url.includes('dropbox')) return '🔵'; // Dropbox
    if (url.includes('icloud')) return '⚪'; // iCloud
    return '☁️'; // Generic cloud
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Upload Zone */}
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />
      <div
        onClick={() => !isUploading && !isReadOnly && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all group ${
          isReadOnly
            ? 'border-slate-200 bg-slate-50/30 cursor-not-allowed opacity-50'
            : isUploading
            ? 'bg-emerald-50 border-emerald-200 cursor-wait'
            : 'border-slate-200 bg-slate-50/30 hover:bg-emerald-50/30 hover:border-emerald-200 cursor-pointer'
        }`}
      >
        <div className={`w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center transition-all mb-4 ${
          isUploading ? 'text-emerald-500' : 'text-slate-300 group-hover:text-emerald-500 group-hover:scale-110'
        }`}>
          {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
        </div>
        <p className="font-bold text-slate-700 text-sm">
          {isReadOnly ? 'Ce chantier est en lecture seule' : isUploading ? 'Envoi en cours...' : 'Déposez vos documents ici'}
        </p>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">PDF, JPG, PNG (Max 10Mo)</p>
        {!isUploading && (
          <button className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all">
            Parcourir les fichiers
          </button>
        )}
      </div>

      {/* Cloud Link Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Lien vers le cloud</h3>
        </div>

        {isEditingCloudLink ? (
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL du service cloud</label>
              <input
                type="url"
                placeholder="https://drive.google.com/... ou https://onedrive.live.com/..."
                value={cloudLink}
                onChange={(e) => setCloudLink(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-700"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveCloudLink}
                disabled={!cloudLink.trim()}
                className="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all text-xs font-bold"
              >
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setIsEditingCloudLink(false);
                  setCloudLink(site?.cloudLink || '');
                }}
                className="flex-1 py-2 px-3 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all text-xs font-bold"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : cloudLink ? (
          <a
            href={cloudLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-100 rounded-2xl hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getCloudServiceIcon()}</div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700">Service cloud</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate max-w-xs">{cloudLink}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </a>
        ) : null}

        {!isReadOnly && (
          <div className="flex gap-2 px-2">
            {cloudLink && !isEditingCloudLink && (
              <>
                <button
                  onClick={() => setIsEditingCloudLink(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 rounded-lg transition-all text-xs font-bold"
                >
                  <Edit3 size={14} /> Modifier
                </button>
                <button
                  onClick={handleDeleteCloudLink}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg transition-all text-xs font-bold"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </>
            )}
            {!cloudLink && !isEditingCloudLink && (
              <button
                onClick={() => setIsEditingCloudLink(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all text-xs font-bold"
              >
                <Cloud size={14} /> Ajouter un lien cloud
              </button>
            )}
          </div>
        )}
      </div>

      {/* Documents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Documents du chantier ({documents.length})
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {documents.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-300 border border-dashed border-slate-100 rounded-3xl">
              <ImageIcon size={32} className="opacity-20 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Aucun document pour le moment</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                {/* Thumbnail */}
                <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer relative">
                  {doc.type === 'img' ? (
                    <img
                      src={doc.url}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onClick={() => setSelectedDocForPreview(doc)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center bg-red-50 group-hover:bg-red-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedDocForPreview(doc)}
                    >
                      <FileText size={32} className="text-red-500 mb-2" />
                      <span className="text-[10px] font-black text-red-600 uppercase">PDF</span>
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setSelectedDocForPreview(doc)}
                      className="p-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-lg"
                      title="Prévisualiser"
                    >
                      <Eye size={20} />
                    </button>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all shadow-lg"
                      title="Télécharger"
                    >
                      <Download size={20} />
                    </a>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleDeleteClick(doc)}
                        disabled={isDeleting === doc.id}
                        className="p-2.5 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-all shadow-lg disabled:opacity-30"
                        title="Supprimer"
                      >
                        {isDeleting === doc.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* File Info */}
                <div className="p-3">
                  <p className="text-[11px] font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-1">
                    {doc.size} • {new Date(doc.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {selectedDocForPreview && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] animate-fade-in"
            onClick={() => setSelectedDocForPreview(null)}
          />
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedDocForPreview.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    {selectedDocForPreview.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{selectedDocForPreview.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {selectedDocForPreview.size} • par {selectedDocForPreview.uploadedBy}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDocForPreview(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 p-6">
                {selectedDocForPreview.type === 'img' ? (
                  <img
                    src={selectedDocForPreview.url}
                    alt={selectedDocForPreview.name}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
                  />
                ) : selectedDocForPreview.type === 'pdf' ? (
                  <iframe
                    src={`${selectedDocForPreview.url}#toolbar=0`}
                    className="w-full h-full rounded-2xl border-none"
                    title={selectedDocForPreview.name}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                    <FileText size={48} />
                    <p className="text-sm font-bold">Aperçu non disponible</p>
                    <a
                      href={selectedDocForPreview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-6 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-800 transition-all"
                    >
                      Télécharger le fichier
                    </a>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <a
                  href={selectedDocForPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-emerald-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download size={16} /> Télécharger
                </a>
                <button
                  onClick={() => setSelectedDocForPreview(null)}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Supprimer le fichier"
        message={docToDelete ? `Voulez-vous vraiment supprimer "${docToDelete.name}" ? Cette action est irréversible.` : ''}
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous={true}
        isLoading={isDeleting !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default DocsTab;
