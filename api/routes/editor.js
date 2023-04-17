const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM editor');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:id', async (req, res) => {
    const id_editor = req.params.id;
    try {
      const { rows } = await pool.query('SELECT * FROM editor WHERE id_editor = $1', [id_editor]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'editor nao encontrado' });
    }
  });

  router.post('/', async (req, res) => {
    const {id_papel } = req.body;
  
    try {
      const { rows } = await pool.query('INSERT INTO editor (id_papel) VALUES ($1) RETURNING *', [id_papel]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/:id', async (req, res) => {
    const { id_editor } = req.params;
    const { id_papel} = req.body;
  
    try {
      const { rows } = await pool.query('UPDATE editor SET id_papel=$1 WHERE id_editor=$2 RETURNING *', [id_papel, id_editor]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    const { id_editor } = req.params;
  
    try {
      const { rows } = await pool.query('DELETE FROM editor WHERE id_editor=$1 RETURNING *', [id_editor]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
  

  return router;
};
