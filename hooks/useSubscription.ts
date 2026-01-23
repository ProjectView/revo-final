import { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { SUBSCRIPTION_PLANS } from '../constants';

export const useSubscription = () => {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error('useSubscription must be used within DataProvider');
  }

  const { company, clients, sites, users } = context;

  if (!company?.subscription) {
    return {
      planConfig: SUBSCRIPTION_PLANS.artisan_solo,
      canAddClient: () => ({ allowed: false, current: 0, max: 0, message: 'Plan non configuré' }),
      canAddSite: () => ({ allowed: false, current: 0, max: 0, message: 'Plan non configuré' }),
      canAddUser: () => ({ allowed: false, current: 0, max: 0, message: 'Plan non configuré' }),
      isReadOnly: () => false,
      isUnlimited: () => false,
      canDowngradeTo: () => true,
    };
  }

  const planConfig = SUBSCRIPTION_PLANS[company.subscription.plan];
  const clientsReadOnly = company.limits?.clientsReadOnly || [];
  const sitesReadOnly = company.limits?.sitesReadOnly || [];

  return {
    planConfig,

    canAddClient: () => {
      const max = planConfig.limits.maxClients;
      const current = clients.filter(c => !clientsReadOnly.includes(c.id)).length;
      const allowed = current < max;

      return {
        allowed,
        current,
        max,
        message: `${current}/${max} clients utilisés`,
      };
    },

    canAddSite: () => {
      const max = planConfig.limits.maxSites;
      const current = sites.filter(s => !sitesReadOnly.includes(s.id)).length;
      const allowed = current < max;

      return {
        allowed,
        current,
        max,
        message: `${current}/${max} chantiers utilisés`,
      };
    },

    canAddUser: () => {
      const max = planConfig.limits.maxUsers;
      const current = users.length;
      const allowed = current < max;

      return {
        allowed,
        current,
        max,
        message: `${current}/${max} utilisateurs utilisés`,
      };
    },

    isReadOnly: (entityType: 'client' | 'site', entityId: string) => {
      if (entityType === 'client') {
        return clientsReadOnly.includes(entityId);
      }
      if (entityType === 'site') {
        return sitesReadOnly.includes(entityId);
      }
      return false;
    },

    isUnlimited: (limitType: 'clients' | 'sites' | 'users' | 'simultaneousSites') => {
      const limits = planConfig.limits;
      switch (limitType) {
        case 'clients':
          return limits.maxClients === Infinity;
        case 'sites':
          return limits.maxSites === Infinity;
        case 'users':
          return limits.maxUsers === Infinity;
        case 'simultaneousSites':
          return limits.maxSimultaneousSites === Infinity;
        default:
          return false;
      }
    },

    getUsagePercentage: (limitType: 'clients' | 'sites' | 'users') => {
      if (limitType === 'clients') {
        const max = planConfig.limits.maxClients;
        const current = clients.filter(c => !clientsReadOnly.includes(c.id)).length;
        return max === Infinity ? 0 : Math.round((current / max) * 100);
      }
      if (limitType === 'sites') {
        const max = planConfig.limits.maxSites;
        const current = sites.filter(s => !sitesReadOnly.includes(s.id)).length;
        return max === Infinity ? 0 : Math.round((current / max) * 100);
      }
      if (limitType === 'users') {
        const max = planConfig.limits.maxUsers;
        const current = users.length;
        return max === Infinity ? 0 : Math.round((current / max) * 100);
      }
      return 0;
    },

    canDowngradeTo: (targetPlan: keyof typeof SUBSCRIPTION_PLANS) => {
      const targetLimits = SUBSCRIPTION_PLANS[targetPlan].limits;
      const activeClients = clients.filter(c => !clientsReadOnly.includes(c.id)).length;
      const activeSites = sites.filter(s => !sitesReadOnly.includes(s.id)).length;
      const activeUsers = users.length;

      return {
        canDowngrade: activeClients <= targetLimits.maxClients &&
                     activeSites <= targetLimits.maxSites &&
                     activeUsers <= targetLimits.maxUsers,
        clientsToMove: Math.max(0, activeClients - targetLimits.maxClients),
        sitesToMove: Math.max(0, activeSites - targetLimits.maxSites),
        usersToMove: Math.max(0, activeUsers - targetLimits.maxUsers),
      };
    },
  };
};
