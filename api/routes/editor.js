const express = require('express');
const router = express.Router();

module.exports = (pool) => {


  // Rota para buscar todos os editores e revistas deles
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('select usuario.nome_completo, revista.id_revista, revista.nome_revista, usuario.email, revista.descricao from usuario inner join editor using(email) join trabalha_editor using(id_editor) join revista using(id_revista)');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar editores');
    }
  });
  // Rota para buscar um editor por email
  router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const result = await pool.query('select usuario.nome_completo, revista.nome_revista, revista.descricao from usuario inner join editor using(email) join trabalha_editor using(id_editor) join revista using(id_revista) WHERE email = $1', [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar editor por email' });
    }
  });

  // Rota para criar um novo editor
  router.post('/', async (req, res) => {
    try {
      const { email } = req.body;
      const result = await pool.query("INSERT INTO editor (email, cargo) VALUES ($1, 'Editor') RETURNING *", [email]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar novo editor' });
    }
  });

  // Rota para atualizar um editor existente
  router.put('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const { cargo } = req.body;
      const result = await pool.query('UPDATE editor SET cargo = $1 WHERE email = $2 RETURNING *', [cargo, email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar editor' });
    }
  });

  // Rota para deletar um editor existente
  router.delete('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      await pool.query('DELETE FROM editor WHERE email = $1', [email]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar editor' });
    }
  });


  return router;
};
