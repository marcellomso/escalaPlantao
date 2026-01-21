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

  // Estado para confirmação de troca de gestor
  const [gestorChangeModal, setGestorChangeModal] = useState({ open: false, plantao: null, newGestorId: null });

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

  // Ao tentar trocar gestor, exibe modal de confirmação se já houver corretores vinculados
  const handleChangeGestor = (plantaoId, gestorId) => {
    const plantao = plantoes.find(p => p.id === plantaoId);
    // Se já existe corretor vinculado, exibe modal de confirmação
    if (plantao && plantao.corretorId) {
      setGestorChangeModal({ open: true, plantao, newGestorId: gestorId });
    } else {
      updatePlantao(plantaoId, { gestorId });
    }
  };

  // Confirma troca de gestor e remove vínculo do corretor
  const confirmGestorChange = async () => {
    const { plantao, newGestorId } = gestorChangeModal;
    if (plantao) {
      // Remove o corretor vinculado ao plantão; backend ajusta status
      await updatePlantao(plantao.id, {
        gestorId: newGestorId,
        corretorId: null,
        confirmedByCorretor: false
      });
    }
    setGestorChangeModal({ open: false, plantao: null, newGestorId: null });
  };

  const cancelGestorChange = () => {
    setGestorChangeModal({ open: false, plantao: null, newGestorId: null });
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

      {/* Modal de criação/edição de plantão */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingPlantao ? 'Editar Plantão' : 'Novo Plantão'}
      >
        {/* ...existing code... */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ...existing code... */}
        </form>
      </Modal>

      {/* Modal de confirmação de troca de gestor */}
      <Modal
        isOpen={gestorChangeModal.open}
        onClose={cancelGestorChange}
        title="Trocar Gestor do Plantão"
      >
        <div className="space-y-4">
          <p className="text-gray-800">
            Ao trocar o gestor responsável, todos os corretores atualmente vinculados a este plantão serão <span className="font-semibold text-red-600">removidos automaticamente</span>.<br/>
            O plantão voltará ao status de <span className="font-semibold">sem corretor definido</span>.<br/>
            Tem certeza que deseja continuar?
          </p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={cancelGestorChange} className="btn-outline flex-1">
              Cancelar
            </button>
            <button type="button" onClick={confirmGestorChange} className="btn-primary flex-1">
              Confirmar troca de gestor
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
