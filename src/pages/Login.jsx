import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardList, Shield, Briefcase, Building2, Headphones, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { usersApi } from '../services/api';
import Modal from '../components/Modal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGestorModal, setShowGestorModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [selectedGestor, setSelectedGestor] = useState('');
  
  const { login } = useAuth();
  const { getGestores, updateUser, refreshData } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Busca usuário diretamente da API para garantir dados atualizados
      const user = await usersApi.login(email, password);

      // Se usuário está pendente, redirecionar para página de aguardo
      if (user.role === 'pendente') {
        login(user);
        navigate('/aguardando-aprovacao');
        return;
      }

      // Se for corretor sem gestor, pedir para selecionar
      if (user.role === 'corretor' && !user.gestorId) {
        setPendingUser(user);
        setShowGestorModal(true);
        // Recarrega dados para ter lista de gestores atualizada
        await refreshData();
        return;
      }

      login(user);
      // Recarrega dados após login
      await refreshData();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
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
      description: 'Gerencia cargos e atribui gestores',
      color: 'bg-primary-800'
    },
    {
      icon: Briefcase,
      title: 'Gestor',
      description: 'Distribui plantões aos corretores',
      color: 'bg-amber-600'
    },
    {
      icon: Building2,
      title: 'Corretor',
      description: 'Confirma presença nos plantões',
      color: 'bg-emerald-600'
    },
    {
      icon: Headphones,
      title: 'Recepcionista',
      description: 'Cadastra e gerencia plantões',
      color: 'bg-blue-600'
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {roles.map((role) => (
            <div key={role.title} className="flex flex-col items-center text-center bg-white/5 rounded-lg p-3">
              <div className={`w-10 h-10 ${role.color} rounded-xl flex items-center justify-center mb-2`}>
                <role.icon className="text-white" size={20} />
              </div>
              <h3 className="font-medium text-white text-xs">{role.title}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{role.description}</p>
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
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : (
                <>
                  Entrar no Sistema
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-white/10">
            <Link
              to="/register"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Criar nova conta
            </Link>
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
