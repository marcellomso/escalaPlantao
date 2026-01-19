const { dbOperations } = require('./index.cjs');

// Dados iniciais migrados do DataContext.jsx
const initialUsers = [
  {
    id: '1',
    name: 'Admin Diretor',
    email: 'diretor@escala.com',
    password: '123456',
    role: 'diretor',
    gestorId: null
  },
  {
    id: '2',
    name: 'Gestor Batista',
    email: 'gestor@escala.com',
    password: '123456',
    role: 'gestor',
    gestorId: null
  },
  {
    id: '3',
    name: 'Corretor',
    email: 'corretor@escala.com',
    password: '123456',
    role: 'corretor',
    gestorId: '2'
  }
];

async function seed() {
  try {
    // Verificar se já existem dados
    const usersCount = await dbOperations.count('users');

    if (usersCount === 0) {
      console.log('Inserindo usuários iniciais...');
      for (const user of initialUsers) {
        await dbOperations.insert('users', user);
      }
      console.log(`${initialUsers.length} usuários inseridos.`);
    } else {
      console.log(`Já existem ${usersCount} usuários no banco.`);
    }

    console.log('Seed concluído!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seed();
}

module.exports = seed;
