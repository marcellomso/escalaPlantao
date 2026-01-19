const express = require('express');
const cors = require('cors');
const path = require('path');
const usersRoutes = require('./routes/users.cjs');
const plantoesRoutes = require('./routes/plantoes.cjs');
const seed = require('./db/seed.cjs');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/users', usersRoutes);
app.use('/api/plantoes', plantoesRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando!' });
});

// Em produção, servir o frontend buildado
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  // Todas as rotas não-API retornam o index.html (para SPA)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Modo: ${isProduction ? 'Produção' : 'Desenvolvimento'}`);
  
  // Executar seed na inicialização
  await seed();
});
