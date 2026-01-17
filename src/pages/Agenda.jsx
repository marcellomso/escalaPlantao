import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PlantaoCard from '../components/PlantaoCard';

export default function Agenda() {
  const { user } = useAuth();
  const { getPlantoes, getPlantoesByGestor, getPlantoesByCorretor } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

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

  // Filtrar plantões da semana
  const plantoesThisWeek = allPlantoes.filter(plantao => {
    try {
      const plantaoDate = parseISO(plantao.date);
      return isWithinInterval(plantaoDate, { start: weekStart, end: weekEnd });
    } catch {
      return false;
    }
  });

  const formatWeekRange = () => {
    const start = format(weekStart, "d 'de' MMMM", { locale: ptBR });
    const end = format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    return `${start} - ${end}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agenda Semanal</h1>
        <p className="text-gray-600">Seus plantões da semana</p>
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
          {plantoesThisWeek.length} plantões
        </span>
      </div>

      {/* Plantões */}
      {plantoesThisWeek.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum plantão na agenda
          </h2>
          <p className="text-gray-500">
            Quando seu gestor atribuir plantões para você, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantoesThisWeek.map((plantao) => (
            <PlantaoCard
              key={plantao.id}
              plantao={plantao}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
