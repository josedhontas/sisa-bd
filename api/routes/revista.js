const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM revista');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar revista');
    }
  });

  router.post('/', async (req, res) => {
    const { nome_revista, descricao } = req.body;
  
    try {
      const novaRevista = await pool.query(
        'INSERT INTO revista (nome_revista, descricao) VALUES ($1, $2) RETURNING *',
        [nome_revista, descricao]
      );
  
      res.status(201).json(novaRevista.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao adicionar revista' });
    }
  });
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_revista, descricao } = req.body;
  
    try {
      const revistaAtualizada = await pool.query(
        'UPDATE revista SET nome_revista = $1, descricao = $2 WHERE id_revista = $3 RETURNING *',
        [nome_revista, descricao, id]
      );
  
      if (revistaAtualizada.rows.length === 0) {
        return res.status(404).json({ error: 'Revista não encontrada' });
      }
  
      res.status(200).json(revistaAtualizada.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao atualizar revista' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM revista WHERE id_revista = $1', [id]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar revista' });
    }
  });
  
  return router;
};
