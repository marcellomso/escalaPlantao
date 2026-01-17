import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PlantaoCard from '../components/PlantaoCard';
import Modal from '../components/Modal';
import { Navigate } from 'react-router-dom';

const initialFormData = {
  title: '',
  date: '',
  startTime: '08:00',
  endTime: '13:00',
  location: '',
  notes: '',
  gestorId: '',
  status: 'pendente'
};

export default function Plantoes() {
  const { user } = useAuth();
  const { getPlantoes, getGestores, addPlantao, updatePlantao, deletePlantao } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingPlantao, setEditingPlantao] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  // Apenas diretor pode acessar esta página
  if (user?.role !== 'diretor') {
    return <Navigate to="/" replace />;
  }

  const plantoes = getPlantoes();
  const gestores = getGestores();

  const handleOpenModal = (plantao = null) => {
    if (plantao) {
      setEditingPlantao(plantao);
      setFormData(plantao);
    } else {
      setEditingPlantao(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlantao(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingPlantao) {
      updatePlantao(editingPlantao.id, formData);
    } else {
      addPlantao({ ...formData, corretorIds: [] });
    }
    
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este plantão?')) {
      deletePlantao(id);
    }
  };

  const handleChangeGestor = (plantaoId, gestorId) => {
    updatePlantao(plantaoId, { gestorId });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel do Diretor</h1>
          <p className="text-gray-600">Gerencie plantões e atribua aos gestores</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Plantão
        </button>
      </div>

      {/* Plantões Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plantoes.map((plantao) => (
          <PlantaoCard
            key={plantao.id}
            plantao={plantao}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            showGestorSelector={true}
            onChangeGestor={handleChangeGestor}
          />
        ))}
      </div>

      {plantoes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum plantão cadastrado</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary mt-4"
          >
            Criar primeiro plantão
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingPlantao ? 'Editar Plantão' : 'Novo Plantão'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Título do Plantão</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Stand Ecoville (Manhã)"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data</label>
              <input
                type="date"
                className="input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hora Início</label>
              <input
                type="time"
                className="input"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Hora Fim</label>
              <input
                type="time"
                className="input"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Local</label>
            <input
              type="text"
              className="input"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Av. das Américas, 1000"
              required
            />
          </div>

          <div>
            <label className="label">Observações</label>
            <textarea
              className="input"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-outline flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingPlantao ? 'Salvar' : 'Criar Plantão'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
