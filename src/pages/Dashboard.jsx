import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Calendar, TrendingUp, ClipboardList, CheckCircle } from 'lucide-react';
import PlantaoCard from '../components/PlantaoCard';

export default function Dashboard() {
  const { user } = useAuth();
  const { getPlantoes, getPlantoesByGestor, getPlantoesByCorretor } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');

  const isDiretor = user?.role === 'diretor';
  const isGestor = user?.role === 'gestor';

  const plantoes = isDiretor 
    ? getPlantoes() 
    : isGestor 
      ? getPlantoesByGestor(user.id)
      : getPlantoesByCorretor(user.id);

  const pendentes = plantoes.filter(p => p.status === 'pendente');
  const confirmados = plantoes.filter(p => p.status === 'confirmado');

  const currentYear = new Date().getFullYear();
  const plantoesThisYear = plantoes.filter(p => {
    const year = new Date(p.date).getFullYear();
    return year === currentYear;
  });

  const stats = [
    {
      label: 'Total de Plantões Confirmados',
      value: confirmados.length,
      icon: Calendar,
      color: 'bg-primary-600'
    },
    {
      label: 'Média por Semana (último ano)',
      value: (plantoesThisYear.length / 52).toFixed(1),
      icon: TrendingUp,
      color: 'bg-amber-500'
    },
    {
      label: `Plantões em ${currentYear}`,
      value: plantoesThisYear.length,
      icon: ClipboardList,
      color: 'bg-emerald-500'
    }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'pendentes', label: `Pendentes (${pendentes.length})`, icon: Calendar },
    { id: 'atribuidos', label: `Atribuídos (${confirmados.length})`, icon: CheckCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isDiretor ? 'Painel do Diretor' : isGestor ? 'Painel do Gestor' : 'Meu Painel'}
        </h1>
        <p className="text-gray-600">Bem-vindo, {user?.name}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-xl p-6 text-white`}>
              <stat.icon size={32} className="mb-4 opacity-80" />
              <p className="text-4xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-80 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'pendentes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendentes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum plantão pendente</p>
            </div>
          ) : (
            pendentes.map((plantao) => (
              <PlantaoCard
                key={plantao.id}
                plantao={plantao}
                showActions={false}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'atribuidos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {confirmados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum plantão atribuído</p>
            </div>
          ) : (
            confirmados.map((plantao) => (
              <PlantaoCard
                key={plantao.id}
                plantao={plantao}
                showActions={false}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
