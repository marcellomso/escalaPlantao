import { ChevronDown, Shield } from 'lucide-react';

const ROLES = [
  { value: 'corretor', label: 'Corretor', icon: '🏢' },
  { value: 'gestor', label: 'Gestor', icon: '👔' },
  { value: 'recepcionista', label: 'Recepcionista', icon: '📋' },
  { value: 'diretor', label: 'Diretor', icon: '👑' },
];

export default function RoleDropdown({ 
  value, 
  onChange, 
  disabled = false,
  isCurrentUser = false,
  showPendingOption = false,
  size = 'md' // 'sm', 'md'
}) {
  if (isCurrentUser) {
    const currentRole = ROLES.find(r => r.value === value) || { label: value, icon: '⏳' };
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-100 text-primary-700 ${size === 'sm' ? 'text-sm' : ''}`}>
        <Shield size={16} />
        <span className="font-medium">{currentRole.icon} {currentRole.label}</span>
        <span className="text-xs opacity-70">(Seu cargo)</span>
      </div>
    );
  }

  const isPending = value === 'pendente';

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full appearance-none px-3 pr-10 rounded-lg border cursor-pointer font-medium
          ${size === 'sm' ? 'py-1.5 text-sm' : 'py-2'}
          ${isPending 
            ? 'border-amber-300 bg-amber-100 text-amber-700' 
            : 'border-gray-200 bg-gray-50 text-gray-700'
          }
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {showPendingOption && value === 'pendente' && (
          <option value="pendente" disabled>⏳ Pendente - Selecione um cargo</option>
        )}
        {ROLES.map((role) => (
          <option key={role.value} value={role.value}>
            {role.icon} {role.label}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export { ROLES };
