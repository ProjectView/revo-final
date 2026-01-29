
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
  getDocs,
  query,
  orderBy,
  where,
  limit,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';
import { Site, Lead, Client, TodoTask, Company, ChecklistTemplate, SiteTask, User, SiteDocument, Prestation, LeadComment, LeadActivity, AppNotification, UserNotification, SiteComment } from '../types';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../constants';

interface DataContextType {
  sites: Site[];
  prestations: Prestation[];
  leads: Lead[];
  clients: Client[];
  todos: TodoTask[];
  users: User[];
  checklists: ChecklistTemplate[];
  userNotifications: UserNotification[];
  company: Company | null;
  loading: boolean;
  permissionError: boolean;
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
  loginWithEmail: (email: string) => Promise<string | null>;
  createCompany: (companyName: string, adminEmail: string, adminName: string) => Promise<string>;
  inviteUser: (userData: { email: string; name: string; role: User['role'] }) => Promise<void>;
  checkInvitation: (token: string) => Promise<{ email: string; companyId: string; role: User['role']; name: string; companyName: string } | null>;
  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  updateLead: (leadId: string, updates: Partial<Lead>, activityDesc?: string) => Promise<void>;
  updateLeadStage: (leadId: string, stage: Lead['stage']) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  addLeadComment: (leadId: string, text: string) => Promise<void>;
  getLeadComments: (leadId: string, callback: (comments: LeadComment[]) => void) => () => void;
  getLeadActivities: (leadId: string, callback: (activities: LeadActivity[]) => void) => () => void;
  addSite: (site: Omit<Site, 'id'>) => Promise<string>;
  updateSite: (siteId: string, updates: Partial<Site>) => Promise<void>;
  deleteSite: (siteId: string) => Promise<void>;
  closeSite: (siteId: string) => Promise<void>;
  addSiteComment: (siteId: string, text: string) => Promise<void>;
  getSiteComments: (siteId: string, callback: (comments: SiteComment[]) => void) => () => void;
  transferLeadDataToSite: (leadId: string, siteId: string, type?: 'site' | 'prestation') => Promise<void>;
  addPrestation: (prestation: Omit<Prestation, 'id'>) => Promise<string>;
  updatePrestation: (prestationId: string, updates: Partial<Prestation>) => Promise<void>;
  deletePrestation: (prestationId: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (clientId: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  addTodo: (label: string) => Promise<void>;
  toggleTodo: (todoId: string, currentStatus: boolean) => Promise<void>;
  deleteTodo: (todoId: string) => Promise<void>;
  addChecklistTemplate: (template: Omit<ChecklistTemplate, 'id'>) => Promise<void>;
  updateChecklistTemplate: (id: string, updates: Partial<ChecklistTemplate>) => Promise<void>;
  deleteChecklistTemplate: (id: string) => Promise<void>;
  assignChecklistToSite: (siteId: string, checklist: ChecklistTemplate) => Promise<void>;
  updateCompany: (updates: Partial<Company>) => Promise<void>;
  saveUser: (userData: Omit<User, 'id' | 'companyId'>, explicitCompanyId?: string) => Promise<void>;
  deleteUser: (userEmail: string) => Promise<void>;
  uploadCompanyLogo: (file: File) => Promise<string>;
  uploadUserAvatar: (file: File) => Promise<string>;
  uploadAvatarDuringSignup: (email: string, file: File) => Promise<string>;
  uploadSiteDocument: (siteId: string, file: File, userName: string) => Promise<void>;
  getSiteDocuments: (siteId: string, callback: (docs: SiteDocument[]) => void) => () => void;
  deleteSiteDocument: (siteId: string, docId: string, fileName: string) => Promise<void>;
  checkCapacity: (startStr: string, endStr: string, excludeSiteId?: string) => { exceeds: boolean; maxCount: number };
  addNotification: (message: string, type?: AppNotification['type']) => void;
  markNotificationRead: (notifId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyId, setCompanyIdState] = useState<string | null>(localStorage.getItem('revo_company_id'));
  const [sites, setSites] = useState<Site[]>([]);
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [todos, setTodos] = useState<TodoTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const responsesReceived = useRef(0);
  const TOTAL_STREAMS = 9; 

  const setCompanyId = (id: string | null) => {
    // Ignore redundant calls with the same ID to prevent re-initialization loops
    if (companyId === id) return;

    if (id) localStorage.setItem('revo_company_id', id);
    else localStorage.removeItem('revo_company_id');
    setCompanyIdState(id);
    responsesReceived.current = 0;
    setPermissionError(false);
    if (id) setLoading(true);
  };

  const markStreamReady = () => {
    responsesReceived.current += 1;
    if (responsesReceived.current >= TOTAL_STREAMS) {
      setLoading(false);
    }
  };

  const addNotification = (message: string, type: AppNotification['type'] = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const loginWithEmail = async (email: string): Promise<string | null> => {
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data().companyId;
      }
    } catch (e) {
      console.error("Erreur loginWithEmail:", e);
    }
    return null;
  };

  const createCompany = async (companyName: string, adminEmail: string, adminName: string) => {
    const newCompanyRef = doc(collection(db, 'companies'));
    const companyId = newCompanyRef.id;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    await setDoc(newCompanyRef, {
      id: companyId,
      name: companyName,
      createdAt: new Date().toISOString(),
      pipelineStages: ['Nouveau', 'Qualifié', 'Devis envoyé', 'Négociation', 'Gagné'],
      maxSimultaneousSites: 2,
      subscription: {
        plan: 'artisan_solo',
        status: 'active',
        billingPeriod: 'monthly',
        currentPeriodEnd: futureDate.toISOString(),
        maxClients: 3,
        maxSites: 5,
        maxUsers: 1,
        paymentMethod: 'manual',
      },
      limits: {
        clientsReadOnly: [],
        sitesReadOnly: [],
      }
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

  const inviteUser = async (userData: { email: string; name: string; role: User['role'] }) => {
    if (!companyId || !company) return;

    if (company.subscription) {
      const planConfig = SUBSCRIPTION_PLANS[company.subscription.plan];
      if (users.length >= planConfig.limits.maxUsers) {
        addNotification(
          `Limite atteinte: ${users.length}/${planConfig.limits.maxUsers} utilisateurs. Upgradez votre plan pour ajouter plus.`,
          'warning'
        );
        throw new Error('User limit reached');
      }
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const inviteRef = doc(db, 'invitations', token);
    const inviteLink = `${window.location.origin}?invite=${token}`;

    await setDoc(inviteRef, {
      ...userData,
      companyId,
      companyName: company.name,
      token,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    try {
      await addDoc(collection(db, 'mail'), {
        to: userData.email,
        message: {
          subject: `🚀 Invitation : Rejoignez l'équipe ${company.name} sur REVO`,
          html: `
            <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px;">
              <div style="background-color: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);">
                <div style="background-color: #064e3b; padding: 40px; text-align: center;">
                  <div style="display: inline-block; background-color: #ffffff; width: 64px; height: 64px; border-radius: 16px; line-height: 64px; font-size: 32px; font-weight: 900; color: #064e3b; margin-bottom: 16px;">R</div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;">REVO BTP</h1>
                </div>
                <div style="padding: 40px; text-align: center;">
                  <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Bonjour ${userData.name.split(' ')[0]},</h2>
                  <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                    <strong>${company.name}</strong> vous invite à rejoindre leur espace de gestion collaborative sur REVO en tant que <strong>${userData.role}</strong>.
                  </p>
                  <div style="margin-bottom: 32px;">
                    <a href="${inviteLink}" style="display: inline-block; background-color: #064e3b; color: #ffffff; padding: 18px 36px; border-radius: 16px; font-size: 14px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 10px 15px -3px rgba(6, 78, 59, 0.2);">
                      Accepter l'invitation
                    </a>
                  </div>
                  <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                    Ce lien expire dans 7 jours.<br>Si le bouton ne fonctionne pas, copiez ce lien :<br>
                    <span style="color: #064e3b; font-weight: 600; word-break: break-all;">${inviteLink}</span>
                  </p>
                </div>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 11px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Propulsé par REVO - La plateforme BTP nouvelle génération</p>
                </div>
              </div>
            </div>
          `
        }
      });
      addNotification(`Invitation créée et e-mail envoyé à ${userData.email}`, 'success');
    } catch (emailErr) {
      console.warn("Erreur Trigger Email (Config SMTP probable) :", emailErr);
      addNotification(`Utilisateur invité, mais l'envoi de l'e-mail a échoué (Config SMTP).`, 'warning');
    }
  };

  const checkInvitation = async (token: string) => {
    const inviteRef = doc(db, 'invitations', token);
    const snap = await getDoc(inviteRef);
    if (snap.exists() && snap.data().status === 'pending') {
      const data = snap.data();
      return { 
        email: data.email, 
        companyId: data.companyId, 
        role: data.role, 
        name: data.name,
        companyName: data.companyName || 'votre société'
      };
    }
    return null;
  };

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const currentUser = auth.currentUser;
    const currentEmail = currentUser?.email?.toLowerCase();

    // Safety timeout - force loading to false after 10 seconds max
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000);

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
      markStreamReady();
    });

    const unsubPrestations = onSnapshot(collection(db, 'companies', companyId, 'prestations'), (snapshot) => {
      setPrestations(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Prestation)));
      markStreamReady();
    }, (error) => {
      markStreamReady();
    });

    const unsubLeads = onSnapshot(collection(db, 'companies', companyId, 'leads'), (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Lead)));
      markStreamReady();
    }, (error) => {
      markStreamReady();
    });

    const unsubClients = onSnapshot(collection(db, 'companies', companyId, 'clients'), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client)));
      markStreamReady();
    }, (error) => {
      markStreamReady();
    });

    const unsubTodos = onSnapshot(query(collection(db, 'companies', companyId, 'todos'), orderBy('completed')), (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TodoTask)));
      markStreamReady();
    }, (error) => {
      markStreamReady();
    });

    const unsubChecklists = onSnapshot(collection(db, 'companies', companyId, 'checklists'), (snapshot) => {
      setChecklists(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ChecklistTemplate)));
      markStreamReady();
    }, (error) => {
      markStreamReady();
    });

    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('companyId', '==', companyId)), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User)));
      markStreamReady();
    }, (error) => {
      markStreamReady();
    });

    const unsubNotifs = currentEmail ? onSnapshot(
      query(
        collection(db, 'companies', companyId, 'notifications'),
        where('recipientId', '==', currentEmail),
        orderBy('createdAt', 'desc'),
        limit(50)
      ),
      (snapshot) => {
        setUserNotifications(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserNotification)));
        markStreamReady();
      },
      (error) => {
        markStreamReady();
      }
    ) : (() => { markStreamReady(); return () => {}; })();

    return () => {
      clearTimeout(timeoutId);
      unsubCompany(); unsubSites(); unsubPrestations(); unsubLeads(); unsubClients(); unsubTodos(); unsubChecklists(); unsubUsers(); unsubNotifs();
    };
  }, [companyId]);

  const getCurrentUserName = () => {
    const email = localStorage.getItem('revo_auth');
    if (!email) return 'Inconnu';
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? user.name : email;
  };

  const triggerNotifications = async (targetUserIds: string[] | undefined, title: string, message: string, type: UserNotification['type'], relatedId: string) => {
    if (!companyId || !targetUserIds || targetUserIds.length === 0) return;
    const currentEmail = localStorage.getItem('revo_auth')?.toLowerCase();
    const authorName = getCurrentUserName();

    const batch = writeBatch(db);
    targetUserIds.forEach(userId => {
      // Convert user ID to email by finding the user in the users list
      const user = users.find(u => u.id === userId);
      if (!user) return; // User not found, skip

      const userEmail = user.email.toLowerCase();
      if (userEmail === currentEmail) return; // Don't notify self

      const newNotifRef = doc(collection(db, 'companies', companyId, 'notifications'));
      batch.set(newNotifRef, {
        recipientId: userEmail,
        title,
        message,
        type,
        relatedId,
        authorName,
        createdAt: new Date().toISOString(),
        read: false
      });
    });
    await batch.commit();
  };

  const markNotificationRead = async (notifId: string) => {
    if (!companyId) return;
    await updateDoc(doc(db, 'companies', companyId, 'notifications', notifId), { read: true });
  };

  const markAllNotificationsRead = async () => {
    if (!companyId) return;
    const batch = writeBatch(db);
    userNotifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'companies', companyId, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  const checkCapacity = (startStr: string, endStr: string, excludeSiteId?: string) => {
    if (!startStr || !endStr || !company) return { exceeds: false, maxCount: 0 };
    
    const limit = company.maxSimultaneousSites || 2;
    const start = new Date(startStr);
    const end = new Date(endStr);
    let maxFound = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dStr = d.toISOString().split('T')[0];
      const count = sites.filter(s => {
        if (s.id === excludeSiteId) return false;
        if (s.status === 'TERMINÉ') return false;
        return dStr >= s.startDate && dStr <= s.endDate;
      }).length;
      
      if (count > maxFound) maxFound = count;
    }

    return { 
      exceeds: maxFound >= limit, 
      maxCount: maxFound 
    };
  };

  const addLead = async (lead: Omit<Lead, 'id'>) => {
    if (!companyId) return;
    const docRef = await addDoc(collection(db, 'companies', companyId, 'leads'), lead);
    await addDoc(collection(db, 'companies', companyId, 'leads', docRef.id, 'activities'), {
      type: 'creation',
      description: 'Prospect créé dans la pipeline',
      user: getCurrentUserName(),
      timestamp: new Date().toISOString()
    });
  };

  const updateLead = async (leadId: string, updates: Partial<Lead>, activityDesc?: string) => {
    if (!companyId) return;
    await updateDoc(doc(db, 'companies', companyId, 'leads', leadId), updates);
    if (activityDesc) {
      await addDoc(collection(db, 'companies', companyId, 'leads', leadId, 'activities'), {
        type: 'field_update',
        description: activityDesc,
        user: getCurrentUserName(),
        timestamp: new Date().toISOString()
      });
    }
  };

  const updateLeadStage = async (leadId: string, stage: Lead['stage']) => {
    if (!companyId) return;
    await updateDoc(doc(db, 'companies', companyId, 'leads', leadId), { stage });
    await addDoc(collection(db, 'companies', companyId, 'leads', leadId, 'activities'), {
      type: 'stage_change',
      description: `Étape changée vers : ${stage}`,
      user: getCurrentUserName(),
      timestamp: new Date().toISOString()
    });
  };

  const deleteLead = async (leadId: string) => {
    if (!companyId) return;
    await deleteDoc(doc(db, 'companies', companyId, 'leads', leadId));
  };

  const addLeadComment = async (leadId: string, text: string) => {
    if (!companyId) return;
    await addDoc(collection(db, 'companies', companyId, 'leads', leadId, 'comments'), {
      text,
      user: getCurrentUserName(),
      timestamp: new Date().toISOString()
    });
  };

  const getLeadComments = (leadId: string, callback: (comments: LeadComment[]) => void) => {
    if (!companyId) return () => {};
    const q = query(collection(db, 'companies', companyId, 'leads', leadId, 'comments'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LeadComment)));
    });
  };

  const getLeadActivities = (leadId: string, callback: (activities: LeadActivity[]) => void) => {
    if (!companyId) return () => {};
    const q = query(collection(db, 'companies', companyId, 'leads', leadId, 'activities'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LeadActivity)));
    });
  };

  const addSite = async (site: Omit<Site, 'id'>) => {
    if (!companyId || !company?.subscription) return '';

    const planConfig = SUBSCRIPTION_PLANS[company.subscription.plan];
    const sitesReadOnly = company.limits?.sitesReadOnly || [];
    const activeSitesCount = sites.filter(s => !sitesReadOnly.includes(s.id)).length;

    if (activeSitesCount >= planConfig.limits.maxSites) {
      addNotification(
        `Limite atteinte: ${activeSitesCount}/${planConfig.limits.maxSites} chantiers. Upgradez votre plan pour ajouter plus.`,
        'warning'
      );
      throw new Error('Site limit reached');
    }

    const docRef = await addDoc(collection(db, 'companies', companyId, 'sites'), { ...site, tasks: [], assignedUserIds: [] });
    return docRef.id;
  };

  const updateSite = async (siteId: string, updates: Partial<Site>) => {
    if (!companyId) return;
    const siteRef = doc(db, 'companies', companyId, 'sites', siteId);
    const oldSnap = await getDoc(siteRef);
    if (!oldSnap.exists()) return;
    const oldData = oldSnap.data() as Site;

    await updateDoc(siteRef, updates);

    // Handle assignment changes
    const newAssignedUserIds = updates.assignedUserIds ?? oldData.assignedUserIds ?? [];
    const oldAssignedUserIds = oldData.assignedUserIds ?? [];

    const newlyAssignedIds = newAssignedUserIds.filter(id => !oldAssignedUserIds.includes(id));
    const stillAssignedIds = oldAssignedUserIds.filter(id => newAssignedUserIds.includes(id));

    // Send notification to newly assigned users
    if (newlyAssignedIds.length > 0) {
      await triggerNotifications(
        newlyAssignedIds,
        `Chantier : ${oldData.name}`,
        `Vous avez été assigné(e) à ce chantier par ${getCurrentUserName()}`,
        'assignment',
        siteId
      );
    }

    // Send update notifications to users who remain assigned (only if non-assignment changes)
    if (stillAssignedIds.length > 0 && updates.assignedUserIds === undefined) {
      let msg = `Informations générales mises à jour`;

      if (updates.status && updates.status !== oldData.status) {
        msg = `Statut passé à ${updates.status}`;
      } else if (updates.address && updates.address !== oldData.address) {
        msg = `L'adresse du chantier a été modifiée`;
      } else if ((updates.startDate && updates.startDate !== oldData.startDate) || (updates.endDate && updates.endDate !== oldData.endDate)) {
        msg = `Le planning a été mis à jour`;
      } else if (updates.budget !== undefined && updates.budget !== oldData.budget) {
        msg = `Le budget a été révisé`;
      }

      await triggerNotifications(
        stillAssignedIds,
        `Chantier : ${oldData.name}`,
        msg,
        'site_update',
        siteId
      );
    }
  };

  const deleteSite = async (siteId: string) => {
    if (!companyId) return;
    await deleteDoc(doc(db, 'companies', companyId, 'sites', siteId));
  };

  const closeSite = async (siteId: string) => {
    if (!companyId) return;
    const siteRef = doc(db, 'companies', companyId, 'sites', siteId);
    const siteSnap = await getDoc(siteRef);
    if (!siteSnap.exists()) return;
    const site = siteSnap.data() as Site;

    await updateDoc(siteRef, {
      closedAt: new Date().toISOString()
    });

    // Notify assigned users that the site has been closed
    if (site.assignedUserIds && site.assignedUserIds.length > 0) {
      await triggerNotifications(
        site.assignedUserIds,
        `Chantier : ${site.name}`,
        `Le chantier a été clôturé`,
        'site_update',
        siteId
      );
    }
  };

  const addSiteComment = async (siteId: string, text: string) => {
    if (!companyId) return;
    await addDoc(collection(db, 'companies', companyId, 'sites', siteId, 'comments'), {
      text,
      user: getCurrentUserName(),
      timestamp: new Date().toISOString()
    });
  };

  const getSiteComments = (siteId: string, callback: (comments: SiteComment[]) => void) => {
    if (!companyId) return () => {};
    const q = query(collection(db, 'companies', companyId, 'sites', siteId, 'comments'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SiteComment)));
    });
  };

  const transferLeadDataToSite = async (leadId: string, siteId: string, type: 'site' | 'prestation' = 'site') => {
    if (!companyId) return;

    try {
      // Récupérer les commentaires du lead
      const commentsSnap = await getDocs(
        query(collection(db, 'companies', companyId, 'leads', leadId, 'comments'), orderBy('timestamp', 'asc'))
      );

      // Récupérer les activités du lead
      const activitiesSnap = await getDocs(
        query(collection(db, 'companies', companyId, 'leads', leadId, 'activities'), orderBy('timestamp', 'asc'))
      );

      const collectionName = type === 'site' ? 'sites' : 'prestations';
      const commentsCollection = collection(db, 'companies', companyId, collectionName, siteId, 'comments');

      // Transférer les activités comme commentaires (historique)
      for (const activityDoc of activitiesSnap.docs) {
        const activity = activityDoc.data() as LeadActivity;
        await addDoc(commentsCollection, {
          text: `[Historique Pipeline] ${activity.description}`,
          user: activity.user,
          timestamp: activity.timestamp
        });
      }

      // Transférer les commentaires
      for (const commentDoc of commentsSnap.docs) {
        const comment = commentDoc.data() as LeadComment;
        await addDoc(commentsCollection, {
          text: `[Note Pipeline] ${comment.text}`,
          user: comment.user,
          timestamp: comment.timestamp
        });
      }
    } catch (error) {
      console.error('Erreur lors du transfert des données du lead:', error);
    }
  };

  const addPrestation = async (prestation: Omit<Prestation, 'id'>) => {
    if (!companyId) return '';
    const docRef = await addDoc(collection(db, 'companies', companyId, 'prestations'), { ...prestation, tasks: [], assignedUserIds: [] });
    return docRef.id;
  };

  const updatePrestation = async (prestationId: string, updates: Partial<Prestation>) => {
    if (!companyId) return;
    const prestRef = doc(db, 'companies', companyId, 'prestations', prestationId);
    const oldSnap = await getDoc(prestRef);
    if (!oldSnap.exists()) return;
    const oldData = oldSnap.data() as Prestation;

    await updateDoc(prestRef, updates);

    // Handle assignment changes
    const newAssignedUserIds = updates.assignedUserIds ?? oldData.assignedUserIds ?? [];
    const oldAssignedUserIds = oldData.assignedUserIds ?? [];

    const newlyAssignedIds = newAssignedUserIds.filter(id => !oldAssignedUserIds.includes(id));
    const stillAssignedIds = oldAssignedUserIds.filter(id => newAssignedUserIds.includes(id));

    // Send notification to newly assigned users
    if (newlyAssignedIds.length > 0) {
      await triggerNotifications(
        newlyAssignedIds,
        `Prestation : ${oldData.name}`,
        `Vous avez été assigné(e) à cette prestation par ${getCurrentUserName()}`,
        'assignment',
        prestationId
      );
    }

    // Send update notifications to users who remain assigned (only if non-assignment changes)
    if (stillAssignedIds.length > 0 && updates.assignedUserIds === undefined) {
      let msg = `Informations mises à jour`;

      if (updates.status && updates.status !== oldData.status) {
        msg = `Statut passé à ${updates.status}`;
      } else if (updates.address && updates.address !== oldData.address) {
        msg = `L'adresse d'intervention a été modifiée`;
      } else if ((updates.startDate && updates.startDate !== oldData.startDate) || (updates.endDate && updates.endDate !== oldData.endDate)) {
        msg = `Le planning d'intervention a été modifié`;
      }

      await triggerNotifications(
        stillAssignedIds,
        `Prestation : ${oldData.name}`,
        msg,
        'prestation_update',
        prestationId
      );
    }
  };

  const deletePrestation = async (prestationId: string) => {
    if (!companyId) return;
    await deleteDoc(doc(db, 'companies', companyId, 'prestations', prestationId));
  };

  const addClient = async (client: Omit<Client, 'id'>) => {
    if (!companyId || !company?.subscription) return;

    const planConfig = SUBSCRIPTION_PLANS[company.subscription.plan];
    const clientsReadOnly = company.limits?.clientsReadOnly || [];
    const activeClientsCount = clients.filter(c => !clientsReadOnly.includes(c.id)).length;

    if (activeClientsCount >= planConfig.limits.maxClients) {
      addNotification(
        `Limite atteinte: ${activeClientsCount}/${planConfig.limits.maxClients} clients. Upgradez votre plan pour ajouter plus.`,
        'warning'
      );
      throw new Error('Client limit reached');
    }

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

  const deleteTodo = async (todoId: string) => {
    if (!companyId) return;
    await deleteDoc(doc(db, 'companies', companyId, 'todos', todoId));
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
      isCritical: item.isCritical,
      category: checklist.category
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

  const saveUser = async (userData: Omit<User, 'id' | 'companyId'>, explicitCompanyId?: string) => {
    const targetCompanyId = explicitCompanyId || companyId;
    if (!targetCompanyId) return;
    const emailKey = userData.email.toLowerCase();

    // Construire l'objet sans les champs undefined (Firestore rejette undefined)
    const userDoc: any = {
      ...userData,
      id: emailKey,
      email: emailKey,
      companyId: targetCompanyId
    };

    // Supprimer les champs undefined
    Object.keys(userDoc).forEach(key => userDoc[key] === undefined && delete userDoc[key]);

    await setDoc(doc(db, 'users', emailKey), userDoc);
  };

  const deleteUser = async (userEmail: string) => {
    const emailKey = userEmail.toLowerCase();
    await deleteDoc(doc(db, 'users', emailKey));
  };

  const uploadCompanyLogo = async (file: File): Promise<string> => {
    if (!companyId) throw new Error("No company context");
    const storageRef = ref(storage, `companies/${companyId}/logo`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateCompany({ logo: url });
    return url;
  };

  const uploadUserAvatar = async (file: File): Promise<string> => {
    const email = localStorage.getItem('revo_auth');
    if (!email) throw new Error("Not authenticated");
    return uploadAvatarDuringSignup(email, file);
  };

  const uploadAvatarDuringSignup = async (email: string, file: File): Promise<string> => {
    const emailKey = email.toLowerCase();
    const storageRef = ref(storage, `users/${emailKey}/avatar`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const userRef = doc(db, 'users', emailKey);
    // On essaye de mettre à jour le doc s'il existe déjà
    try {
      await updateDoc(userRef, { avatar: url });
    } catch (e) {
      // S'il n'existe pas, il sera créé par saveUser après
    }
    return url;
  };

  const uploadSiteDocument = async (siteId: string, file: File, userName: string) => {
    if (!companyId) throw new Error("No company context");
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `companies/${companyId}/sites/${siteId}/${fileName}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
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
    const storageRef = ref(storage, `companies/${companyId}/sites/${siteId}/${fileName}`);
    await deleteObject(storageRef);
    await deleteDoc(doc(db, 'companies', companyId, 'sites', siteId, 'documents', docId));
  };

  return (
    <DataContext.Provider value={{ 
      sites, prestations, leads, clients, todos, users, checklists, userNotifications, company, loading, permissionError, companyId,
      setCompanyId, loginWithEmail, createCompany, inviteUser, checkInvitation,
      addLead, updateLead, updateLeadStage, deleteLead, addLeadComment, getLeadComments, getLeadActivities,
      addSite, updateSite, deleteSite, closeSite, addSiteComment, getSiteComments, transferLeadDataToSite,
      addPrestation, updatePrestation, deletePrestation,
      addClient, updateClient, deleteClient,
      addTodo, toggleTodo, deleteTodo,
      addChecklistTemplate, updateChecklistTemplate, deleteChecklistTemplate,
      assignChecklistToSite,
      updateCompany, saveUser, deleteUser,
      uploadCompanyLogo, uploadUserAvatar, uploadAvatarDuringSignup, uploadSiteDocument, getSiteDocuments, deleteSiteDocument,
      checkCapacity, addNotification, markNotificationRead, markAllNotificationsRead
    }}>
      {children}
      
      <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 w-full max-w-xs pointer-events-none">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-4 animate-in slide-in-from-right duration-300 ${
              notification.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              notification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-900' :
              notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {notification.type === 'warning' && <AlertTriangle size={18} className="text-amber-600" />}
              {notification.type === 'error' && <XCircle size={18} className="text-rose-600" />}
              {notification.type === 'success' && <CheckCircle size={18} className="text-emerald-600" />}
              {notification.type === 'info' && <Info size={18} className="text-blue-600" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-tight mb-0.5">
                {notification.type === 'warning' ? 'Attention' : notification.type === 'success' ? 'Succès' : 'Information'}
              </p>
              <p className="text-xs font-bold leading-relaxed">{notification.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X size={14} className="opacity-40" />
            </button>
          </div>
        ))}
      </div>
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
