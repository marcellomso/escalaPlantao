import { ChevronDown, CheckCircle } from 'lucide-react';

export default function GestorSelector({ 
  value, 
  onChange, 
  gestores = [],
  disabled = false,
  showLinkedBadge = false,
  linkedGestorName = null,
  size = 'md' // 'sm', 'md'
}) {
  const hasGestor = !!value && gestores.some(g => g.id === value);

  if (showLinkedBadge && hasGestor && linkedGestorName) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
        <CheckCircle size={16} />
        <span className={`font-medium ${size === 'sm' ? 'text-sm' : ''}`}>
          Vinculado: {linkedGestorName}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        className={`
          w-full appearance-none px-3 pr-10 rounded-lg border cursor-pointer font-medium
          ${size === 'sm' ? 'py-1.5 text-sm' : 'py-2'}
          ${!value 
            ? 'border-amber-300 bg-white text-gray-700' 
            : 'border-gray-200 bg-gray-50 text-gray-700'
          }
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <option value="">Selecione um gestor...</option>
        {gestores.map((gestor) => (
          <option key={gestor.id} value={gestor.id}>
            {gestor.name}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}
