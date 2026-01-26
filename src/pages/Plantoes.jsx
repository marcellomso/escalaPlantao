import { useState } from 'react';
import { Plus, AlertCircle, List, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PlantaoCard from '../components/PlantaoCard';
import Modal from '../components/Modal';
import { Navigate } from 'react-router-dom';
import { parseISO, isValid, isBefore, startOfDay, startOfWeek, endOfWeek, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função auxiliar para agrupar plantões por semana e por dia
const groupByWeekAndDay = (plantoes) => {
  const grouped = {};
  
  plantoes.forEach(plantao => {
    const date = parseISO(plantao.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Semana começa na segunda-feira
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    
    const weekKey = `${format(weekStart, 'yyyy-MM-dd')} - ${format(weekEnd, 'yyyy-MM-dd')}`;
    const weekLabel = `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`;
    
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayLabel = format(date, 'EEEE', { locale: ptBR }); // Nome completo do dia
    
    if (!grouped[weekKey]) {
      grouped[weekKey] = { 
        label: weekLabel, 
        days: {} 
      };
    }
    
    if (!grouped[weekKey].days[dayKey]) {
      grouped[weekKey].days[dayKey] = {
        label: dayLabel,
        date: date,
        plantoes: []
      };
    }
    
    grouped[weekKey].days[dayKey].plantoes.push(plantao);
  });
  
  // Ordenar semanas por data e dias dentro da semana
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekKey, weekData]) => ({
      week: weekKey,
      label: weekData.label,
      days: Object.values(weekData.days).sort((a, b) => a.date - b.date)
    }));
};

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
  const [viewMode, setViewMode] = useState('all'); // 'all' ou 'week'
  // Estado para confirmação de troca de gestor no formulário
  const [formGestorChangeModal, setFormGestorChangeModal] = useState({ open: false, newGestorId: null });

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

  // Agrupar por semana se estiver na visão semanal
  const plantoesByWeek = viewMode === 'week' ? groupByWeekAndDay(plantoes) : [];

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
    setFormGestorChangeModal({ open: false, newGestorId: null });
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

    // Se está editando e houve troca de gestor, e já existe corretor vinculado, precisa confirmar remoção do corretor
    // Detecta troca de gestor, inclusive remoção (gestorId vazio/null)
    const gestorMudou = editingPlantao &&
      editingPlantao.gestorId !== formData.gestorId &&
      editingPlantao.gestorId &&
      editingPlantao.corretorId;
    if (gestorMudou) {
      setFormGestorChangeModal({ open: true, newGestorId: formData.gestorId });
      return;
    }

    // Se o modal de confirmação já foi exibido, ou não precisa, segue normalmente
    if (editingPlantao) {
      updatePlantao(editingPlantao.id, formData);
    } else {
      // Backend define o status automaticamente
      addPlantao(formData);
    }
    handleCloseModal();
  };

  // Confirma troca de gestor no formulário e remove corretor
  const confirmFormGestorChange = async () => {
    if (editingPlantao) {
      await updatePlantao(editingPlantao.id, {
        ...formData,
        gestorId: formGestorChangeModal.newGestorId,
        corretorId: null,
        confirmedByCorretor: false
      });
    }
    handleCloseModal();
  };

  const cancelFormGestorChange = () => {
    setFormGestorChangeModal({ open: false, newGestorId: null });
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

      {/* Controles de Visualização */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <List size={18} />
          Todos os Plantões
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'week'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <CalendarDays size={18} />
          Por Semana
        </button>
      </div>

      {/* Plantões */}
      {viewMode === 'all' ? (
        // Visualização normal em grid
        <>
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
        </>
      ) : (
        // Visualização por semana
        <div className="space-y-8">
          {plantoesByWeek.map((week) => (
            <div key={week.week} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{week.label}</h3>
              <div className="space-y-6">
                {week.days.map((day) => (
                  <div key={day.date} className="border-l-4 border-primary-500 pl-4">
                    <h4 className="text-md font-medium text-gray-800 mb-3 capitalize">{day.label}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {day.plantoes.map((plantao) => (
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
                  </div>
                ))}
              </div>
            </div>
          ))}

          {plantoesByWeek.length === 0 && plantoes.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum plantão encontrado para exibir</p>
            </div>
          )}

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
        </div>
      )}

      {/* Modal de criação/edição de plantão */}
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
                onChange={(e) => {
                  setFormData({ ...formData, gestorId: e.target.value });
                }}
              >
                <option value="">Selecione...</option>
                {gestores.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
      {/* Modal de confirmação de troca de gestor no formulário */}
      <Modal
        isOpen={formGestorChangeModal.open}
        onClose={cancelFormGestorChange}
        title="Trocar Gestor do Plantão"
      >
        <div className="space-y-4">
          <p className="text-gray-800">
            Ao trocar o gestor responsável, todos os corretores atualmente vinculados a este plantão serão <span className="font-semibold text-red-600">removidos automaticamente</span>.<br/>
            O plantão voltará ao status de <span className="font-semibold">sem corretor definido</span>.<br/>
            Tem certeza que deseja continuar?
          </p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={cancelFormGestorChange} className="btn-outline flex-1">
              Cancelar
            </button>
            <button type="button" onClick={confirmFormGestorChange} className="btn-primary flex-1">
              Confirmar troca de gestor
            </button>
          </div>
        </div>
      </Modal>
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

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-outline" onClick={handleCloseModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingPlantao ? 'Salvar Alterações' : 'Criar Plantão'}
            </button>
          </div>
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
