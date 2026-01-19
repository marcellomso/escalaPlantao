import { useState } from 'react';
import { Search, Users, Mail, Plus, Pencil, Trash2, Crown, Star, AlertCircle } from 'lucide-react';
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
  const { getUsers, getGestores, getCorretoresByGestor, getUserById, addUser, updateUser, deleteUser } = useData();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const isDiretor = user?.role === 'diretor';
  const isGestor = user?.role === 'gestor';
  const isCorretor = user?.role === 'corretor';

  // Buscar dados atualizados do usuário logado do DataContext (fonte de verdade)
  const currentUserData = getUserById(user?.id);

  // Definir qual equipe mostrar
  let teamMembers = [];
  let myGestorData = null;
  let diretorData = null;
  let gestoresWithCorretores = []; // Para a visão do diretor
  let corretoresSemGestor = []; // Corretores sem gestor associado
  
  if (isDiretor) {
    // Diretor vê gestores com seus respectivos corretores agrupados
    const gestores = getGestores();
    const allCorretores = getUsers().filter(u => u.role === 'corretor');
    
    gestoresWithCorretores = gestores.map(gestor => ({
      ...gestor,
      corretores: getCorretoresByGestor(gestor.id)
    }));
    
    // Corretores que não têm gestor ou cujo gestor não existe mais
    const gestorIds = gestores.map(g => g.id);
    corretoresSemGestor = allCorretores.filter(c => !c.gestorId || !gestorIds.includes(c.gestorId));
    
    // teamMembers não é usado na visão do diretor organizada
    teamMembers = [];
  } else if (isGestor) {
    // Gestor vê o diretor acima e seus corretores abaixo
    diretorData = getUsers().find(u => u.role === 'diretor');
    teamMembers = getCorretoresByGestor(user.id);
  } else if (isCorretor) {
    // Corretor vê apenas os corretores da sua própria equipe (mesmo gestor)
    // Usa currentUserData do DataContext para ter o gestorId atualizado
    const myGestorId = currentUserData?.gestorId;
    if (myGestorId) {
      myGestorData = getUserById(myGestorId);
      // Pega todos os corretores do mesmo gestor, excluindo a si mesmo
      teamMembers = getCorretoresByGestor(myGestorId).filter(c => c.id !== user.id);
    }
  }

  // Calcular total de membros para o diretor
  const totalMembersDiretor = gestoresWithCorretores.reduce((acc, gestor) => {
    return acc + 1 + gestor.corretores.length; // 1 gestor + seus corretores
  }, 0) + corretoresSemGestor.length;

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
        <span className="font-medium">
          {isDiretor 
            ? `Toda a Equipe (${gestoresWithCorretores.length} gestores, ${totalMembersDiretor - gestoresWithCorretores.length} corretores)`
            : `Minha Equipe (${filteredMembers.length}${isCorretor && myGestorData ? ' + 1 gestor' : ''}${isGestor && diretorData ? ' + 1 diretor' : ''})`
          }
        </span>
      </div>

      {/* Visão do Diretor - Gestores com seus corretores */}
      {isDiretor && (
        <div className="space-y-6">
          {gestoresWithCorretores.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum gestor cadastrado</p>
            </div>
          ) : (
            gestoresWithCorretores.map((gestor) => (
              <div key={gestor.id} className="space-y-3">
                {/* Card do Gestor */}
                <div className="flex items-center gap-2">
                  <Crown size={16} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Equipe {gestor.name.split(' ')[0]}
                  </h3>
                </div>
                
                <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
                      {gestor.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base truncate">{gestor.name}</h3>
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 mt-1">
                        Gestor
                      </span>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Mail size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{gestor.email}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(gestor)}
                        className="p-1.5 sm:p-2 hover:bg-amber-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} className="text-amber-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(gestor.id)}
                        className="p-1.5 sm:p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Corretores do Gestor */}
                {gestor.corretores.length > 0 ? (
                  <div className="ml-6 pl-4 border-l-2 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {gestor.corretores.map((corretor) => (
                        <div key={corretor.id} className="card bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
                              {corretor.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm truncate">{corretor.name}</h4>
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 mt-1">
                                Corretor
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleOpenModal(corretor)}
                                className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil size={14} className="text-emerald-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(corretor.id)}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                            <Mail size={12} className="text-gray-400" />
                            <span className="truncate">{corretor.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ml-6 pl-4 border-l-2 border-gray-200">
                    <p className="text-sm text-gray-400 italic py-2">Nenhum corretor nesta equipe</p>
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Corretores sem gestor */}
          {corretoresSemGestor.length > 0 && (
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Corretores sem Gestor ({corretoresSemGestor.length})
                </h3>
              </div>
              
              <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-3 text-sm text-red-600">
                  <AlertCircle size={14} />
                  <span>Estes corretores precisam ser atribuídos a um gestor</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {corretoresSemGestor.map((corretor) => (
                    <div key={corretor.id} className="bg-white rounded-lg p-3 border border-red-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-medium">
                          {corretor.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{corretor.name}</h4>
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mt-1">
                            Sem equipe
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleOpenModal(corretor)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar (atribuir gestor)"
                          >
                            <Pencil size={14} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(corretor.id)}
                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                        <Mail size={12} className="text-gray-400" />
                        <span className="truncate">{corretor.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card do Diretor (apenas para gestores) */}
      {isGestor && diretorData && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Star size={16} className="text-purple-500" />
            Diretor
          </h3>
          <div className="card bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
                {diretorData.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base truncate">{diretorData.name}</h3>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mt-1">
                  Diretor
                </span>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{diretorData.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card do Gestor (apenas para corretores) */}
      {isCorretor && myGestorData && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Crown size={16} className="text-amber-500" />
            Meu Gestor
          </h3>
          <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
                {myGestorData.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base truncate">{myGestorData.name}</h3>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 mt-1">
                  Gestor
                </span>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{myGestorData.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Título Corretores (apenas para corretores) */}
      {isCorretor && (
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Users size={16} className="text-emerald-500" />
          Colegas de Equipe
        </h3>
      )}

      {/* Título Meus Corretores (apenas para gestores) */}
      {isGestor && (
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Users size={16} className="text-emerald-500" />
          Meus Corretores
        </h3>
      )}

      {/* Team Grid (apenas para gestor e corretor) */}
      {!isDiretor && (
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
              </div>
            );
          })}
        </div>
      )}

      {!isDiretor && filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {isCorretor 
              ? 'Você é o único corretor na sua equipe' 
              : isGestor
              ? 'Você ainda não tem corretores na sua equipe'
              : 'Nenhum membro encontrado'}
          </p>
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
