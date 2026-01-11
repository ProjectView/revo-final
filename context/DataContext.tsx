
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  getDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Site, Lead, Client, TodoTask, Company, ChecklistTemplate, SiteTask, User, SiteDocument } from '../types';

interface DataContextType {
  sites: Site[];
  leads: Lead[];
  clients: Client[];
  todos: TodoTask[];
  users: User[];
  checklists: ChecklistTemplate[];
  company: Company | null;
  loading: boolean;
  permissionError: boolean;
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
  loginWithEmail: (email: string) => Promise<string | null>;
  createCompany: (companyName: string, adminEmail: string, adminName: string) => Promise<string>;
  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  updateLeadStage: (leadId: string, stage: Lead['stage']) => Promise<void>;
  addSite: (site: Omit<Site, 'id'>) => Promise<void>;
  updateSite: (siteId: string, updates: Partial<Site>) => Promise<void>;
  deleteSite: (siteId: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (clientId: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  addTodo: (label: string) => Promise<void>;
  toggleTodo: (todoId: string, currentStatus: boolean) => Promise<void>;
  addChecklistTemplate: (template: Omit<ChecklistTemplate, 'id'>) => Promise<void>;
  updateChecklistTemplate: (id: string, updates: Partial<ChecklistTemplate>) => Promise<void>;
  deleteChecklistTemplate: (id: string) => Promise<void>;
  assignChecklistToSite: (siteId: string, checklist: ChecklistTemplate) => Promise<void>;
  updateCompany: (updates: Partial<Company>) => Promise<void>;
  saveUser: (userData: Omit<User, 'id' | 'companyId'>) => Promise<void>;
  deleteUser: (userEmail: string) => Promise<void>;
  // Storage Actions
  uploadCompanyLogo: (file: File) => Promise<string>;
  uploadSiteDocument: (siteId: string, file: File, userName: string) => Promise<void>;
  getSiteDocuments: (siteId: string, callback: (docs: SiteDocument[]) => void) => () => void;
  deleteSiteDocument: (siteId: string, docId: string, fileName: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyId, setCompanyIdState] = useState<string | null>(localStorage.getItem('revo_company_id'));
  const [sites, setSites] = useState<Site[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [todos, setTodos] = useState<TodoTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  
  const responsesReceived = useRef(0);
  const TOTAL_STREAMS = 7;

  const setCompanyId = (id: string | null) => {
    if (id) localStorage.setItem('revo_company_id', id);
    else localStorage.removeItem('revo_company_id');
    setCompanyIdState(id);
    responsesReceived.current = 0;
    setPermissionError(false);
    setLoading(true);
  };

  const markStreamReady = () => {
    responsesReceived.current += 1;
    if (responsesReceived.current >= TOTAL_STREAMS) {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string): Promise<string | null> => {
    const userRef = doc(db, 'users', email.toLowerCase());
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().companyId;
    }
    return null;
  };

  const createCompany = async (companyName: string, adminEmail: string, adminName: string) => {
    const newCompanyRef = doc(collection(db, 'companies'));
    const companyId = newCompanyRef.id;
    
    await setDoc(newCompanyRef, {
      id: companyId,
      name: companyName,
      createdAt: new Date().toISOString()
    });

    await setDoc(doc(db, 'users', adminEmail.toLowerCase()), {
      id: adminEmail.toLowerCase(),
      email: adminEmail.toLowerCase(),
      name: adminName,
      companyId: companyId,
      role: 'Administrateur'
    });

    return companyId;
  };

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const unsubCompany = onSnapshot(doc(db, 'companies', companyId), (snapshot) => {
      if (snapshot.exists()) setCompany({ ...snapshot.data(), id: snapshot.id } as Company);
      markStreamReady();
    }, (error) => {
      if (error.code === 'permission-denied') setPermissionError(true);
      markStreamReady();
    });

    const unsubSites = onSnapshot(collection(db, 'companies', companyId, 'sites'), (snapshot) => {
      setSites(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Site)));
      markStreamReady();
    }, (error) => {
      if (error.code === 'permission-denied') setPermissionError(true);
      markStreamReady();
    });

    const unsubLeads = onSnapshot(collection(db, 'companies', companyId, 'leads'), (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Lead)));
      markStreamReady();
    }, (error) => {
      if (error.code === 'permission-denied') setPermissionError(true);
      markStreamReady();
    });

    const unsubClients = onSnapshot(collection(db, 'companies', companyId, 'clients'), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client)));
      markStreamReady();
    }, (error) => {
      if (error.code === 'permission-denied') setPermissionError(true);
      markStreamReady();
    });

    const unsubTodos = onSnapshot(query(collection(db, 'companies', companyId, 'todos'), orderBy('completed')), (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TodoTask)));
      markStreamReady();
    }, (error) => {
      if (error.code === 'permission-denied') setPermissionError(true);
      markStreamReady();
    });

    const unsubChecklists = onSnapshot(collection(db, 'companies', companyId, 'checklists'), (snapshot) => {
      setChecklists(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ChecklistTemplate)));
      markStreamReady();
    }, (error) => {
      if (error.code === 'permission-denied') setPermissionError(true);
      markStreamReady();
    });

    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('companyId', '==', companyId)), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User)));
      markStreamReady();
    }, (error) => {
      if (error.code === 'permission-denied') setPermissionError(true);
      markStreamReady();
    });

    return () => {
      unsubCompany(); unsubSites(); unsubLeads(); unsubClients(); unsubTodos(); unsubChecklists(); unsubUsers();
    };
  }, [companyId]);

  const addLead = async (lead: Omit<Lead, 'id'>) => {
    if (!companyId) return;
    await addDoc(collection(db, 'companies', companyId, 'leads'), lead);
  };

  const updateLeadStage = async (leadId: string, stage: Lead['stage']) => {
    if (!companyId) return;
    await updateDoc(doc(db, 'companies', companyId, 'leads', leadId), { stage });
  };

  const addSite = async (site: Omit<Site, 'id'>) => {
    if (!companyId) return;
    await addDoc(collection(db, 'companies', companyId, 'sites'), { ...site, tasks: [], assignedUserIds: [] });
  };

  const updateSite = async (siteId: string, updates: Partial<Site>) => {
    if (!companyId) return;
    await updateDoc(doc(db, 'companies', companyId, 'sites', siteId), updates);
  };

  const deleteSite = async (siteId: string) => {
    if (!companyId) return;
    await deleteDoc(doc(db, 'companies', companyId, 'sites', siteId));
  };

  const addClient = async (client: Omit<Client, 'id'>) => {
    if (!companyId) return;
    await addDoc(collection(db, 'companies', companyId, 'clients'), client);
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    if (!companyId) return;
    await updateDoc(doc(db, 'companies', companyId, 'clients', clientId), updates);
  };

  const deleteClient = async (clientId: string) => {
    if (!companyId) return;
    await deleteDoc(doc(db, 'companies', companyId, 'clients', clientId));
  };

  const addTodo = async (label: string) => {
    if (!companyId) return;
    await addDoc(collection(db, 'companies', companyId, 'todos'), { label, completed: false });
  };

  const toggleTodo = async (todoId: string, currentStatus: boolean) => {
    if (!companyId) return;
    await updateDoc(doc(db, 'companies', companyId, 'todos', todoId), { completed: !currentStatus });
  };

  const addChecklistTemplate = async (template: Omit<ChecklistTemplate, 'id'>) => {
    if (!companyId) return;
    await addDoc(collection(db, 'companies', companyId, 'checklists'), template);
  };

  const updateChecklistTemplate = async (id: string, updates: Partial<ChecklistTemplate>) => {
    if (!companyId) return;
    await updateDoc(doc(db, 'companies', companyId, 'checklists', id), updates);
  };

  const deleteChecklistTemplate = async (id: string) => {
    if (!companyId) return;
    await deleteDoc(doc(db, 'companies', companyId, 'checklists', id));
  };

  const assignChecklistToSite = async (siteId: string, checklist: ChecklistTemplate) => {
    if (!companyId) return;
    const siteRef = doc(db, 'companies', companyId, 'sites', siteId);
    const siteSnap = await getDoc(siteRef);
    if (!siteSnap.exists()) return;

    const currentTasks = (siteSnap.data() as Site).tasks || [];
    const newTasks: SiteTask[] = checklist.items.map(item => ({
      id: `${checklist.id}-${item.id}-${Date.now()}`,
      label: item.label,
      completed: false,
      isCritical: item.isCritical
    }));

    await updateDoc(siteRef, {
      tasks: [...currentTasks, ...newTasks]
    });

    await updateDoc(doc(db, 'companies', companyId, 'checklists', checklist.id), {
      lastUsed: new Date().toISOString()
    });
  };

  const updateCompany = async (updates: Partial<Company>) => {
    if (!companyId) return;
    await updateDoc(doc(db, 'companies', companyId), updates);
  };

  const saveUser = async (userData: Omit<User, 'id' | 'companyId'>) => {
    if (!companyId) return;
    const emailKey = userData.email.toLowerCase();
    await setDoc(doc(db, 'users', emailKey), {
      ...userData,
      id: emailKey,
      email: emailKey,
      companyId: companyId
    });
  };

  const deleteUser = async (userEmail: string) => {
    const emailKey = userEmail.toLowerCase();
    await deleteDoc(doc(db, 'users', emailKey));
  };

  // --- Storage functions ---

  const uploadCompanyLogo = async (file: File): Promise<string> => {
    if (!companyId) throw new Error("No company context");
    const storageRef = ref(storage, `companies/${companyId}/logo`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateCompany({ logo: url });
    return url;
  };

  const uploadSiteDocument = async (siteId: string, file: File, userName: string) => {
    if (!companyId) throw new Error("No company context");
    
    // 1. Upload to Storage
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `companies/${companyId}/sites/${siteId}/${fileName}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // 2. Save metadata to Firestore
    const type = file.type.startsWith('image/') ? 'img' : (file.type === 'application/pdf' ? 'pdf' : 'other');
    const sizeStr = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' Mo' 
      : (file.size / 1024).toFixed(1) + ' Ko';

    await addDoc(collection(db, 'companies', companyId, 'sites', siteId, 'documents'), {
      name: file.name,
      fileName: fileName,
      url: url,
      type: type,
      size: sizeStr,
      createdAt: new Date().toISOString(),
      uploadedBy: userName
    });
  };

  const getSiteDocuments = (siteId: string, callback: (docs: SiteDocument[]) => void) => {
    if (!companyId) return () => {};
    const q = query(collection(db, 'companies', companyId, 'sites', siteId, 'documents'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SiteDocument)));
    });
  };

  const deleteSiteDocument = async (siteId: string, docId: string, fileName: string) => {
    if (!companyId) return;
    // Delete from storage
    const storageRef = ref(storage, `companies/${companyId}/sites/${siteId}/${fileName}`);
    await deleteObject(storageRef);
    // Delete from Firestore
    await deleteDoc(doc(db, 'companies', companyId, 'sites', siteId, 'documents', docId));
  };

  return (
    <DataContext.Provider value={{ 
      sites, leads, clients, todos, users, checklists, company, loading, permissionError, companyId,
      setCompanyId, loginWithEmail, createCompany,
      addLead, updateLeadStage, 
      addSite, updateSite, deleteSite,
      addClient, updateClient, deleteClient,
      addTodo, toggleTodo,
      addChecklistTemplate, updateChecklistTemplate, deleteChecklistTemplate,
      assignChecklistToSite,
      updateCompany, saveUser, deleteUser,
      uploadCompanyLogo, uploadSiteDocument, getSiteDocuments, deleteSiteDocument
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
