import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  Calendar, 
  CalendarDays, 
  Users, 
  LogOut,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = [
      { to: '/', icon: Home, label: 'Início' },
    ];

    // Dashboard para todos exceto recepcionista
    if (user?.role !== 'recepcionista') {
      items.push({ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' });
    }

    // Menu específico por role
    if (user?.role === 'diretor') {
      items.push({ to: '/plantoes', icon: ClipboardList, label: 'Painel' });
    }

    if (user?.role === 'gestor') {
      items.push({ to: '/gestor-plantoes', icon: ClipboardList, label: 'Meus Plantões' });
    }

    if (user?.role === 'corretor') {
      items.push({ to: '/corretor-plantoes', icon: ClipboardList, label: 'Meus Plantões' });
    }

    if (user?.role === 'recepcionista') {
      items.push({ to: '/plantoes', icon: ClipboardList, label: 'Gerenciar Plantões' });
    }

    // Agenda para todos
    items.push({ to: '/agenda', icon: CalendarDays, label: 'Agenda' });

    // Equipe para todos exceto recepcionista e pendente
    if (user?.role !== 'recepcionista' && user?.role !== 'pendente') {
      items.push({ to: '/equipe', icon: Users, label: 'Equipe' });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const getRoleBadge = () => {
    const badges = {
      diretor: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Diretor' },
      gestor: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Gestor' },
      corretor: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Corretor' },
      recepcionista: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Recepcionista' },
      pendente: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pendente' }
    };
    return badges[user?.role] || badges.pendente;
  };

  const badge = getRoleBadge();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-primary-800">Escala</h1>
              <p className="text-xs text-gray-500">Plantões</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm">
                {user?.name || 'Usuário'}
              </p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
