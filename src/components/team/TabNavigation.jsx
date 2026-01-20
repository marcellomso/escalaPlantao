export default function TabNavigation({ 
  tabs, 
  activeTab, 
  onChange 
}) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all
              ${isActive 
                ? 'bg-white text-primary-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            {Icon && <Icon size={18} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`
                px-1.5 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center
                ${isActive 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-amber-100 text-amber-700'
                }
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
