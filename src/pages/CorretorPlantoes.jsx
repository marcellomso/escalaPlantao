import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PlantaoCard from '../components/PlantaoCard';
import { Calendar, CheckCircle, Clock, List, CalendarDays } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * CorretorPlantoes - Página para o Corretor visualizar e confirmar seus plantões
 * 
 * Funcionalidades:
 * - Visualizar plantões atribuídos pelo gestor
 * - Confirmar presença nos plantões
 * - Visualizar por semana ou todos os plantões
 */

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

export default function CorretorPlantoes() {
  const { user } = useAuth();
  const { getPlantoesByCorretor, updatePlantao } = useData();
  const [viewMode, setViewMode] = useState('all'); // 'all' ou 'week'

  // Apenas corretor pode acessar esta página
  if (user?.role !== 'corretor') {
    return <Navigate to="/" replace />;
  }

  const plantoes = getPlantoesByCorretor(user.id);
  
  // Separa plantões por status
  // Trata plantões legados: se tem corretorId mas não confirmou, está aguardando confirmação
  const aguardandoConfirmacao = plantoes.filter(p => 
    !p.confirmedByCorretor && p.status !== 'confirmado'
  );
  const confirmados = plantoes.filter(p => 
    p.confirmedByCorretor || p.status === 'confirmado'
  );

  // Agrupar por semana se estiver na visão semanal
  const aguardandoConfirmacaoByWeek = viewMode === 'week' ? groupByWeekAndDay(aguardandoConfirmacao) : [];
  const confirmadosByWeek = viewMode === 'week' ? groupByWeekAndDay(confirmados) : [];

  // Confirma presença no plantão
  const handleConfirm = async (plantaoId) => {
    try {
      await updatePlantao(plantaoId, { confirmedByCorretor: true });
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      alert('Erro ao confirmar presença. Tente novamente.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Plantões</h1>
        <p className="text-gray-600">Visualize e confirme sua presença nos plantões</p>
      </div>

      {/* Controles de Visualização */}
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

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Clock className="text-blue-500" size={24} />
            <div>
              <p className="text-2xl font-bold text-blue-700">{aguardandoConfirmacao.length}</p>
              <p className="text-sm text-blue-600">Aguardando Confirmação</p>
            </div>
          </div>
        </div>
        <div className="card bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-emerald-500" size={24} />
            <div>
              <p className="text-2xl font-bold text-emerald-700">{confirmados.length}</p>
              <p className="text-sm text-emerald-600">Confirmados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plantões aguardando confirmação */}
      {aguardandoConfirmacao.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Confirme sua Presença
          </h2>
          {viewMode === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aguardandoConfirmacao.map((plantao) => (
                <PlantaoCard
                  key={plantao.id}
                  plantao={plantao}
                  showActions={false}
                  showConfirmButton={true}
                  onConfirm={handleConfirm}
                />
              ))}
            </div>
          ) : (
            aguardandoConfirmacaoByWeek.map((weekGroup) => (
              <div key={weekGroup.week} className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <CalendarDays size={16} className="text-blue-500" />
                  Semana: {weekGroup.label}
                </h3>
                {weekGroup.days.map((dayGroup) => (
                  <div key={dayGroup.date} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      {dayGroup.label}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-4">
                      {dayGroup.plantoes.map((plantao) => (
                        <PlantaoCard
                          key={plantao.id}
                          plantao={plantao}
                          showActions={false}
                          showConfirmButton={true}
                          onConfirm={handleConfirm}
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

      {/* Plantões confirmados */}
      {confirmados.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            Plantões Confirmados
          </h2>
          {viewMode === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {confirmados.map((plantao) => (
                <PlantaoCard
                  key={plantao.id}
                  plantao={plantao}
                  showActions={false}
                  showConfirmButton={true}
                />
              ))}
            </div>
          ) : (
            confirmadosByWeek.map((weekGroup) => (
              <div key={weekGroup.week} className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <CalendarDays size={16} className="text-emerald-500" />
                  Semana: {weekGroup.label}
                </h3>
                {weekGroup.days.map((dayGroup) => (
                  <div key={dayGroup.date} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      {dayGroup.label}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-4">
                      {dayGroup.plantoes.map((plantao) => (
                        <PlantaoCard
                          key={plantao.id}
                          plantao={plantao}
                          showActions={false}
                          showConfirmButton={true}
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

      {/* Mensagem quando não há plantões */}
      {plantoes.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum plantão atribuído
          </h2>
          <p className="text-gray-500">
            Quando seu gestor atribuir plantões para você, eles aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}
