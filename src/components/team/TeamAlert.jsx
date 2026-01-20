import { AlertCircle, Link2Off, Clock, ArrowRight } from 'lucide-react';

const ALERT_TYPES = {
  pendingRoles: {
    icon: Clock,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-600',
  },
  unlinkedCorretores: {
    icon: Link2Off,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    textColor: 'text-red-600',
  },
  noGestores: {
    icon: AlertCircle,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-600',
  },
  info: {
    icon: AlertCircle,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    titleColor: 'text-gray-800',
    textColor: 'text-gray-600',
  },
};

export default function TeamAlert({ 
  type = 'info',
  title, 
  description,
  actionLabel,
  onAction,
  count
}) {
  const config = ALERT_TYPES[type] || ALERT_TYPES.info;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={config.iconColor} />
      </div>
      
      <div className="flex-1">
        <p className={`font-medium ${config.titleColor}`}>
          {count !== undefined && (
            <span className="font-bold">{count} </span>
          )}
          {title}
        </p>
        {description && (
          <p className={`text-sm ${config.textColor}`}>
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`flex items-center gap-1 px-3 py-1.5 ${config.iconBg} ${config.titleColor} rounded-lg text-sm font-medium hover:opacity-80 transition-opacity`}
        >
          {actionLabel}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

export { ALERT_TYPES };
