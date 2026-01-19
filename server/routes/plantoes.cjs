const express = require('express');
const { dbOperations } = require('../db/index.cjs');

const router = express.Router();

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
    const allPlantoes = await dbOperations.findAll('plantoes');
    const plantoes = allPlantoes.filter(p => 
      p.corretorIds && p.corretorIds.includes(req.params.corretorId)
    );
    res.json(plantoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plantoes - Criar plantão
router.post('/', async (req, res) => {
  try {
    const newPlantao = {
      ...req.body,
      id: Date.now().toString(),
      corretorIds: req.body.corretorIds || []
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
    await dbOperations.update('plantoes', { id: req.params.id }, req.body);
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
