const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sealed_token');
  }
  return null;
};

// Helper to set auth token
export const setToken = (token: string) => {
  localStorage.setItem('sealed_token', token);
};

// Helper to remove auth token
export const removeToken = () => {
  localStorage.removeItem('sealed_token');
};

// Base fetch with auth
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Auth API
export const auth = {
  register: (email: string, password: string, name: string) =>
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => fetchWithAuth('/auth/me'),
};

// Vault API
export const vaults = {
  create: (name: string, description?: string) =>
    fetchWithAuth('/vaults', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),

  getAll: () => fetchWithAuth('/vaults'),

  getOne: (vaultId: string) => fetchWithAuth(`/vaults/${vaultId}`),

  generateInvite: (vaultId: string) =>
    fetchWithAuth(`/vaults/${vaultId}/invite`, { method: 'POST' }),

  join: (inviteCode: string) =>
    fetchWithAuth('/vaults/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),
};

// Letter API
export const letters = {
  create: (vaultId: string, data: {
    title: string;
    content: string;
    unlockType: 'date' | 'event' | 'consensus';
    unlockDate?: string;
    unlockEvent?: string;
  }) =>
    fetchWithAuth(`/vaults/${vaultId}/letters`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (vaultId: string) => fetchWithAuth(`/vaults/${vaultId}/letters`),

  getOne: (vaultId: string, letterId: string) =>
    fetchWithAuth(`/vaults/${vaultId}/letters/${letterId}`),

  update: (vaultId: string, letterId: string, data: { title?: string; content?: string }) =>
    fetchWithAuth(`/vaults/${vaultId}/letters/${letterId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  unlock: (vaultId: string, letterId: string) =>
    fetchWithAuth(`/vaults/${vaultId}/letters/${letterId}/unlock`, {
      method: 'PATCH',
    }),

  delete: (vaultId: string, letterId: string) =>
    fetchWithAuth(`/vaults/${vaultId}/letters/${letterId}`, {
      method: 'DELETE',
    }),
};

// Vote API
export const votes = {
  cast: (vaultId: string, letterId: string, vote: 'yes' | 'no') =>
    fetchWithAuth(`/vaults/${vaultId}/letters/${letterId}/votes`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }),

  get: (vaultId: string, letterId: string) =>
    fetchWithAuth(`/vaults/${vaultId}/letters/${letterId}/votes`),
};

// AI API
export const ai = {
  getPrompts: (mood?: string, context?: string) =>
    fetchWithAuth('/ai/prompts', {
      method: 'POST',
      body: JSON.stringify({ mood, context }),
    }),
};
