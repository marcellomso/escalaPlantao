const express = require('express');
const { dbOperations } = require('../db/index.cjs');

const router = express.Router();

/**
 * Roles disponíveis no sistema:
 * - 'diretor': Acesso total, gerencia cargos e vínculos
 * - 'gestor': Gerencia plantões e distribui aos corretores
 * - 'corretor': Visualiza e confirma presença nos plantões
 * - 'recepcionista': Pode criar e excluir plantões (sem atribuir gestores)
 * - 'pendente': Usuário recém-cadastrado aguardando atribuição de cargo
 */

// POST /api/users/register - Auto-cadastro de novo usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validar campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const existingUser = await dbOperations.findOne('users', { email });
    if (existingUser) {
      return res.status(409).json({ error: 'Este email já está cadastrado' });
    }

    // Criar usuário com role 'pendente'
    const newUser = {
      name,
      email,
      password,
      role: 'pendente',
      id: Date.now().toString()
    };

    const user = await dbOperations.insert('users', newUser);
    
    // Não retornar a senha
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users - Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const users = await dbOperations.findAll('users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await dbOperations.findOne('users', { id: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/role/:role - Buscar usuários por role
router.get('/role/:role', async (req, res) => {
  try {
    const users = await dbOperations.findAll('users', { role: req.params.role });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/gestor/:gestorId/corretores - Buscar corretores de um gestor
router.get('/gestor/:gestorId/corretores', async (req, res) => {
  try {
    const users = await dbOperations.findAll('users', { 
      role: 'corretor', 
      gestorId: req.params.gestorId 
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Criar usuário
router.post('/', async (req, res) => {
  try {
    const newUser = {
      ...req.body,
      id: Date.now().toString()
    };
    const user = await dbOperations.insert('users', newUser);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', async (req, res) => {
  try {
    await dbOperations.update('users', { id: req.params.id }, req.body);
    const user = await dbOperations.findOne('users', { id: req.params.id });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id - Deletar usuário
router.delete('/:id', async (req, res) => {
  try {
    await dbOperations.remove('users', { id: req.params.id });
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/login - Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await dbOperations.findOne('users', { email, password });
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
