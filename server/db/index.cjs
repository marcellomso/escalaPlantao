const { MongoClient } = require('mongodb');

// URL de conexão do MongoDB (Railway usa MONGO_URL)
const MONGODB_URL = process.env.MONGO_URL || process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'escala_plantao';

// Cliente MongoDB
let client = null;
let db = null;

/**
 * Conecta ao MongoDB
 * @returns {Promise<Db>} Instância do banco de dados
 */
async function connectDB() {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URL);
    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('✅ Conectado ao MongoDB');
    
    // Criar índices
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('plantoes').createIndex({ date: 1 });
    
    return db;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    throw error;
  }
}

/**
 * Fecha a conexão com o MongoDB
 */
async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Conexão MongoDB fechada');
  }
}

/**
 * Retorna a instância do banco de dados
 * @returns {Db} Instância do banco de dados
 */
function getDB() {
  if (!db) {
    throw new Error('MongoDB não conectado. Chame connectDB() primeiro.');
  }
  return db;
}

// Operações CRUD genéricas (mantém mesma interface do NeDB)
const dbOperations = {
  /**
   * Inserir documento
   * @param {string} collection - Nome da coleção
   * @param {object} doc - Documento a inserir
   * @returns {Promise<object>} Documento inserido
   */
  insert: async (collection, doc) => {
    const database = getDB();
    const docWithTimestamp = { ...doc, createdAt: new Date() };
    const result = await database.collection(collection).insertOne(docWithTimestamp);
    return { ...docWithTimestamp, _id: result.insertedId };
  },

  /**
   * Buscar todos os documentos
   * @param {string} collection - Nome da coleção
   * @param {object} query - Filtro de busca
   * @returns {Promise<array>} Lista de documentos
   */
  findAll: async (collection, query = {}) => {
    const database = getDB();
    return database.collection(collection).find(query).toArray();
  },

  /**
   * Buscar um documento
   * @param {string} collection - Nome da coleção
   * @param {object} query - Filtro de busca
   * @returns {Promise<object|null>} Documento encontrado ou null
   */
  findOne: async (collection, query) => {
    const database = getDB();
    return database.collection(collection).findOne(query);
  },

  /**
   * Atualizar documento
   * @param {string} collection - Nome da coleção
   * @param {object} query - Filtro de busca
   * @param {object} update - Campos a atualizar
   * @returns {Promise<object>} Resultado da operação
   */
  update: async (collection, query, update) => {
    const database = getDB();
    const result = await database.collection(collection).updateOne(query, { $set: update });
    return result;
  },

  /**
   * Remover documento
   * @param {string} collection - Nome da coleção
   * @param {object} query - Filtro de busca
   * @returns {Promise<object>} Resultado da operação
   */
  remove: async (collection, query) => {
    const database = getDB();
    const result = await database.collection(collection).deleteOne(query);
    return result;
  },

  /**
   * Contar documentos
   * @param {string} collection - Nome da coleção
   * @param {object} query - Filtro de busca
   * @returns {Promise<number>} Quantidade de documentos
   */
  count: async (collection, query = {}) => {
    const database = getDB();
    return database.collection(collection).countDocuments(query);
  },
};

module.exports = { connectDB, closeDB, getDB, dbOperations };
