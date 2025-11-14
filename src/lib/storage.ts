import { Task, Usuario, Grupo, Subscription, Voucher } from './types';

const STORAGE_KEYS = {
  tasks: 'taskflow_tasks',
  users: 'taskflow_users',
  groups: 'taskflow_groups',
  currentUser: 'taskflow_current_user',
  subscriptions: 'taskflow_subscriptions',
  vouchers: 'taskflow_vouchers'
};

// Tasks Storage
export const storageTasks = {
  getAll: (): Task[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.tasks);
    return data ? JSON.parse(data) : [];
  },

  getByGroup: (grupoId: string): Task[] => {
    const allTasks = storageTasks.getAll();
    return allTasks.filter(t => t.grupoId === grupoId);
  },

  getByUserGroups: (grupoIds: string[]): Task[] => {
    const allTasks = storageTasks.getAll();
    return allTasks.filter(t => grupoIds.includes(t.grupoId));
  },

  save: (tasks: Task[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  },

  add: (task: Task): void => {
    const tasks = storageTasks.getAll();
    tasks.push(task);
    storageTasks.save(tasks);
  },

  update: (id: string, updatedTask: Partial<Task>): void => {
    const tasks = storageTasks.getAll();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedTask };
      storageTasks.save(tasks);
    }
  },

  delete: (id: string): void => {
    const tasks = storageTasks.getAll();
    const filtered = tasks.filter(t => t.id !== id);
    storageTasks.save(filtered);
  }
};

// Users Storage
export const storageUsers = {
  getAll: (): Usuario[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.users);
    return data ? JSON.parse(data) : [];
  },

  getByGroup: (grupoId: string): Usuario[] => {
    const users = storageUsers.getAll();
    return users.filter(u => u.grupoIds.includes(grupoId));
  },

  getById: (id: string): Usuario | null => {
    const users = storageUsers.getAll();
    return users.find(u => u.id === id) || null;
  },

  save: (users: Usuario[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  },

  add: (user: Usuario): void => {
    const users = storageUsers.getAll();
    users.push(user);
    storageUsers.save(users);
  },

  update: (id: string, updatedUser: Partial<Usuario>): void => {
    const users = storageUsers.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      storageUsers.save(users);
      
      // Atualiza o usuário atual se for o mesmo
      const currentUser = storageUsers.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        storageUsers.setCurrentUser({ ...currentUser, ...updatedUser });
      }
    }
  },

  getCurrentUser: (): Usuario | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.currentUser);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: Usuario | null): void => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }
};

// Groups Storage
export const storageGroups = {
  getAll: (): Grupo[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.groups);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Grupo | null => {
    const groups = storageGroups.getAll();
    return groups.find(g => g.id === id) || null;
  },

  getByUser: (userId: string): Grupo[] => {
    const groups = storageGroups.getAll();
    return groups.filter(g => g.membros.includes(userId));
  },

  save: (groups: Grupo[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(groups));
  },

  add: (group: Grupo): void => {
    const groups = storageGroups.getAll();
    groups.push(group);
    storageGroups.save(groups);
  },

  update: (id: string, updatedGroup: Partial<Grupo>): void => {
    const groups = storageGroups.getAll();
    const index = groups.findIndex(g => g.id === id);
    if (index !== -1) {
      groups[index] = { ...groups[index], ...updatedGroup };
      storageGroups.save(groups);
    }
  },

  addMember: (groupId: string, userId: string): void => {
    const group = storageGroups.getById(groupId);
    if (group && !group.membros.includes(userId)) {
      group.membros.push(userId);
      storageGroups.update(groupId, group);
    }
  }
};

// Subscriptions Storage
export const storageSubscriptions = {
  get: (userId: string): Subscription | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.subscriptions);
    const subscriptions: Subscription[] = data ? JSON.parse(data) : [];
    return subscriptions.find(s => s.userId === userId) || null;
  },

  save: (subscription: Subscription): void => {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem(STORAGE_KEYS.subscriptions);
    const subscriptions: Subscription[] = data ? JSON.parse(data) : [];
    const index = subscriptions.findIndex(s => s.userId === subscription.userId);
    
    if (index !== -1) {
      subscriptions[index] = subscription;
    } else {
      subscriptions.push(subscription);
    }
    
    localStorage.setItem(STORAGE_KEYS.subscriptions, JSON.stringify(subscriptions));
  },

  isPremium: (userId: string): boolean => {
    const subscription = storageSubscriptions.get(userId);
    if (!subscription?.isPremium) return false;
    
    // Verifica se a assinatura expirou (exceto vitalício)
    if (subscription.dataExpiracao) {
      const expiracao = new Date(subscription.dataExpiracao);
      const agora = new Date();
      return agora < expiracao;
    }
    
    return true;
  }
};

// Vouchers Storage
export const storageVouchers = {
  getAll: (): Voucher[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.vouchers);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Voucher | null => {
    const vouchers = storageVouchers.getAll();
    return vouchers.find(v => v.id === id) || null;
  },

  getByCodigo: (codigo: string): Voucher | null => {
    const vouchers = storageVouchers.getAll();
    return vouchers.find(v => v.codigo.toLowerCase() === codigo.toLowerCase()) || null;
  },

  save: (vouchers: Voucher[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.vouchers, JSON.stringify(vouchers));
  },

  add: (voucher: Voucher): void => {
    const vouchers = storageVouchers.getAll();
    vouchers.push(voucher);
    storageVouchers.save(vouchers);
  },

  update: (id: string, updatedVoucher: Partial<Voucher>): void => {
    const vouchers = storageVouchers.getAll();
    const index = vouchers.findIndex(v => v.id === id);
    if (index !== -1) {
      vouchers[index] = { ...vouchers[index], ...updatedVoucher };
      storageVouchers.save(vouchers);
    }
  },

  marcarComoUsado: (codigo: string, userId: string): boolean => {
    const voucher = storageVouchers.getByCodigo(codigo);
    if (!voucher || voucher.usado) return false;
    
    storageVouchers.update(voucher.id, {
      usado: true,
      usadoPor: userId,
      usadoEm: new Date().toISOString()
    });
    
    return true;
  }
};
