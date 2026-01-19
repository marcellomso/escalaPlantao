import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Calendar, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const { getPlantoes, getGestores, getCorretores, getPlantoesByGestor, getPlantoesByCorretor, getCorretoresByGestor } = useData();

  const stats = [];

  if (user?.role === 'diretor') {
    stats.push(
      { label: 'Total de Plantões', value: getPlantoes().length, icon: ClipboardList, color: 'bg-primary-600' },
      { label: 'Gestores', value: getGestores().length, icon: Users, color: 'bg-amber-500' },
      { label: 'Corretores', value: getCorretores().length, icon: Users, color: 'bg-emerald-500' }
    );
  } else if (user?.role === 'gestor') {
    const meusPlantoes = getPlantoesByGestor(user.id);
    const meusCorretores = getCorretoresByGestor(user.id);
    // Conta plantões aguardando atribuição de corretor
    const aguardandoCorretor = meusPlantoes.filter(p => p.status === 'aguardando_corretor').length;
    stats.push(
      { label: 'Meus Plantões', value: meusPlantoes.length, icon: ClipboardList, color: 'bg-primary-600' },
      { label: 'Minha Equipe', value: meusCorretores.length, icon: Users, color: 'bg-emerald-500' },
      { label: 'Aguardando Corretor', value: aguardandoCorretor, icon: Calendar, color: 'bg-amber-500' }
    );
  } else if (user?.role === 'corretor') {
    const meusPlantoes = getPlantoesByCorretor(user.id);
    // Conta plantões aguardando confirmação
    const aguardandoConfirmacao = meusPlantoes.filter(p => p.status === 'aguardando_confirmacao').length;
    const confirmados = meusPlantoes.filter(p => p.status === 'confirmado').length;
    stats.push(
      { label: 'Meus Plantões', value: meusPlantoes.length, icon: ClipboardList, color: 'bg-primary-600' },
      { label: 'Aguardando Confirmação', value: aguardandoConfirmacao, icon: Calendar, color: 'bg-amber-500' },
      { label: 'Confirmados', value: confirmados, icon: Calendar, color: 'bg-emerald-500' }
    );
  }

  // Links rápidos baseados no role
  const quickLinks = [
    { to: '/dashboard', label: 'Ver Dashboard', icon: TrendingUp },
    { to: '/equipe', label: 'Ver Equipe', icon: Users },
  ];

  if (user?.role === 'diretor') {
    quickLinks.unshift({ to: '/plantoes', label: 'Gerenciar Plantões', icon: ClipboardList });
  } else if (user?.role === 'gestor') {
    quickLinks.unshift({ to: '/gestor-plantoes', label: 'Meus Plantões', icon: Calendar });
  } else if (user?.role === 'corretor') {
    quickLinks.unshift({ to: '/corretor-plantoes', label: 'Meus Plantões', icon: Calendar });
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Bem-vindo ao sistema de escala de plantões
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="text-white" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rápido</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            className="card hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <link.icon className="text-gray-600" size={20} />
            </div>
            <span className="font-medium text-gray-900">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
