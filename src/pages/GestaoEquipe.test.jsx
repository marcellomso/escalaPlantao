import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import GestaoEquipe from './GestaoEquipe';

// Mocks dos contextos
const mockUser = {
  id: 'diretor-1',
  name: 'Diretor Teste',
  email: 'diretor@teste.com',
  role: 'diretor',
};

const mockUsers = [
  { id: 'diretor-1', name: 'Diretor Teste', email: 'diretor@teste.com', role: 'diretor' },
  { id: 'gestor-1', name: 'Gestor Um', email: 'gestor1@teste.com', role: 'gestor' },
  { id: 'gestor-2', name: 'Gestor Dois', email: 'gestor2@teste.com', role: 'gestor' },
  { id: 'corretor-1', name: 'Corretor Um', email: 'corretor1@teste.com', role: 'corretor', gestorId: 'gestor-1' },
  { id: 'corretor-2', name: 'Corretor Dois', email: 'corretor2@teste.com', role: 'corretor', gestorId: null },
  { id: 'pendente-1', name: 'Pendente Um', email: 'pendente1@teste.com', role: 'pendente' },
];

const mockGetUsers = vi.fn(() => mockUsers);
const mockGetGestores = vi.fn(() => mockUsers.filter(u => u.role === 'gestor'));
const mockGetCorretoresByGestor = vi.fn((gestorId) => mockUsers.filter(u => u.role === 'corretor' && u.gestorId === gestorId));
const mockGetUserById = vi.fn((id) => mockUsers.find(u => u.id === id));
const mockAddUser = vi.fn();
const mockUpdateUser = vi.fn();
const mockDeleteUser = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock('../contexts/DataContext', () => ({
  useData: () => ({
    getUsers: mockGetUsers,
    getGestores: mockGetGestores,
    getCorretoresByGestor: mockGetCorretoresByGestor,
    getUserById: mockGetUserById,
    addUser: mockAddUser,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
  }),
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('GestaoEquipe - Visão do Diretor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o título correto para diretor', () => {
    renderWithRouter(<GestaoEquipe />);
    
    expect(screen.getByText('Gestão de Equipe')).toBeInTheDocument();
    expect(screen.getByText('Gerencie membros, cargos e vínculos da equipe')).toBeInTheDocument();
  });

  it('deve mostrar as 3 abas para o diretor', () => {
    renderWithRouter(<GestaoEquipe />);
    
    expect(screen.getByText('Equipe')).toBeInTheDocument();
    expect(screen.getByText('Cargos')).toBeInTheDocument();
    expect(screen.getByText('Vínculos')).toBeInTheDocument();
  });

  it('deve mostrar botão de Novo Membro para diretor', () => {
    renderWithRouter(<GestaoEquipe />);
    
    expect(screen.getByText('Novo Membro')).toBeInTheDocument();
  });

  it('deve mostrar campo de busca', () => {
    renderWithRouter(<GestaoEquipe />);
    
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('deve mostrar alerta de pendentes quando há usuários pendentes', () => {
    renderWithRouter(<GestaoEquipe />);
    
    expect(screen.getByText(/usuário aguardando atribuição de cargo/i)).toBeInTheDocument();
  });

  it('deve mostrar alerta de corretores sem gestor', () => {
    renderWithRouter(<GestaoEquipe />);
    
    expect(screen.getByText(/corretor sem gestor vinculado/i)).toBeInTheDocument();
  });

  it('deve mostrar contagem de membros', () => {
    renderWithRouter(<GestaoEquipe />);
    
    expect(screen.getByText(/2 gestores/i)).toBeInTheDocument();
  });

  it('deve navegar entre abas ao clicar', async () => {
    const user = userEvent.setup();
    renderWithRouter(<GestaoEquipe />);
    
    // Clicar na aba Cargos
    const cargosTab = screen.getByText('Cargos');
    await user.click(cargosTab);
    
    // Deve mostrar conteúdo da aba Cargos (dropdowns de cargo)
    await waitFor(() => {
      // Na aba de cargos, todos os usuários aparecem com dropdown de cargo
      expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
    });
  });

  it('deve abrir modal ao clicar em Novo Membro', async () => {
    const user = userEvent.setup();
    renderWithRouter(<GestaoEquipe />);
    
    const novoMembroBtn = screen.getByRole('button', { name: /novo membro/i });
    await user.click(novoMembroBtn);
    
    await waitFor(() => {
      // O título do modal será "Novo Membro" como heading
      expect(screen.getByRole('heading', { name: /novo membro/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nome do membro')).toBeInTheDocument();
    });
  });

  it('deve filtrar membros ao buscar', async () => {
    const user = userEvent.setup();
    renderWithRouter(<GestaoEquipe />);
    
    const searchInput = screen.getByPlaceholderText('Buscar...');
    await user.type(searchInput, 'Gestor Um');
    
    await waitFor(() => {
      expect(screen.getByText('Gestor Um')).toBeInTheDocument();
    });
  });
});

describe('GestaoEquipe - Aba Cargos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar dropdown de cargo para cada usuário', async () => {
    const user = userEvent.setup();
    renderWithRouter(<GestaoEquipe />);
    
    // Navegar para aba Cargos
    const cargosTab = screen.getByText('Cargos');
    await user.click(cargosTab);
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      // Deve ter selects para usuários que não são o atual
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it('deve chamar updateUser ao alterar cargo', async () => {
    const user = userEvent.setup();
    renderWithRouter(<GestaoEquipe />);
    
    // Navegar para aba Cargos
    const cargosTab = screen.getByText('Cargos');
    await user.click(cargosTab);
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });
    
    // Selecionar primeiro select que não é do usuário atual
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'gestor');
    
    expect(mockUpdateUser).toHaveBeenCalled();
  });
});

describe('GestaoEquipe - Aba Vínculos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar lista de corretores', async () => {
    const user = userEvent.setup();
    renderWithRouter(<GestaoEquipe />);
    
    // Navegar para aba Vínculos
    const vinculosTab = screen.getByText('Vínculos');
    await user.click(vinculosTab);
    
    await waitFor(() => {
      expect(screen.getByText('Corretor Um')).toBeInTheDocument();
      expect(screen.getByText('Corretor Dois')).toBeInTheDocument();
    });
  });

  it('deve mostrar seletor de gestor para corretores sem vínculo', async () => {
    const user = userEvent.setup();
    renderWithRouter(<GestaoEquipe />);
    
    // Navegar para aba Vínculos
    const vinculosTab = screen.getByText('Vínculos');
    await user.click(vinculosTab);
    
    await waitFor(() => {
      expect(screen.getByText('Selecione um gestor...')).toBeInTheDocument();
    });
  });
});
