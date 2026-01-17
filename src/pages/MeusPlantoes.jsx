import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PlantaoCard from '../components/PlantaoCard';
import { Calendar } from 'lucide-react';

export default function MeusPlantoes() {
  const { user } = useAuth();
  const { getPlantoesByGestor, getPlantoesByCorretor, getPlantoes } = useData();

  let plantoes = [];
  let title = 'Meus Plantões';
  let subtitle = '';

  if (user?.role === 'diretor') {
    plantoes = getPlantoes();
    title = 'Todos os Plantões';
    subtitle = 'Visualize todos os plantões do sistema';
  } else if (user?.role === 'gestor') {
    plantoes = getPlantoesByGestor(user.id);
    subtitle = 'Plantões sob sua responsabilidade';
  } else if (user?.role === 'corretor') {
    plantoes = getPlantoesByCorretor(user.id);
    subtitle = `Olá, ${user.name}`;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Plantões Grid */}
      {plantoes.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantoes.map((plantao) => (
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
