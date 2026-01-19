// Em produção, usa URL relativa. Em dev, usa localhost:3001
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Função auxiliar para requisições
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro na requisição');
  }

  return response.json();
}

// API de Usuários
export const usersApi = {
  // Buscar todos os usuários
  getAll: () => request('/users'),

  // Buscar usuário por ID
  getById: (id) => request(`/users/${id}`),

  // Buscar usuários por role
  getByRole: (role) => request(`/users/role/${role}`),

  // Buscar gestores
  getGestores: () => request('/users/role/gestor'),

  // Buscar corretores
  getCorretores: () => request('/users/role/corretor'),

  // Buscar corretores de um gestor
  getCorretoresByGestor: (gestorId) => request(`/users/gestor/${gestorId}/corretores`),

  // Criar usuário
  create: (user) => request('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),

  // Atualizar usuário
  update: (id, updates) => request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),

  // Deletar usuário
  delete: (id) => request(`/users/${id}`, {
    method: 'DELETE',
  }),

  // Login
  login: (email, password) => request('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
};

// API de Plantões
export const plantoesApi = {
  // Buscar todos os plantões
  getAll: () => request('/plantoes'),

  // Buscar plantão por ID
  getById: (id) => request(`/plantoes/${id}`),

  // Buscar plantões por gestor
  getByGestor: (gestorId) => request(`/plantoes/gestor/${gestorId}`),

  // Buscar plantões por corretor
  getByCorretor: (corretorId) => request(`/plantoes/corretor/${corretorId}`),

  // Criar plantão
  create: (plantao) => request('/plantoes', {
    method: 'POST',
    body: JSON.stringify(plantao),
  }),

  // Atualizar plantão
  update: (id, updates) => request(`/plantoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),

  // Deletar plantão
  delete: (id) => request(`/plantoes/${id}`, {
    method: 'DELETE',
  }),
};

export default { usersApi, plantoesApi };
