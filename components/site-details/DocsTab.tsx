
import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Download, MoreVertical, FilePlus, Loader2, Trash2, Eye, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { SiteDocument } from '../../types';

interface DocsTabProps {
  siteId: string;
}

const DocsTab: React.FC<DocsTabProps> = ({ siteId }) => {
  const { uploadSiteDocument, getSiteDocuments, deleteSiteDocument, users } = useData();
  const [documents, setDocuments] = useState<SiteDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<SiteDocument | null>(null);
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
    // Use the auth email from localStorage
    const currentUser = localStorage.getItem('revo_auth') || 'Inconnu';

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadSiteDocument(siteId, files[i], currentUser);
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'envoi du fichier. Vérifiez les permissions de votre bucket Firebase Storage.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (doc: SiteDocument) => {
    if (window.confirm(`Supprimer définitivement ${doc.name} ?`)) {
      setIsDeleting(doc.id);
      try {
        await deleteSiteDocument(siteId, doc.id, (doc as any).fileName || doc.name);
      } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur lors de la suppression du fichier.");
      } finally {
        setIsDeleting(null);
      }
    }
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
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all group cursor-pointer ${
          isUploading 
            ? 'bg-emerald-50 border-emerald-200 cursor-wait' 
            : 'border-slate-200 bg-slate-50/30 hover:bg-emerald-50/30 hover:border-emerald-200'
        }`}
      >
        <div className={`w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center transition-all mb-4 ${
          isUploading ? 'text-emerald-500' : 'text-slate-300 group-hover:text-emerald-500 group-hover:scale-110'
        }`}>
          {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
        </div>
        <p className="font-bold text-slate-700 text-sm">
          {isUploading ? 'Envoi en cours...' : 'Déposez vos documents ici'}
        </p>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">PDF, JPG, PNG (Max 10Mo)</p>
        {!isUploading && (
          <button className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all">
            Parcourir les fichiers
          </button>
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
                    <button
                      onClick={() => handleDelete(doc)}
                      disabled={isDeleting === doc.id}
                      className="p-2.5 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-all shadow-lg disabled:opacity-30"
                      title="Supprimer"
                    >
                      {isDeleting === doc.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
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
    </div>
  );
};

export default DocsTab;
