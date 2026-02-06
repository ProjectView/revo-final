
export type Status = 'NOUVEAU' | 'EN RÉVISION' | 'EN COURS' | 'TERMINÉ';

export type PipelineStage = string; // Devient dynamique

export interface AppNotification {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'error';
}

export interface UserNotification {
  id: string;
  recipientId: string; // ID de l'utilisateur qui reçoit la notification
  title: string;
  message: string;
  type: 'site_update' | 'prestation_update' | 'assignment';
  relatedId: string; // ID du chantier ou de la prestation
  authorName: string; // Qui a fait le changement
  createdAt: string;
  read: boolean;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
}

export interface CustomHabilitation {
  id: string;
  name: string;
  color: string; // Classe CSS pour la couleur (ex: 'text-amber-600 bg-amber-50 border-amber-100')
}

export interface Company {
  id: string;
  name: string;
  siret?: string;
  logo?: string;
  website?: string;
  pipelineStages?: string[]; // Nouvelle liste d'étapes personnalisables
  siteStatuses?: string[]; // Statuts personnalisés pour les chantiers
  prestationStatuses?: string[]; // Statuts personnalisés pour les prestations
  checklistCategories?: string[]; // Catégories personnalisées pour les checklists
  customRoles?: CustomRole[]; // Rôles personnalisés
  customHabilitations?: CustomHabilitation[]; // Habilitations personnalisées
  maxSimultaneousSites?: number; // Limite de chantiers en parallèle
  // Adresse
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  // Facturation
  taxId?: string; // Numéro de TVA
  billingFirstName?: string;
  billingLastName?: string;
  billingEmail?: string;
  billingPhone?: string;
  subscription?: {
    plan: 'artisan_solo' | 'chantier_pro' | 'multi_sites_premium';
    status: 'active' | 'inactive' | 'trial';
    billingPeriod: 'monthly' | 'yearly';
    currentPeriodEnd: string;
    maxClients: number;
    maxSites: number;
    maxUsers: number;
    paymentMethod: 'manual';
    lastPaymentDate?: string;
    notes?: string;
  };
  limits?: {
    clientsReadOnly: string[];
    sitesReadOnly: string[];
  };
}

export type DefaultRole = 'Administrateur' | 'Conducteur de travaux' | 'Technicien';

export interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: string; // Peut être un rôle par défaut ou un rôle personnalisé
  avatar?: string;
  habilitations?: string[]; // Liste des habilitations détenues
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
  coordinates?: [number, number];
  initials: string;
  color: string;
  siret?: string;
  tva?: string;
}

export interface SiteTask {
  id: string;
  label: string;
  completed: boolean;
  isCritical?: boolean;
  completedBy?: string; // Nom de l'utilisateur qui a coché la tâche
  completedAt?: string; // ISO timestamp de quand la tâche a été cochée
  category?: string; // Catégorie du checklist (pour grouper les tâches)
}

export interface SiteComment {
  id: string;
  text: string;
  user: string;
  timestamp: string;
}

export interface DatePeriod {
  id: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  clientId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  budget: number;
  status: Status;
  pipelineStage: PipelineStage;
  coordinates?: [number, number];
  color?: string;
  tasks?: SiteTask[];
  assignedUserIds?: string[];
  datePeriods?: DatePeriod[]; // Périodes multiples pour les chantiers en plusieurs phases
  cloudLink?: string; // Lien vers un service cloud (Google Drive, OneDrive, Dropbox, etc.)
  closedAt?: string; // Date de clôture du chantier (ISO timestamp)
}

export interface Prestation extends Site {
  category?: string;
}

export interface SiteDocument {
  id: string;
  name: string;
  url: string;
  type: 'img' | 'pdf' | 'other';
  size: string;
  createdAt: string;
  uploadedBy: string;
}

export interface LeadActivity {
  id: string;
  type: 'stage_change' | 'field_update' | 'creation';
  description: string;
  user: string;
  timestamp: string;
}

export interface LeadComment {
  id: string;
  text: string;
  user: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  leadName: string;
  company?: string;
  email: string;
  phone: string;
  project: string;
  budget: number;
  address: string;
  source: string;
  comment: string;
  stage: PipelineStage;
  priority: 'Haute' | 'Moyenne' | 'Basse';
  clientId?: string; // Client assigné à cette opportunité
}

export interface ChecklistItem {
  id: string;
  label: string;
  isCritical?: boolean;
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  items: ChecklistItem[];
  lastUsed?: string;
}

export interface TodoTask {
  id: string;
  label: string;
  completed: boolean;
}

export type View = 'dashboard' | 'pipeline' | 'calendar' | 'sites' | 'prestations' | 'clients' | 'checklists' | 'settings';
