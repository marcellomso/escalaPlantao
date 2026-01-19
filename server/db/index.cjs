const Datastore = require('nedb');
const path = require('path');

// Diretório onde os dados serão armazenados
const dbPath = path.join(__dirname, '../../data');

// Criação das coleções
const db = {
  users: new Datastore({ 
    filename: path.join(dbPath, 'users.db'), 
    autoload: true 
  }),
  plantoes: new Datastore({ 
    filename: path.join(dbPath, 'plantoes.db'), 
    autoload: true 
  })
};

// Criar índices para buscas mais rápidas
db.users.ensureIndex({ fieldName: 'email', unique: true });
db.plantoes.ensureIndex({ fieldName: 'date' });

// Função para transformar callbacks em Promises
const promisify = (collection, method, ...args) => {
  return new Promise((resolve, reject) => {
    collection[method](...args, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Operações CRUD genéricas
const dbOperations = {
  // Inserir documento
  insert: (collection, doc) => promisify(db[collection], 'insert', { ...doc, createdAt: new Date() }),

  // Buscar todos
  findAll: (collection, query = {}) => promisify(db[collection], 'find', query),

  // Buscar um
  findOne: (collection, query) => promisify(db[collection], 'findOne', query),

  // Atualizar
  update: (collection, query, update, options = {}) => 
    promisify(db[collection], 'update', query, { $set: update }, options),

  // Remover
  remove: (collection, query, options = {}) => 
    promisify(db[collection], 'remove', query, options),

  // Contar documentos
  count: (collection, query = {}) => promisify(db[collection], 'count', query),
};

module.exports = { db, dbOperations };
