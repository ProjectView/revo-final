
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

export interface Company {
  id: string;
  name: string;
  siret?: string;
  logo?: string;
  website?: string;
  pipelineStages?: string[]; // Nouvelle liste d'étapes personnalisables
  siteStatuses?: string[]; // Statuts personnalisés pour les chantiers
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

export interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: 'Administrateur' | 'Conducteur de travaux' | 'Technicien';
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
}

export interface SiteTask {
  id: string;
  label: string;
  completed: boolean;
  isCritical?: boolean;
}

export interface SiteComment {
  id: string;
  text: string;
  user: string;
  timestamp: string;
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
