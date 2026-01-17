import { useState } from 'react';
import { Search, Users, Mail, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Modal from '../components/Modal';

const initialFormData = {
  name: '',
  email: '',
  password: '123456',
  role: 'corretor',
  gestorId: ''
};

export default function Equipe() {
  const { user } = useAuth();
  const { getUsers, getGestores, getCorretoresByGestor, addUser, updateUser, deleteUser } = useData();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const isDiretor = user?.role === 'diretor';
  const isGestor = user?.role === 'gestor';

  // Definir qual equipe mostrar
  let teamMembers = [];
  if (isDiretor) {
    teamMembers = getUsers().filter(u => u.role !== 'diretor');
  } else if (isGestor) {
    teamMembers = getCorretoresByGestor(user.id);
  } else {
    // Corretor vê sua equipe (outros corretores do mesmo gestor)
    const myGestor = user?.gestorId;
    if (myGestor) {
      teamMembers = getCorretoresByGestor(myGestor);
    }
  }

  // Filtrar por busca
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingUser(member);
      setFormData(member);
    } else {
      setEditingUser(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser(formData);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(id);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      gestor: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Gestor' },
      corretor: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Corretor' }
    };
    return badges[role] || badges.corretor;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-gray-600">Veja todos os membros da equipe</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {isDiretor && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Novo Membro
            </button>
          )}
        </div>
      </div>

      {/* Team Count */}
      <div className="flex items-center gap-2 mb-4 text-gray-600">
        <Users size={20} />
        <span className="font-medium">Minha Equipe ({filteredMembers.length})</span>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const badge = getRoleBadge(member.role);
          return (
            <div key={member.id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{member.name}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text} mt-1`}>
                    {badge.label}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span className="truncate">{member.email}</span>
              </div>

              {isDiretor && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenModal(member)}
                    className="btn-outline flex items-center gap-2 flex-1 justify-center text-sm"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="btn-danger flex items-center gap-2 flex-1 justify-center text-sm"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Nenhum membro encontrado</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUser ? 'Editar Membro' : 'Novo Membro'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome Completo</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do membro"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••"
              required
            />
          </div>

          <div>
            <label className="label">Cargo</label>
            <select
              className="input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="corretor">Corretor</option>
              <option value="gestor">Gestor</option>
            </select>
          </div>

          {formData.role === 'corretor' && (
            <div>
              <label className="label">Gestor Responsável</label>
              <select
                className="input"
                value={formData.gestorId}
                onChange={(e) => setFormData({ ...formData, gestorId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {getGestores().map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-outline flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingUser ? 'Salvar' : 'Criar Membro'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
