
export type Status = 'NOUVEAU' | 'EN RÉVISION' | 'EN COURS' | 'TERMINÉ';

export type PipelineStage = 'Nouveau' | 'Qualifié' | 'Devis envoyé' | 'Négociation';

export interface Company {
  id: string;
  name: string;
  siret?: string;
  logo?: string;
  website?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: 'Administrateur' | 'Conducteur de travaux' | 'Technicien';
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

export interface SiteDocument {
  id: string;
  name: string;
  url: string;
  type: 'img' | 'pdf' | 'other';
  size: string;
  createdAt: string;
  uploadedBy: string;
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

export type View = 'dashboard' | 'pipeline' | 'calendar' | 'sites' | 'clients' | 'checklists' | 'settings';
