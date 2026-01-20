import { Mail, Pencil, Trash2, Link2, Link2Off, Shield } from 'lucide-react';

const ROLE_COLORS = {
  diretor: 'bg-purple-500',
  gestor: 'bg-amber-500',
  corretor: 'bg-emerald-500',
  recepcionista: 'bg-blue-500',
  pendente: 'bg-gray-400'
};

const ROLE_BADGES = {
  diretor: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Diretor' },
  gestor: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Gestor' },
  corretor: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Corretor' },
  recepcionista: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Recepcionista' },
  pendente: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pendente' }
};

export default function MemberCard({ 
  member, 
  isCurrentUser = false,
  showRoleBadge = true,
  showGestorInfo = false,
  gestorName = null,
  variant = 'default', // 'default', 'gestor', 'corretor', 'pending', 'unlinked'
  actions = [], // ['edit', 'delete', 'link', 'unlink']
  onEdit,
  onDelete,
  onLink,
  onUnlink,
  children // Para conteúdo extra (dropdowns, etc)
}) {
  const avatarColor = ROLE_COLORS[member.role] || ROLE_COLORS.pendente;
  const badge = ROLE_BADGES[member.role] || ROLE_BADGES.pendente;

  const getCardStyle = () => {
    switch (variant) {
      case 'gestor':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200';
      case 'corretor':
        return 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200';
      case 'pending':
        return 'border-2 border-amber-300 bg-amber-50/50';
      case 'unlinked':
        return 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200';
      case 'diretor':
        return 'bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200';
      default:
        return '';
    }
  };

  const renderActions = () => {
    if (actions.length === 0) return null;

    return (
      <div className="flex gap-1">
        {actions.includes('edit') && onEdit && (
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil size={14} className="text-gray-600" />
          </button>
        )}
        {actions.includes('link') && onLink && (
          <button
            onClick={() => onLink(member)}
            className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
            title="Vincular"
          >
            <Link2 size={14} className="text-emerald-600" />
          </button>
        )}
        {actions.includes('unlink') && onUnlink && (
          <button
            onClick={() => onUnlink(member)}
            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
            title="Desvincular"
          >
            <Link2Off size={14} className="text-red-600" />
          </button>
        )}
        {actions.includes('delete') && onDelete && (
          <button
            onClick={() => onDelete(member)}
            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 size={14} className="text-red-600" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`card ${getCardStyle()}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0`}>
          {member.name.charAt(0)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-base truncate">{member.name}</h3>
            {isCurrentUser && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                Você
              </span>
            )}
          </div>
          
          {showRoleBadge && (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text} mt-1`}>
              {badge.label}
            </span>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <Mail size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>

          {showGestorInfo && gestorName && (
            <div className="flex items-center gap-2 mt-1 text-xs text-emerald-600">
              <Link2 size={12} />
              <span>Vinculado: {gestorName}</span>
            </div>
          )}
        </div>

        {renderActions()}
      </div>

      {/* Conteúdo extra (dropdowns, selects, etc) */}
      {children && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
}

export { ROLE_COLORS, ROLE_BADGES };
