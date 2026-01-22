const express = require('express');
const { dbOperations } = require('../db/index.cjs');

const router = express.Router();

/**
 * Status do plantão:
 * - 'aguardando_gestor': Criado pelo diretor, sem gestor atribuído
 * - 'aguardando_corretor': Gestor atribuído, aguardando atribuição de corretor
 * - 'aguardando_confirmacao': Corretor atribuído, aguardando confirmação
 * - 'confirmado': Corretor confirmou presença
 */

// GET /api/plantoes - Listar todos os plantões
router.get('/', async (req, res) => {
  try {
    const plantoes = await dbOperations.findAll('plantoes');
    res.json(plantoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plantoes/:id - Buscar plantão por ID
router.get('/:id', async (req, res) => {
  try {
    const plantao = await dbOperations.findOne('plantoes', { id: req.params.id });
    if (!plantao) {
      return res.status(404).json({ error: 'Plantão não encontrado' });
    }
    res.json(plantao);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plantoes/gestor/:gestorId - Buscar plantões por gestor
router.get('/gestor/:gestorId', async (req, res) => {
  try {
    const plantoes = await dbOperations.findAll('plantoes', { gestorId: req.params.gestorId });
    res.json(plantoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plantoes/corretor/:corretorId - Buscar plantões por corretor
router.get('/corretor/:corretorId', async (req, res) => {
  try {
    // Busca plantões onde o corretor está atribuído
    const plantoes = await dbOperations.findAll('plantoes', { corretorId: req.params.corretorId });
    res.json(plantoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Valida os dados do plantão
 * @param {object} data - Dados do plantão
 * @returns {{ isValid: boolean, errors: string[] }}
 */
const validatePlantaoData = (data) => {
  const errors = [];

  // Valida data
  if (data.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push('Formato de data inválido. Use YYYY-MM-DD');
    } else {
      const parsedDate = new Date(data.date);
      const year = parsedDate.getFullYear();
      if (isNaN(parsedDate.getTime())) {
        errors.push('Data inválida');
      } else if (year < 2020 || year > 2100) {
        errors.push('Ano deve estar entre 2020 e 2100');
      }
    }
  }

  // Valida horários
  if (data.startTime && data.endTime) {
    if (data.startTime >= data.endTime) {
      errors.push('Hora de fim deve ser maior que hora de início');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// POST /api/plantoes - Criar plantão (usado pelo Diretor)
router.post('/', async (req, res) => {
  try {
    // Valida os dados antes de criar
    const validation = validatePlantaoData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join('. ') });
    }

    // Determina o status inicial baseado se tem gestor ou não
    const hasGestor = !!req.body.gestorId;
    const status = hasGestor ? 'aguardando_corretor' : 'aguardando_gestor';

    const newPlantao = {
      ...req.body,
      id: Date.now().toString(),
      corretorId: null,           // Um corretor por plantão
      confirmedByCorretor: false, // Corretor ainda não confirmou
      status: status
    };
    const plantao = await dbOperations.insert('plantoes', newPlantao);
    res.status(201).json(plantao);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/plantoes/:id - Atualizar plantão
router.put('/:id', async (req, res) => {
  try {
    const plantaoAtual = await dbOperations.findOne('plantoes', { id: req.params.id });
    if (!plantaoAtual) {
      return res.status(404).json({ error: 'Plantão não encontrado' });
    }

  // Monta o objeto de atualização, removendo _id se existir
  const updates = { ...req.body };
  if (updates._id) delete updates._id;

    // Lógica de transição de status automática
    // Se está atribuindo gestor pela primeira vez
    if (updates.gestorId && !plantaoAtual.gestorId) {
      updates.status = 'aguardando_corretor';
    }

    // Se está atribuindo corretor pela primeira vez
    if (updates.corretorId && !plantaoAtual.corretorId) {
      updates.status = 'aguardando_confirmacao';
      updates.confirmedByCorretor = false;
    }

    // Se está confirmando presença
    if (updates.confirmedByCorretor === true) {
      updates.status = 'confirmado';
    }

    // Se corretor foi removido, volta para aguardando_corretor
    if (Object.prototype.hasOwnProperty.call(updates, 'corretorId') && (updates.corretorId === null || updates.corretorId === undefined)) {
      updates.status = 'aguardando_corretor';
      updates.confirmedByCorretor = false;
    }

    await dbOperations.update('plantoes', { id: req.params.id }, updates);
    const plantao = await dbOperations.findOne('plantoes', { id: req.params.id });
    res.json(plantao);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/plantoes/:id - Deletar plantão
router.delete('/:id', async (req, res) => {
  try {
    await dbOperations.remove('plantoes', { id: req.params.id });
    res.json({ message: 'Plantão deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
