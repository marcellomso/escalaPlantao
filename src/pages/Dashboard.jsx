import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Calendar, TrendingUp, ClipboardList, CheckCircle, List, CalendarDays } from 'lucide-react';
import PlantaoCard from '../components/PlantaoCard';
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função auxiliar para agrupar plantões por semana e por dia
const groupByWeekAndDay = (plantoes) => {
  const grouped = {};
  
  plantoes.forEach(plantao => {
    const date = parseISO(plantao.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Semana começa na segunda-feira
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    
    const weekKey = `${format(weekStart, 'yyyy-MM-dd')} - ${format(weekEnd, 'yyyy-MM-dd')}`;
    const weekLabel = `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`;
    
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayLabel = format(date, 'EEEE', { locale: ptBR }); // Nome completo do dia
    
    if (!grouped[weekKey]) {
      grouped[weekKey] = { 
        label: weekLabel, 
        days: {} 
      };
    }
    
    if (!grouped[weekKey].days[dayKey]) {
      grouped[weekKey].days[dayKey] = {
        label: dayLabel,
        date: date,
        plantoes: []
      };
    }
    
    grouped[weekKey].days[dayKey].plantoes.push(plantao);
  });
  
  // Ordenar semanas por data e dias dentro da semana
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekKey, weekData]) => ({
      week: weekKey,
      label: weekData.label,
      days: Object.values(weekData.days).sort((a, b) => a.date - b.date)
    }));
};

export default function Dashboard() {
  const { user } = useAuth();
  const { getPlantoes, getPlantoesByGestor, getPlantoesByCorretor } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('all'); // 'all' ou 'week'

  const isDiretor = user?.role === 'diretor';
  const isGestor = user?.role === 'gestor';

  const plantoes = isDiretor 
    ? getPlantoes() 
    : isGestor 
      ? getPlantoesByGestor(user.id)
      : getPlantoesByCorretor(user.id);

  // Agrupa por status baseado no novo fluxo
  const aguardando = plantoes.filter(p => 
    p.status === 'aguardando_gestor' || 
    p.status === 'aguardando_corretor' || 
    p.status === 'aguardando_confirmacao'
  );
  const confirmados = plantoes.filter(p => p.status === 'confirmado');

  // Agrupar por semana se estiver na visão semanal
  const aguardandoByWeek = viewMode === 'week' ? groupByWeekAndDay(aguardando) : [];
  const confirmadosByWeek = viewMode === 'week' ? groupByWeekAndDay(confirmados) : [];

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
    { id: 'pendentes', label: `Aguardando (${aguardando.length})`, icon: Calendar },
    { id: 'confirmados', label: `Confirmados (${confirmados.length})`, icon: CheckCircle },
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

      {/* Controles de Visualização - só mostrar se não for dashboard */}
      {activeTab !== 'dashboard' && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <List size={18} />
            Todos os Plantões
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <CalendarDays size={18} />
            Por Semana
          </button>
        </div>
      )}

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
          {aguardando.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum plantão aguardando</p>
            </div>
          ) : viewMode === 'all' ? (
            aguardando.map((plantao) => (
              <PlantaoCard
                key={plantao.id}
                plantao={plantao}
                showActions={false}
              />
            ))
          ) : (
            aguardandoByWeek.map((weekGroup) => (
              <div key={weekGroup.week} className="col-span-full mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <CalendarDays size={20} className="text-blue-500" />
                  Semana: {weekGroup.label}
                </h3>
                {weekGroup.days.map((dayGroup) => (
                  <div key={dayGroup.date} className="mb-4">
                    <h4 className="text-md font-medium text-gray-600 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                      {dayGroup.label}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-6">
                      {dayGroup.plantoes.map((plantao) => (
                        <PlantaoCard
                          key={plantao.id}
                          plantao={plantao}
                          showActions={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'confirmados' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {confirmados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum plantão confirmado</p>
            </div>
          ) : viewMode === 'all' ? (
            confirmados.map((plantao) => (
              <PlantaoCard
                key={plantao.id}
                plantao={plantao}
                showActions={false}
              />
            ))
          ) : (
            confirmadosByWeek.map((weekGroup) => (
              <div key={weekGroup.week} className="col-span-full mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <CalendarDays size={20} className="text-emerald-500" />
                  Semana: {weekGroup.label}
                </h3>
                {weekGroup.days.map((dayGroup) => (
                  <div key={dayGroup.date} className="mb-4">
                    <h4 className="text-md font-medium text-gray-600 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
                      {dayGroup.label}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-6">
                      {dayGroup.plantoes.map((plantao) => (
                        <PlantaoCard
                          key={plantao.id}
                          plantao={plantao}
                          showActions={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
