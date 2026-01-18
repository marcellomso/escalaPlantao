import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const DataContext = createContext(null);

const initialData = {
  users: [
    {
      id: '1',
      name: 'Admin Diretor',
      email: 'diretor@escala.com',
      password: '123456',
      role: 'diretor',
      gestorId: null
    },
    {
      id: '2',
      name: 'João Batista',
      email: 'joao@escala.com',
      password: '123456',
      role: 'gestor',
      gestorId: null
    },
    {
      id: '3',
      name: 'Claudia Glasson',
      email: 'claudia@escala.com',
      password: '123456',
      role: 'gestor',
      gestorId: null
    },
    {
      id: '4',
      name: 'Fernanda Machado',
      email: 'fernanda@escala.com',
      password: '123456',
      role: 'gestor',
      gestorId: null
    },
    {
      id: '5',
      name: 'Matheus Rohde Flach Catani',
      email: 'matheus@escala.com',
      password: '123456',
      role: 'corretor',
      gestorId: '2'
    },
    {
      id: '6',
      name: 'Carlos Silva',
      email: 'carlos@escala.com',
      password: '123456',
      role: 'corretor',
      gestorId: '2'
    }
  ],
  plantoes: [
    {
      id: '1',
      title: 'Reserva Ipê Premium',
      date: '2026-01-18',
      startTime: '08:00',
      endTime: '20:00',
      location: 'Av 33333',
      notes: 'teste',
      gestorId: '2',
      corretorIds: [],
      status: 'pendente'
    },
    {
      id: '2',
      title: 'Stand Lamborghini (Manhã)',
      date: '2026-01-12',
      startTime: '08:00',
      endTime: '13:00',
      location: 'stand',
      notes: '',
      gestorId: '3',
      corretorIds: [],
      status: 'pendente'
    },
    {
      id: '3',
      title: 'Central Palme (Tarde)',
      date: '2026-01-13',
      startTime: '13:00',
      endTime: '19:00',
      location: 'palme',
      notes: '',
      gestorId: '2',
      corretorIds: [],
      status: 'pendente'
    },
    {
      id: '4',
      title: 'STAND ECOVILLE (Manhã)',
      date: '2026-01-12',
      startTime: '08:00',
      endTime: '13:00',
      location: 'STAND ECOVILLE',
      notes: '',
      gestorId: '4',
      corretorIds: [],
      status: 'pendente'
    },
    {
      id: '5',
      title: 'Container 15W22 (Manhã)',
      date: '2026-01-15',
      startTime: '08:00',
      endTime: '20:00',
      location: '15W22',
      notes: '',
      gestorId: '3',
      corretorIds: [],
      status: 'pendente'
    },
    {
      id: '6',
      title: 'Central Elmo RP (Manhã)',
      date: '2026-01-14',
      startTime: '08:00',
      endTime: '13:00',
      location: 'RP',
      notes: '',
      gestorId: '4',
      corretorIds: [],
      status: 'pendente'
    }
  ]
};

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('escala_data');
    return saved ? JSON.parse(saved) : initialData;
  });

  // Salvar no localStorage quando os dados mudarem
  useEffect(() => {
    localStorage.setItem('escala_data', JSON.stringify(data));
  }, [data]);

  // Sincronizar dados entre abas/sessões do navegador
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'escala_data' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          setData(newData);
        } catch (error) {
          console.error('Erro ao sincronizar dados:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Funções de ação (mutations)
  const addUser = (user) => {
    const newUser = { ...user, id: Date.now().toString() };
    setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return newUser;
  };

  const updateUser = (id, updates) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  };

  const deleteUser = (id) => {
    setData(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));
  };

  const addPlantao = (plantao) => {
    const newPlantao = { ...plantao, id: Date.now().toString() };
    setData(prev => ({ ...prev, plantoes: [...prev.plantoes, newPlantao] }));
    return newPlantao;
  };

  const updatePlantao = (id, updates) => {
    setData(prev => ({
      ...prev,
      plantoes: prev.plantoes.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deletePlantao = (id) => {
    setData(prev => ({
      ...prev,
      plantoes: prev.plantoes.filter(p => p.id !== id)
    }));
  };

  // Usar useMemo para garantir que o value mude quando data mudar
  const value = useMemo(() => ({
    // Users
    getUsers: () => data.users,
    getUserById: (id) => data.users.find(u => u.id === id),
    getUsersByRole: (role) => data.users.filter(u => u.role === role),
    getGestores: () => data.users.filter(u => u.role === 'gestor'),
    getCorretores: () => data.users.filter(u => u.role === 'corretor'),
    getCorretoresByGestor: (gestorId) => data.users.filter(u => u.role === 'corretor' && u.gestorId === gestorId),
    addUser,
    updateUser,
    deleteUser,
    // Plantões
    getPlantoes: () => data.plantoes,
    getPlantaoById: (id) => data.plantoes.find(p => p.id === id),
    getPlantoesByGestor: (gestorId) => data.plantoes.filter(p => p.gestorId === gestorId),
    getPlantoesByCorretor: (corretorId) => data.plantoes.filter(p => p.corretorIds?.includes(corretorId)),
    addPlantao,
    updatePlantao,
    deletePlantao,
  }), [data]);

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
