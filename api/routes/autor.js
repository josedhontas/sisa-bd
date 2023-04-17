const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM autor');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:id', async (req, res) => {
    const id_autor = req.params.id;
    try {
      const { rows } = await pool.query('SELECT * FROM autor WHERE id_autor = $1', [id_autor]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'autor nao encontrado' });
    }
  });

  router.post('/', async (req, res) => {
    const {id_papel } = req.body;
    try {
      const { rows } = await pool.query('INSERT INTO autor (id_papel) VALUES ($1) RETURNING *', [id_papel]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/:id', async (req, res) => {
    const { id_autor } = req.params;
    const { id_papel} = req.body;
  
    try {
      const { rows } = await pool.query('UPDATE autor SET id_papel=$1 WHERE id_autor=$2 RETURNING *', [id_papel, id_autor]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    const { id_autor } = req.params;
  
    try {
      const { rows } = await pool.query('DELETE FROM autor WHERE id_autor=$1 RETURNING *', [id_autor]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
  

  return router;
};
