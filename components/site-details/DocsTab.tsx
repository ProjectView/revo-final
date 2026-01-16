
import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Download, MoreVertical, FilePlus, Loader2, Trash2 } from 'lucide-react';
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

      {/* Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Documents du chantier ({documents.length})
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {documents.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-300 border border-dashed border-slate-100 rounded-3xl">
              <ImageIcon size={32} className="opacity-20 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Aucun document pour le moment</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : (doc.type === 'img' ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-500')}`}>
                  {doc.type === 'pdf' ? <FileText size={24} /> : <ImageIcon size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {doc.size} • par {doc.uploadedBy} • {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    <Download size={18} />
                  </a>
                  <button 
                    onClick={() => handleDelete(doc)}
                    disabled={isDeleting === doc.id}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
                  >
                    {isDeleting === doc.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DocsTab;
