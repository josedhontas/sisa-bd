const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  // Rota para buscar todos os artigoes
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM artigo');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar artigos');
    }
  });



  return router;
};
