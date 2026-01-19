const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/users.cjs');
const plantoesRoutes = require('./routes/plantoes.cjs');
const seed = require('./db/seed.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/users', usersRoutes);
app.use('/api/plantoes', plantoesRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando!' });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  
  // Executar seed na inicialização
  await seed();
});
