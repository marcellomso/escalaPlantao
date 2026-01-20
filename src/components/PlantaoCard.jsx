import { Calendar, Clock, MapPin, User, Pencil, Trash2, UserCheck, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * PlantaoCard - Componente de card para exibir informações do plantão
 * 
 * Props:
 * - plantao: objeto do plantão
 * - onEdit: função para editar (usado pelo diretor)
 * - onDelete: função para deletar (usado pelo diretor)
 * - showActions: mostrar botões de editar/excluir
 * - showGestorSelector: mostrar seletor de gestor (usado pelo diretor)
 * - onChangeGestor: callback ao mudar gestor
 * - showCorretorSelector: mostrar seletor de corretor (usado pelo gestor)
 * - onChangeCorretor: callback ao mudar corretor
 * - showConfirmButton: mostrar botão de confirmar presença (usado pelo corretor)
 * - onConfirm: callback ao confirmar presença
 */
export default function PlantaoCard({ 
  plantao, 
  onEdit, 
  onDelete, 
  showActions = true, 
  showGestorSelector = false, 
  onChangeGestor,
  showCorretorSelector = false,
  onChangeCorretor,
  showConfirmButton = false,
  onConfirm
}) {
  const { getUserById, getGestores, getCorretoresByGestor } = useData();
  const { user } = useAuth();
  
  const gestor = getUserById(plantao.gestorId);
  const corretor = getUserById(plantao.corretorId);

  // Mapeamento de status para exibição
  const statusConfig = {
    'aguardando_gestor': { label: 'Aguardando Gestor', bg: 'bg-gray-100', text: 'text-gray-600' },
    'aguardando_corretor': { label: 'Aguardando Corretor', bg: 'bg-amber-100', text: 'text-amber-700' },
    'aguardando_confirmacao': { label: 'Aguardando Confirmação', bg: 'bg-blue-100', text: 'text-blue-700' },
    'confirmado': { label: 'Confirmado', bg: 'bg-emerald-100', text: 'text-emerald-700' }
  };

  const status = statusConfig[plantao.status] || statusConfig['aguardando_gestor'];

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), "EEEE, d 'de' MMMM", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  // Corretores disponíveis para o gestor atual
  const corretoresDisponiveis = user?.role === 'gestor' 
    ? getCorretoresByGestor(user.id) 
    : [];

  return (
    <div className="card">
      {/* Cabeçalho com título e status */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{plantao.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      {/* Informações do plantão */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span className="capitalize">{formatDate(plantao.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span>{plantao.startTime} - {plantao.endTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <span>{plantao.location}</span>
        </div>
        
        {/* Mostra gestor se existir */}
        {gestor && (
          <div className="flex items-center gap-2">
            <User size={16} className="text-amber-500" />
            <span>Gestor: {gestor.name}</span>
          </div>
        )}
        
        {/* Mostra corretor se existir */}
        {corretor && (
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-500" />
            <span>Corretor: {corretor.name}</span>
            {plantao.confirmedByCorretor && (
              <CheckCircle size={14} className="text-emerald-500" />
            )}
          </div>
        )}
      </div>

      {/* Ações de editar/excluir (Diretor e Recepcionista) */}
      {showActions && (onEdit || onDelete) && (
        <div className="flex gap-2 mt-4">
          {onEdit && (
            <button
              onClick={() => onEdit(plantao)}
              className="btn-outline flex items-center gap-2 flex-1 justify-center"
            >
              <Pencil size={16} />
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(plantao.id)}
              className="btn-danger flex items-center gap-2 flex-1 justify-center"
            >
              <Trash2 size={16} />
              Excluir
            </button>
          )}
        </div>
      )}

      {/* Seletor de Gestor (usado pelo Diretor) */}
      {showGestorSelector && (
        <div className="mt-4 space-y-2">
          <select
            className="input text-sm"
            value={plantao.gestorId || ''}
            onChange={(e) => onChangeGestor?.(plantao.id, e.target.value)}
          >
            <option value="">Selecione um gestor...</option>
            {getGestores().map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Seletor de Corretor (usado pelo Gestor) */}
      {/* Mostra se showCorretorSelector=true E ainda não tem corretor atribuído */}
      {showCorretorSelector && !plantao.corretorId && (
        <div className="mt-4 space-y-2">
          <select
            className="input text-sm"
            value={plantao.corretorId || ''}
            onChange={(e) => onChangeCorretor?.(plantao.id, e.target.value)}
          >
            <option value="">Atribuir corretor...</option>
            {corretoresDisponiveis.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Botão de Confirmar Presença (usado pelo Corretor) */}
      {showConfirmButton && plantao.corretorId && !plantao.confirmedByCorretor && (
        <div className="mt-4">
          <button
            onClick={() => onConfirm?.(plantao.id)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            Confirmar Presença
          </button>
        </div>
      )}

      {/* Mensagem de confirmação */}
      {showConfirmButton && plantao.confirmedByCorretor && (
        <div className="mt-4 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} />
          Presença confirmada
        </div>
      )}
    </div>
  );
}
