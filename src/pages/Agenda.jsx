import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export default function Agenda() {
  const { user } = useAuth();
  const { getPlantoes, getPlantoesByGestor, getPlantoesByCorretor } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Gerar array com todos os dias da semana
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Buscar plantões baseado no role
  let allPlantoes = [];
  if (user?.role === 'diretor') {
    allPlantoes = getPlantoes();
  } else if (user?.role === 'gestor') {
    allPlantoes = getPlantoesByGestor(user.id);
  } else if (user?.role === 'corretor') {
    allPlantoes = getPlantoesByCorretor(user.id);
  }

  // Função para obter plantões de um dia específico
  const getPlantoesForDay = (day) => {
    return allPlantoes.filter(plantao => {
      try {
        const plantaoDate = parseISO(plantao.date);
        return isSameDay(plantaoDate, day);
      } catch {
        return false;
      }
    });
  };

  /**
   * Retorna as classes de estilo baseado no status do plantão
   * - Confirmado: Verde
   * - Aguardando confirmação: Amarelo/Laranja  
   * - Aguardando corretor/gestor: Cinza
   */
  const getPlantaoStyle = (plantao) => {
    const isConfirmado = plantao.confirmedByCorretor || plantao.status === 'confirmado';
    const hasCorretor = !!plantao.corretorId;

    if (isConfirmado) {
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        hover: 'hover:bg-emerald-100',
        title: 'text-emerald-900',
        text: 'text-emerald-700',
        textLight: 'text-emerald-600'
      };
    } else if (hasCorretor) {
      // Tem corretor mas não confirmou
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        hover: 'hover:bg-amber-100',
        title: 'text-amber-900',
        text: 'text-amber-700',
        textLight: 'text-amber-600'
      };
    } else {
      // Sem corretor ainda
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-100',
        title: 'text-gray-900',
        text: 'text-gray-700',
        textLight: 'text-gray-600'
      };
    }
  };

  // Contar total de plantões da semana
  const totalPlantoesWeek = weekDays.reduce((total, day) => {
    return total + getPlantoesForDay(day).length;
  }, 0);

  const formatWeekRange = () => {
    const start = format(weekStart, "d 'de' MMMM", { locale: ptBR });
    const end = format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    return `${start} - ${end}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agenda Semanal</h1>
        <p className="text-gray-600">
          {user?.role === 'corretor' 
            ? 'Seus plantões da semana' 
            : 'Visão semanal dos plantões'}
        </p>
      </div>

      {/* Legenda de cores */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <span className="text-gray-500 font-medium">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300"></div>
          <span className="text-gray-600">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-200 border border-amber-300"></div>
          <span className="text-gray-600">Aguardando Confirmação</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300"></div>
          <span className="text-gray-600">Aguardando Corretor</span>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={20} />
          <span className="font-medium">{formatWeekRange()}</span>
        </div>

        <span className="text-sm text-gray-500">
          {totalPlantoesWeek} plantões
        </span>
      </div>

      {/* Visão Semanal */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayPlantoes = getPlantoesForDay(day);
          const isDayToday = isToday(day);
          
          return (
            <div 
              key={day.toISOString()} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden min-h-[200px] flex flex-col ${
                isDayToday ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Cabeçalho do dia */}
              <div className={`p-3 text-center border-b ${
                isDayToday 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-50 text-gray-700'
              }`}>
                <div className="text-xs font-medium uppercase">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className="text-xl font-bold">
                  {format(day, 'd')}
                </div>
              </div>
              
              {/* Plantões do dia */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {dayPlantoes.length === 0 ? (
                  <div className="text-center text-gray-400 text-xs py-4">
                    Sem plantões
                  </div>
                ) : (
                  dayPlantoes.map((plantao) => {
                    const style = getPlantaoStyle(plantao);
                    const isConfirmado = plantao.confirmedByCorretor || plantao.status === 'confirmado';
                    
                    return (
                      <div 
                        key={plantao.id}
                        className={`p-2 rounded-lg border transition-colors ${style.bg} ${style.border} ${style.hover}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className={`text-xs font-semibold truncate ${style.title}`}>
                            {plantao.title}
                          </h4>
                          {isConfirmado && (
                            <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className={`flex items-center gap-1 text-xs mt-1 ${style.text}`}>
                          <Clock size={10} />
                          <span>{plantao.startTime} - {plantao.endTime}</span>
                        </div>
                        {plantao.location && (
                          <div className={`flex items-center gap-1 text-xs mt-1 ${style.textLight}`}>
                            <MapPin size={10} />
                            <span className="truncate">{plantao.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensagem quando não há plantões na semana */}
      {totalPlantoesWeek === 0 && (
        <div className="text-center py-8 mt-6 bg-white rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum plantão nesta semana
          </h2>
          <p className="text-gray-500">
            {user?.role === 'corretor'
              ? 'Quando seu gestor atribuir plantões para você, eles aparecerão aqui.'
              : 'Não há plantões agendados para esta semana.'}
          </p>
        </div>
      )}
    </div>
  );
}
