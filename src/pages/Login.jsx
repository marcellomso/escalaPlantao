import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Shield, Briefcase, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Modal from '../components/Modal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showGestorModal, setShowGestorModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [selectedGestor, setSelectedGestor] = useState('');
  
  const { login } = useAuth();
  const { getUsers, getGestores, updateUser } = useData();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      setError('Email ou senha inválidos');
      return;
    }

    // Se for corretor sem gestor, pedir para selecionar
    if (user.role === 'corretor' && !user.gestorId) {
      setPendingUser(user);
      setShowGestorModal(true);
      return;
    }

    login(user);
    navigate('/');
  };

  const handleConfirmGestor = () => {
    if (!selectedGestor) return;
    
    updateUser(pendingUser.id, { gestorId: selectedGestor });
    const updatedUser = { ...pendingUser, gestorId: selectedGestor };
    login(updatedUser);
    navigate('/');
  };

  const roles = [
    {
      icon: Shield,
      title: 'Diretor',
      description: 'Cria plantões e atribui aos gestores responsáveis',
      color: 'bg-primary-800'
    },
    {
      icon: Briefcase,
      title: 'Gestor',
      description: 'Gerencia os plantões e distribui aos corretores',
      color: 'bg-amber-600'
    },
    {
      icon: Building2,
      title: 'Corretor',
      description: 'Visualiza e confirma presença nos plantões',
      color: 'bg-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Escala de Plantões</h1>
          <p className="text-gray-400">Sistema inteligente para gerenciamento de plantões de corretores</p>
        </div>

        {/* Roles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3 mb-8">
          {roles.map((role) => (
            <div key={role.title} className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 text-left sm:text-center bg-white/5 sm:bg-transparent rounded-lg p-3 sm:p-0">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 ${role.color} rounded-xl flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-2`}>
                <role.icon className="text-white" size={24} />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-white text-sm">{role.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">{role.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Entrar no Sistema
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-4 text-center text-gray-400 text-sm">
            <p>Contas de teste:</p>
            <p className="text-xs mt-1">diretor@escala.com / joao@escala.com / matheus@escala.com</p>
            <p className="text-xs">Senha: 123456</p>
          </div>
        </div>
      </div>

      {/* Modal de seleção de gestor */}
      <Modal
        isOpen={showGestorModal}
        onClose={() => setShowGestorModal(false)}
        title="Selecione seu Gestor"
      >
        <p className="text-gray-600 mb-4">
          Para continuar, você precisa selecionar qual gestor será seu responsável.
        </p>
        <select
          className="input mb-4"
          value={selectedGestor}
          onChange={(e) => setSelectedGestor(e.target.value)}
        >
          <option value="">Escolha um gestor...</option>
          {getGestores().map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <button
          onClick={handleConfirmGestor}
          disabled={!selectedGestor}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar
        </button>
      </Modal>
    </div>
  );
}
