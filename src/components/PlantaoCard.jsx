import { Calendar, Clock, MapPin, User, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../contexts/DataContext';

export default function PlantaoCard({ plantao, onEdit, onDelete, showActions = true, showGestorSelector = false, onChangeGestor }) {
  const { getUserById, getGestores } = useData();
  const gestor = getUserById(plantao.gestorId);
  
  const hasGestor = !!plantao.gestorId;

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), "EEEE, d 'de' MMMM", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{plantao.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          hasGestor 
            ? 'bg-amber-100 text-amber-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {hasGestor ? 'Com Gestor' : 'Sem Gestor'}
        </span>
      </div>

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
        {gestor && (
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <span>Gestor: {gestor.name}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit?.(plantao)}
            className="btn-outline flex items-center gap-2 flex-1 justify-center"
          >
            <Pencil size={16} />
            Editar
          </button>
          <button
            onClick={() => onDelete?.(plantao.id)}
            className="btn-danger flex items-center gap-2 flex-1 justify-center"
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
      )}

      {showGestorSelector && (
        <div className="mt-4 space-y-2">
          {gestor && (
            <div className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
              Gestor: {gestor.name}
            </div>
          )}
          <select
            className="input text-sm"
            value=""
            onChange={(e) => onChangeGestor?.(plantao.id, e.target.value)}
          >
            <option value="">Alterar gestor...</option>
            {getGestores().map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
