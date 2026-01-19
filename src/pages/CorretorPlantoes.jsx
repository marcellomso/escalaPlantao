import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PlantaoCard from '../components/PlantaoCard';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { Navigate } from 'react-router-dom';

/**
 * CorretorPlantoes - Página para o Corretor visualizar e confirmar seus plantões
 * 
 * Funcionalidades:
 * - Visualizar plantões atribuídos pelo gestor
 * - Confirmar presença nos plantões
 */
export default function CorretorPlantoes() {
  const { user } = useAuth();
  const { getPlantoesByCorretor, updatePlantao } = useData();

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
        </div>
      )}

      {/* Plantões confirmados */}
      {confirmados.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            Plantões Confirmados
          </h2>
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
