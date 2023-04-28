const express = require('express');
const router = express.Router();

module.exports = (pool) => {

//retorna a relação de um administrador e a revista que ele trabalha

router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM trabalha_administrador');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar o administrador e sua respectiva revista');
    }
  });

// Rota para criar uma nova relação administrador/revista

  router.post('/', async (req, res) => {
    try {
      const { id_administrador , id_revista } = req.body;
      const result = await pool.query("INSERT INTO trabalha_administrador (id_administrador, id_revista) VALUES ($1, $2) RETURNING *", [id_administrador, id_revista]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao relacionar o administrador com a revista' });
    }
  });
  return router
};