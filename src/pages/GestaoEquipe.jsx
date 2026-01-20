import { useState, useMemo } from 'react';
import { Search, Users, Plus, Crown, Star, AlertCircle, Settings, Link2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Navigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { 
  MemberCard, 
  RoleDropdown, 
  GestorSelector, 
  TeamAlert, 
  TabNavigation 
} from '../components/team';

const initialFormData = {
  name: '',
  email: '',
  password: '123456',
  role: 'corretor',
  gestorId: ''
};

export default function GestaoEquipe() {
  const { user } = useAuth();
  const { 
    getUsers, 
    getGestores, 
    getCorretoresByGestor, 
    getUserById, 
    addUser, 
    updateUser, 
    deleteUser 
  } = useData();
  
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('equipe');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const isDiretor = user?.role === 'diretor';
  const isGestor = user?.role === 'gestor';
  const isCorretor = user?.role === 'corretor';

  // Se não tem permissão, redireciona
  if (user?.role === 'recepcionista' || user?.role === 'pendente') {
    return <Navigate to="/" replace />;
  }

  // Dados do usuário atual atualizados
  const currentUserData = getUserById(user?.id);

  // Buscar todos os dados necessários
  const allUsers = getUsers();
  const gestores = getGestores();
  
  // Filtrar por busca
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [allUsers, search]);

  // Contadores para badges
  const pendingCount = allUsers.filter(u => u.role === 'pendente').length;
  const unlinkedCount = allUsers.filter(u => u.role === 'corretor' && !u.gestorId).length;

  // Dados organizados para visão do diretor
  const gestoresWithCorretores = useMemo(() => {
    return gestores.map(gestor => ({
      ...gestor,
      corretores: getCorretoresByGestor(gestor.id)
    }));
  }, [gestores, getCorretoresByGestor]);

  const corretoresSemGestor = useMemo(() => {
    const gestorIds = gestores.map(g => g.id);
    return allUsers.filter(u => 
      u.role === 'corretor' && (!u.gestorId || !gestorIds.includes(u.gestorId))
    );
  }, [allUsers, gestores]);

  // Dados para visão do gestor
  const diretorData = isGestor ? allUsers.find(u => u.role === 'diretor') : null;
  const meusCorretores = isGestor ? getCorretoresByGestor(user.id) : [];

  // Dados para visão do corretor
  const myGestorData = isCorretor && currentUserData?.gestorId 
    ? getUserById(currentUserData.gestorId) 
    : null;
  const colegasDeEquipe = isCorretor && currentUserData?.gestorId
    ? getCorretoresByGestor(currentUserData.gestorId).filter(c => c.id !== user.id)
    : [];

  // Tabs disponíveis
  const tabs = useMemo(() => {
    if (!isDiretor) return [];
    
    return [
      { id: 'equipe', label: 'Equipe', icon: Users },
      { id: 'cargos', label: 'Cargos', icon: Settings, badge: pendingCount },
      { id: 'vinculos', label: 'Vínculos', icon: Link2, badge: unlinkedCount },
    ];
  }, [isDiretor, pendingCount, unlinkedCount]);

  // Handlers
  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingUser(member);
      setFormData({
        ...member,
        password: member.password || '123456'
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await addUser(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar usuário');
    }
  };

  const handleDelete = async (member) => {
    if (confirm(`Tem certeza que deseja excluir ${member.name}?`)) {
      try {
        await deleteUser(member.id);
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir usuário');
      }
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (userId === user.id) {
      alert('Você não pode alterar seu próprio cargo.');
      return;
    }
    
    try {
      await updateUser(userId, { role: newRole });
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      alert('Erro ao atualizar cargo');
    }
  };

  const handleVincular = async (corretorId, gestorId) => {
    try {
      await updateUser(corretorId, { gestorId: gestorId || null });
    } catch (error) {
      console.error('Erro ao vincular:', error);
      alert('Erro ao vincular corretor');
    }
  };

  const handleDesvincular = async (member) => {
    try {
      await updateUser(member.id, { gestorId: null });
    } catch (error) {
      console.error('Erro ao desvincular:', error);
      alert('Erro ao desvincular corretor');
    }
  };

  // Renderização condicional por aba (apenas diretor)
  const renderDiretorContent = () => {
    switch (activeTab) {
      case 'cargos':
        return renderCargosTab();
      case 'vinculos':
        return renderVinculosTab();
      default:
        return renderEquipeTab();
    }
  };

  // Aba Equipe - Visualização hierárquica
  const renderEquipeTab = () => {
    const filteredGestores = gestoresWithCorretores.filter(g =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      g.corretores.some(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      )
    );

    return (
      <div className="space-y-6">
        {/* Alertas contextuais */}
        {pendingCount > 0 && (
          <TeamAlert
            type="pendingRoles"
            count={pendingCount}
            title={pendingCount === 1 ? 'usuário aguardando atribuição de cargo' : 'usuários aguardando atribuição de cargo'}
            description="Atribua um cargo para que possam acessar o sistema"
            actionLabel="Ver Cargos"
            onAction={() => setActiveTab('cargos')}
          />
        )}

        {unlinkedCount > 0 && (
          <TeamAlert
            type="unlinkedCorretores"
            count={unlinkedCount}
            title={unlinkedCount === 1 ? 'corretor sem gestor vinculado' : 'corretores sem gestor vinculado'}
            description="Vincule-os a um gestor para que possam receber plantões"
            actionLabel="Ver Vínculos"
            onAction={() => setActiveTab('vinculos')}
          />
        )}

        {filteredGestores.length === 0 && corretoresSemGestor.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {search ? 'Nenhum membro encontrado' : 'Nenhum gestor cadastrado'}
            </p>
          </div>
        ) : (
          <>
            {/* Gestores com seus corretores */}
            {filteredGestores.map((gestor) => (
              <div key={gestor.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Crown size={16} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Equipe {gestor.name.split(' ')[0]}
                  </h3>
                </div>
                
                <MemberCard
                  member={gestor}
                  variant="gestor"
                  actions={['edit', 'delete']}
                  onEdit={handleOpenModal}
                  onDelete={handleDelete}
                />

                {/* Corretores do Gestor */}
                {gestor.corretores.length > 0 ? (
                  <div className="ml-6 pl-4 border-l-2 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {gestor.corretores.map((corretor) => (
                        <MemberCard
                          key={corretor.id}
                          member={corretor}
                          variant="corretor"
                          actions={['edit', 'delete']}
                          onEdit={handleOpenModal}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ml-6 pl-4 border-l-2 border-gray-200">
                    <p className="text-sm text-gray-400 italic py-2">Nenhum corretor nesta equipe</p>
                  </div>
                )}
              </div>
            ))}

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
                      <MemberCard
                        key={corretor.id}
                        member={corretor}
                        variant="unlinked"
                        actions={['edit', 'delete']}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Aba Cargos - Atribuição de cargos
  const renderCargosTab = () => {
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a.role === 'pendente' && b.role !== 'pendente') return -1;
      if (a.role !== 'pendente' && b.role === 'pendente') return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div className="space-y-4">
        {pendingCount > 0 && (
          <TeamAlert
            type="pendingRoles"
            count={pendingCount}
            title={pendingCount === 1 ? 'usuário aguardando atribuição de cargo' : 'usuários aguardando atribuição de cargo'}
            description="Atribua um cargo para que possam acessar o sistema"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedUsers.map((member) => {
            const isCurrentUser = member.id === user.id;
            const isPending = member.role === 'pendente';
            
            return (
              <MemberCard
                key={member.id}
                member={member}
                isCurrentUser={isCurrentUser}
                variant={isPending ? 'pending' : 'default'}
                showRoleBadge={false}
              >
                <RoleDropdown
                  value={member.role}
                  onChange={(newRole) => handleChangeRole(member.id, newRole)}
                  isCurrentUser={isCurrentUser}
                  showPendingOption={isPending}
                />
              </MemberCard>
            );
          })}
        </div>

        {sortedUsers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum membro encontrado</p>
          </div>
        )}
      </div>
    );
  };

  // Aba Vínculos - Vincular corretores a gestores
  const renderVinculosTab = () => {
    const corretores = filteredUsers.filter(u => u.role === 'corretor');
    
    const sortedCorretores = [...corretores].sort((a, b) => {
      if (!a.gestorId && b.gestorId) return -1;
      if (a.gestorId && !b.gestorId) return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div className="space-y-4">
        {gestores.length === 0 && (
          <TeamAlert
            type="noGestores"
            title="Nenhum gestor cadastrado"
            description="Primeiro, atribua o cargo de Gestor a algum membro na aba 'Cargos'"
            actionLabel="Ir para Cargos"
            onAction={() => setActiveTab('cargos')}
          />
        )}

        {unlinkedCount > 0 && (
          <TeamAlert
            type="unlinkedCorretores"
            count={unlinkedCount}
            title={unlinkedCount === 1 ? 'corretor sem gestor' : 'corretores sem gestor'}
            description="Vincule-os a um gestor para que possam receber plantões"
          />
        )}

        <div className="space-y-3">
          {sortedCorretores.map((corretor) => {
            const gestor = corretor.gestorId ? getUserById(corretor.gestorId) : null;
            const hasGestor = !!gestor;
            
            return (
              <MemberCard
                key={corretor.id}
                member={corretor}
                variant={hasGestor ? 'default' : 'pending'}
                showGestorInfo={hasGestor}
                gestorName={gestor?.name}
                actions={hasGestor ? ['unlink'] : []}
                onUnlink={handleDesvincular}
              >
                {!hasGestor && (
                  <GestorSelector
                    value={corretor.gestorId}
                    onChange={(gestorId) => handleVincular(corretor.id, gestorId)}
                    gestores={gestores}
                  />
                )}
              </MemberCard>
            );
          })}
        </div>

        {sortedCorretores.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {search ? 'Nenhum corretor encontrado' : 'Nenhum corretor cadastrado'}
            </p>
            {!search && (
              <p className="text-sm text-gray-400 mt-2">
                Primeiro, atribua o cargo de Corretor a algum membro na aba "Cargos"
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Visão do Gestor
  const renderGestorView = () => {
    const filteredCorretores = meusCorretores.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Diretor */}
        {diretorData && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Diretor
              </h3>
            </div>
            <MemberCard member={diretorData} variant="diretor" />
          </div>
        )}

        {/* Meus Corretores */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Meus Corretores ({filteredCorretores.length})
            </h3>
          </div>

          {filteredCorretores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCorretores.map((corretor) => (
                <MemberCard key={corretor.id} member={corretor} variant="corretor" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {search ? 'Nenhum corretor encontrado' : 'Você ainda não tem corretores na sua equipe'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Visão do Corretor
  const renderCorretorView = () => {
    const filteredColegas = colegasDeEquipe.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Meu Gestor */}
        {myGestorData && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crown size={16} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Meu Gestor
              </h3>
            </div>
            <MemberCard member={myGestorData} variant="gestor" />
          </div>
        )}

        {/* Colegas de Equipe */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Colegas de Equipe ({filteredColegas.length})
            </h3>
          </div>

          {filteredColegas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredColegas.map((colega) => (
                <MemberCard key={colega.id} member={colega} variant="corretor" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {search ? 'Nenhum colega encontrado' : 'Você é o único corretor na sua equipe'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Contagem total para o header
  const getTotalCount = () => {
    if (isDiretor) {
      const totalGestores = gestores.length;
      const totalCorretores = allUsers.filter(u => u.role === 'corretor').length;
      return `${totalGestores} gestores, ${totalCorretores} corretores`;
    }
    if (isGestor) {
      return `${meusCorretores.length} corretores${diretorData ? ' + 1 diretor' : ''}`;
    }
    if (isCorretor) {
      return `${colegasDeEquipe.length} colegas${myGestorData ? ' + 1 gestor' : ''}`;
    }
    return '';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isDiretor ? 'Gestão de Equipe' : 'Equipe'}
          </h1>
          <p className="text-gray-600">
            {isDiretor 
              ? 'Gerencie membros, cargos e vínculos da equipe' 
              : 'Veja todos os membros da equipe'}
          </p>
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-full sm:w-64"
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

      {/* Tabs (apenas para diretor) */}
      {isDiretor && (
        <div className="mb-6">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      )}

      {/* Team Count */}
      <div className="flex items-center gap-2 mb-4 text-gray-600">
        <Users size={20} />
        <span className="font-medium">{getTotalCount()}</span>
      </div>

      {/* Content */}
      {isDiretor && renderDiretorContent()}
      {isGestor && renderGestorView()}
      {isCorretor && renderCorretorView()}

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
              required={!editingUser}
            />
            {editingUser && (
              <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a senha atual</p>
            )}
          </div>

          <div>
            <label className="label">Cargo</label>
            <select
              className="input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value, gestorId: '' })}
            >
              <option value="corretor">🏢 Corretor</option>
              <option value="gestor">👔 Gestor</option>
              <option value="recepcionista">📋 Recepcionista</option>
              <option value="diretor">👑 Diretor</option>
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
                {gestores.map(g => (
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
