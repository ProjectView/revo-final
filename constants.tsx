
import React from 'react';
import { LayoutDashboard, BarChart3, Calendar, HardHat, Users, CheckSquare, Settings, Wrench } from 'lucide-react';
import { Client, Site, TodoTask, View, ChecklistTemplate } from './types';

export const NAV_ITEMS = [
  { id: 'dashboard' as View, label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
  { id: 'pipeline' as View, label: 'Pipeline Commerciale', icon: <BarChart3 size={20} /> },
  { id: 'calendar' as View, label: 'Calendrier', icon: <Calendar size={20} /> },
  { id: 'sites' as View, label: 'Chantiers', icon: <HardHat size={20} /> },
  { id: 'prestations' as View, label: 'Prestations', icon: <Wrench size={20} /> },
  { id: 'clients' as View, label: 'Clients', icon: <Users size={20} /> },
  { id: 'checklists' as View, label: 'Checklist', icon: <CheckSquare size={20} /> },
  { id: 'settings' as View, label: 'Réglages', icon: <Settings size={20} /> },
];

export const EXTERNAL_ROLE = 'Utilisateur Externe';
export const EXTERNAL_ALLOWED_VIEWS: View[] = ['sites', 'prestations'];
export const EXTERNAL_NAV_ITEMS = NAV_ITEMS.filter(item => EXTERNAL_ALLOWED_VIEWS.includes(item.id));

// Shared color palette for sites and prestations (no red — reserved for "invalidé").
export const COLOR_PALETTE = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-teal-600',
  'bg-orange-600',
  'bg-pink-600',
  'bg-lime-600',
  'bg-sky-600',
  'bg-slate-700',
];

export const getRandomPaletteColor = (): string =>
  COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Sylvain CUCULIERE', company: 'SOA', email: 'sylvain.cuculiere@soa-agencement.com', phone: '06 07 39 25 17', initials: 'SC', color: 'bg-purple-500' },
  { id: 'c2', name: 'mini toto', company: 'TOTO SCI', email: 'contact@toto.fr', phone: 'Non renseigné', initials: 'MT', color: 'bg-emerald-500' },
  { id: 'c3', name: 'Bernard NGUYEN', company: 'PROJECTVIEW', email: 'bernard@projectview.fr', phone: '0777300658', initials: 'BN', color: 'bg-green-300' },
  { id: 'c4', name: 'Toto', company: 'TOTITO', email: 'toto@test.fr', phone: 'Non renseigné', initials: 'TO', color: 'bg-lime-400' },
];

export const MOCK_SITES: Site[] = [
  { 
    id: 's1', 
    name: 'Showroom SOA', 
    address: '18 rue jules ferry, 69360 saint symphorien d\'ozon', 
    clientId: 'c1', 
    startDate: '2025-12-18', 
    endDate: '2025-12-25', 
    startTime: '12:00',
    endTime: '17:00',
    budget: 5000, 
    status: 'EN RÉVISION', 
    pipelineStage: 'Devis envoyé',
    coordinates: [45.6267, 4.8561],
    color: 'bg-emerald-700'
  },
  { 
    id: 's2', 
    name: 'salle de controle - mini toto', 
    address: '15 rue jules ferry, 69360 saint symphorien d\'ozon', 
    clientId: 'c2', 
    startDate: '2026-01-08', 
    endDate: '2026-01-20', 
    startTime: '07:30',
    endTime: '16:30',
    budget: 6000000, 
    status: 'NOUVEAU', 
    pipelineStage: 'Négociation',
    coordinates: [45.6250, 4.8540],
    color: 'bg-indigo-600'
  },
  { 
    id: 's3', 
    name: 'salle de bain - Toto', 
    address: '6 route de Lyon, 69800 Saint-Priest', 
    clientId: 'c4', 
    startDate: '2026-01-07', 
    endDate: '2026-01-15', 
    startTime: '09:00',
    endTime: '18:00',
    budget: 5000, 
    status: 'NOUVEAU', 
    pipelineStage: 'Négociation',
    coordinates: [45.7167, 4.8500],
    color: 'bg-amber-600'
  },
  { 
    id: 's4', 
    name: 'Projet - Tyty', 
    address: '6 rue de geneve, 69800 st priest', 
    clientId: 'c3', 
    startDate: '2026-01-15', 
    endDate: '2026-01-16', 
    startTime: '08:00',
    endTime: '17:30',
    budget: 456789, 
    status: 'EN COURS', 
    pipelineStage: 'Devis envoyé',
    coordinates: [45.7100, 4.9400],
    color: 'bg-rose-700'
  },
];

export const MOCK_CHECKLISTS: ChecklistTemplate[] = [
  {
    id: 'ct1',
    title: 'Installation Électrique Standard',
    category: 'Électricité',
    description: 'Procédure de contrôle pour les installations résidentielles neuves.',
    items: [
      { id: 'i1', label: 'Vérification du tableau de répartition', isCritical: true },
      { id: 'i2', label: 'Test de continuité de la terre', isCritical: true },
      { id: 'i3', label: 'Vérification de l\'étiquetage des circuits' },
      { id: 'i4', label: 'Fixation des appareillages' }
    ],
    lastUsed: '2024-10-15'
  },
  {
    id: 'ct2',
    title: 'Réception de Peinture',
    category: 'Finitions',
    description: 'Contrôle de la planéité et de l\'uniformité des supports peints.',
    items: [
      { id: 'i5', label: 'Absence de coulures visibles à 1m' },
      { id: 'i6', label: 'Récolement des teintes avec le nuancier' },
      { id: 'i7', label: 'Protection des menuiseries retirée' }
    ],
    lastUsed: '2024-11-02'
  },
  {
    id: 'ct3',
    title: 'Sécurité & Base Vie',
    category: 'Logistique',
    description: 'Audit hebdomadaire de la conformité du chantier.',
    items: [
      { id: 'i8', label: 'Affichage obligatoire à jour', isCritical: true },
      { id: 'i9', label: 'Extincteurs accessibles et valides', isCritical: true },
      { id: 'i10', label: 'Propreté des zones communes' }
    ]
  }
];

export const MOCK_TODOS: TodoTask[] = [
  { id: 't1', label: 'Appeler Jean Dupont', completed: false },
  { id: 't2', label: 'Commander matériel élec', completed: true },
  { id: 't3', label: 'Valider devis Martin', completed: false },
  { id: 't4', label: 'Réunion équipe 14h', completed: false },
];

export const SUBSCRIPTION_PLANS = {
  artisan_solo: {
    id: 'artisan_solo',
    name: 'Artisan Solo',
    tagline: 'Pour débuter',
    isFree: true,
    pricing: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      maxClients: 3,
      maxSites: 5,
      maxUsers: 1,
      maxSimultaneousSites: 1,
    },
    features: [
      'Jusqu\'à 3 clients',
      'Jusqu\'à 5 chantiers',
      '1 utilisateur',
      'Support email',
    ],
    color: 'bg-slate-100',
    textColor: 'text-slate-600',
  },
  chantier_pro: {
    id: 'chantier_pro',
    name: 'Chantier Pro',
    tagline: 'Pour grandir',
    isFree: false,
    pricing: {
      monthly: 50,
      yearly: 500,
    },
    limits: {
      maxClients: Infinity,
      maxSites: Infinity,
      maxUsers: 3,
      maxSimultaneousSites: Infinity,
    },
    features: [
      'Clients illimités',
      'Chantiers illimités',
      'Jusqu\'à 3 utilisateurs',
      'Support prioritaire',
    ],
    color: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  multi_sites_premium: {
    id: 'multi_sites_premium',
    name: 'Multi-Sites Premium',
    tagline: 'Pour les équipes',
    isFree: false,
    pricing: {
      monthly: 150,
      yearly: 1500,
    },
    limits: {
      maxClients: Infinity,
      maxSites: Infinity,
      maxUsers: Infinity,
      maxSimultaneousSites: Infinity,
    },
    features: [
      'Clients illimités',
      'Chantiers illimités',
      'Utilisateurs illimités',
      'Support premium 24/7',
      'Pipeline et statuts personnalisés',
    ],
    color: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
};
