const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM revisor');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:id', async (req, res) => {
    const id_revisor = req.params.id;
    try {
      const { rows } = await pool.query('SELECT * FROM revisor WHERE id_revisor = $1', [id_revisor]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'revisor nao encontrado' });
    }
  });

  router.post('/', async (req, res) => {
    const {id_papel } = req.body;
  
    try {
      const { rows } = await pool.query('INSERT INTO revisor (id_papel) VALUES ($1) RETURNING *', [id_papel]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/:id', async (req, res) => {
    const { id_revisor } = req.params;
    const { id_papel} = req.body;
  
    try {
      const { rows } = await pool.query('UPDATE revisor SET id_papel=$1 WHERE id_revisor=$2 RETURNING *', [id_papel, id_revisor]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    const { id_revisor } = req.params;
  
    try {
      const { rows } = await pool.query('DELETE FROM revisor WHERE id_revisor=$1 RETURNING *', [id_revisor]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
  

  return router;
};
