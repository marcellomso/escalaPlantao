import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PlantaoCard from '../components/PlantaoCard';
import { Calendar, Users } from 'lucide-react';
import { Navigate } from 'react-router-dom';

/**
 * GestorPlantoes - Página para o Gestor gerenciar seus plantões
 * 
 * Funcionalidades:
 * - Visualizar plantões atribuídos pelo diretor
 * - Atribuir corretor aos plantões pendentes
 */
export default function GestorPlantoes() {
  const { user } = useAuth();
  const { getPlantoesByGestor, updatePlantao } = useData();

  // Apenas gestor pode acessar esta página
  if (user?.role !== 'gestor') {
    return <Navigate to="/" replace />;
  }

  const plantoes = getPlantoesByGestor(user.id);
  
  // Separa plantões por status para melhor visualização
  // Trata plantões legados (sem status ou sem corretorId) como "aguardando_corretor"
  const aguardandoCorretor = plantoes.filter(p => 
    !p.status || 
    p.status === 'aguardando_corretor' || 
    (!p.corretorId && p.status !== 'confirmado')
  );
  const aguardandoConfirmacao = plantoes.filter(p => 
    p.status === 'aguardando_confirmacao' && p.corretorId
  );
  const confirmados = plantoes.filter(p => p.status === 'confirmado');

  // Atribui ou remove um corretor do plantão
  const handleChangeCorretor = async (plantaoId, corretorId) => {
    try {
      const updates = { corretorId };
      
      // Se removendo corretor, ajustar status
      if (!corretorId) {
        updates.status = 'aguardando_corretor';
        updates.confirmedByCorretor = false;
      }
      
      await updatePlantao(plantaoId, updates);
    } catch (error) {
      console.error('Erro ao alterar corretor:', error);
      alert('Erro ao alterar corretor. Tente novamente.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Painel do Gestor</h1>
        <p className="text-gray-600">Gerencie seus plantões e atribua corretores</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <Calendar className="text-amber-500 flex-shrink-0" size={24} />
            <div className="min-w-0">
              <p className="text-2xl font-bold text-amber-700">{aguardandoCorretor.length}</p>
              <p className="text-sm text-amber-600 truncate">Aguardando Corretor</p>
            </div>
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Users className="text-blue-500 flex-shrink-0" size={24} />
            <div className="min-w-0">
              <p className="text-2xl font-bold text-blue-700">{aguardandoConfirmacao.length}</p>
              <p className="text-sm text-blue-600 truncate">Aguardando Confirmação</p>
            </div>
          </div>
        </div>
        <div className="card bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <Calendar className="text-emerald-500 flex-shrink-0" size={24} />
            <div className="min-w-0">
              <p className="text-2xl font-bold text-emerald-700">{confirmados.length}</p>
              <p className="text-sm text-emerald-600 truncate">Confirmados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plantões aguardando corretor */}
      {aguardandoCorretor.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            Aguardando Atribuição de Corretor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aguardandoCorretor.map((plantao) => (
              <PlantaoCard
                key={plantao.id}
                plantao={plantao}
                showActions={false}
                showCorretorSelector={true}
                onChangeCorretor={handleChangeCorretor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Plantões aguardando confirmação do corretor */}
      {aguardandoConfirmacao.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Aguardando Confirmação do Corretor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aguardandoConfirmacao.map((plantao) => (
              <PlantaoCard
                key={plantao.id}
                plantao={plantao}
                showActions={false}
                showCorretorSelector={true}
                onChangeCorretor={handleChangeCorretor}
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
            Confirmados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmados.map((plantao) => (
              <PlantaoCard
                key={plantao.id}
                plantao={plantao}
                showActions={false}
                showCorretorSelector={true}
                onChangeCorretor={handleChangeCorretor}
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
            Quando o diretor atribuir plantões para você, eles aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}
