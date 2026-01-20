import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PlantaoCard from '../components/PlantaoCard';
import Modal from '../components/Modal';
import { Navigate } from 'react-router-dom';
import { parseISO, isValid, isBefore, startOfDay } from 'date-fns';

const initialFormData = {
  title: '',
  date: '',
  startTime: '08:00',
  endTime: '13:00',
  location: '',
  notes: '',
  gestorId: ''
};

/**
 * Valida se a data é válida e não está no passado
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @returns {{ isValid: boolean, error: string | null }}
 */
const validateDate = (dateStr) => {
  if (!dateStr) {
    return { isValid: false, error: 'Data é obrigatória' };
  }

  // Verifica se a data tem o formato correto (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return { isValid: false, error: 'Formato de data inválido' };
  }

  // Tenta fazer o parse da data
  const parsedDate = parseISO(dateStr);
  
  if (!isValid(parsedDate)) {
    return { isValid: false, error: 'Data inválida' };
  }

  // Verifica se o ano é razoável (entre 2020 e 2100)
  const year = parsedDate.getFullYear();
  if (year < 2020 || year > 2100) {
    return { isValid: false, error: 'Ano deve estar entre 2020 e 2100' };
  }

  // Verifica se a data não está no passado
  const today = startOfDay(new Date());
  if (isBefore(parsedDate, today)) {
    return { isValid: false, error: 'Data não pode ser no passado' };
  }

  return { isValid: true, error: null };
};

export default function Plantoes() {
  const { user } = useAuth();
  const { getPlantoes, getGestores, addPlantao, updatePlantao, deletePlantao } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingPlantao, setEditingPlantao] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  const isDiretor = user?.role === 'diretor';
  const isRecepcionista = user?.role === 'recepcionista';

  // Diretor e Recepcionista podem acessar esta página
  if (!isDiretor && !isRecepcionista) {
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
    setFormErrors({});
  };

  // Valida a data ao alterar o campo
  const handleDateChange = (dateStr) => {
    setFormData({ ...formData, date: dateStr });
    
    // Valida a data e atualiza os erros
    const validation = validateDate(dateStr);
    if (!validation.isValid) {
      setFormErrors({ ...formErrors, date: validation.error });
    } else {
      // Remove o erro de data se válida
      const { date, ...restErrors } = formErrors;
      setFormErrors(restErrors);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Valida a data antes de enviar
    const dateValidation = validateDate(formData.date);
    if (!dateValidation.isValid) {
      setFormErrors({ ...formErrors, date: dateValidation.error });
      return;
    }

    // Valida se hora fim é maior que hora início
    if (formData.startTime >= formData.endTime) {
      setFormErrors({ ...formErrors, time: 'Hora de fim deve ser maior que hora de início' });
      return;
    }
    
    if (editingPlantao) {
      updatePlantao(editingPlantao.id, formData);
    } else {
      // Backend define o status automaticamente
      addPlantao(formData);
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isDiretor ? 'Painel do Diretor' : 'Gerenciar Plantões'}
          </h1>
          <p className="text-gray-600">
            {isDiretor 
              ? 'Gerencie plantões e atribua aos gestores' 
              : 'Cadastre e exclua plantões'
            }
          </p>
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
            onEdit={isDiretor ? handleOpenModal : undefined}
            onDelete={handleDelete}
            showGestorSelector={isDiretor}
            onChangeGestor={isDiretor ? handleChangeGestor : undefined}
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
                className={`input ${formErrors.date ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              {formErrors.date && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {formErrors.date}
                </p>
              )}
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
                className={`input ${formErrors.time ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={formData.startTime}
                onChange={(e) => {
                  setFormData({ ...formData, startTime: e.target.value });
                  // Remove erro de tempo ao alterar
                  if (formErrors.time) {
                    const { time, ...restErrors } = formErrors;
                    setFormErrors(restErrors);
                  }
                }}
                required
              />
            </div>
            <div>
              <label className="label">Hora Fim</label>
              <input
                type="time"
                className={`input ${formErrors.time ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={formData.endTime}
                onChange={(e) => {
                  setFormData({ ...formData, endTime: e.target.value });
                  // Remove erro de tempo ao alterar
                  if (formErrors.time) {
                    const { time, ...restErrors } = formErrors;
                    setFormErrors(restErrors);
                  }
                }}
                required
              />
            </div>
          </div>
          {formErrors.time && (
            <p className="text-sm text-red-600 flex items-center gap-1 -mt-2">
              <AlertCircle size={14} />
              {formErrors.time}
            </p>
          )}

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
