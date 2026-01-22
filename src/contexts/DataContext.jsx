import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { usersApi, plantoesApi } from '../services/api';

const DataContext = createContext(null);

import { useAuth } from './AuthContext';

export function DataProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [plantoes, setPlantoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Carregar dados iniciais apenas se estiver autenticado
  useEffect(() => {
    if (!user) {
      setUsers([]);
      setPlantoes([]);
      setLoading(false);
      return;
    }
    async function loadData() {
      try {
        setLoading(true);
        const [usersData, plantoesData] = await Promise.all([
          usersApi.getAll(),
          plantoesApi.getAll()
        ]);
        setUsers(usersData);
        setPlantoes(plantoesData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Funções de Usuários
  const addUser = useCallback(async (user) => {
    try {
      const newUser = await usersApi.create(user);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('Erro ao adicionar usuário:', err);
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (id, updates) => {
    try {
      const updatedUser = await usersApi.update(id, updates);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    try {
      await usersApi.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      throw err;
    }
  }, []);

  // Funções de Plantões
  const addPlantao = useCallback(async (plantao) => {
    try {
      const newPlantao = await plantoesApi.create(plantao);
      setPlantoes(prev => [...prev, newPlantao]);
      return newPlantao;
    } catch (err) {
      console.error('Erro ao adicionar plantão:', err);
      throw err;
    }
  }, []);

  const updatePlantao = useCallback(async (id, updates) => {
    try {
      // Remove _id do objeto de updates, se existir
      const { _id, ...safeUpdates } = updates || {};
      const updatedPlantao = await plantoesApi.update(id, safeUpdates);
      setPlantoes(prev => prev.map(p => String(p.id) === String(id) ? { ...p, ...updatedPlantao } : p));
      return updatedPlantao;
    } catch (err) {
      console.error('Erro ao atualizar plantão:', err);
      throw err;
    }
  }, []);

  const deletePlantao = useCallback(async (id) => {
    try {
      await plantoesApi.delete(id);
      setPlantoes(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Erro ao deletar plantão:', err);
      throw err;
    }
  }, []);

  // Função para recarregar dados
  const refreshData = useCallback(async () => {
    try {
      const [usersData, plantoesData] = await Promise.all([
        usersApi.getAll(),
        plantoesApi.getAll()
      ]);
      setUsers(usersData);
      setPlantoes(plantoesData);
    } catch (err) {
      console.error('Erro ao recarregar dados:', err);
    }
  }, []);

  const value = useMemo(() => ({
    // Estado
    loading,
    error,
    
    // Users
    getUsers: () => users,
    getUserById: (id) => users.find(u => u.id === id),
    getUsersByRole: (role) => users.filter(u => u.role === role),
    getGestores: () => users.filter(u => u.role === 'gestor'),
    getCorretores: () => users.filter(u => u.role === 'corretor'),
    getRecepcionistas: () => users.filter(u => u.role === 'recepcionista'),
    getPendentes: () => users.filter(u => u.role === 'pendente'),
    getCorretoresByGestor: (gestorId) => users.filter(u => u.role === 'corretor' && u.gestorId === gestorId),
    addUser,
    updateUser,
    deleteUser,
    
    // Plantões
    getPlantoes: () => plantoes,
    getPlantaoById: (id) => plantoes.find(p => p.id === id),
    getPlantoesByGestor: (gestorId) => plantoes.filter(p => p.gestorId === gestorId),
    getPlantoesByCorretor: (corretorId) => plantoes.filter(p => p.corretorId === corretorId),
    addPlantao,
    updatePlantao,
    deletePlantao,

    // Utilitários
    refreshData,
  }), [users, plantoes, loading, error, addUser, updateUser, deleteUser, addPlantao, updatePlantao, deletePlantao, refreshData]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
