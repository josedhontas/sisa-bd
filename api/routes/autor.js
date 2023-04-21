const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  // Rota para buscar todos os autores
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM autor');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar autores');
    }
  });

  // Rota para buscar um autor por email
  router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const result = await pool.query('select usuario.nome_completo, revista.nome_revista, revista.descricao from usuario inner join autor using(email) WHERE email = $1', [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar autor por email' });
    }
  });

  // Rota para criar um novo autor
  router.post('/', async (req, res) => {
    try {
      const { email } = req.body;
      const autorResult = await pool.query("SELECT * FROM administrador WHERE email = $1", [email]);
      if (autorResult.rows.length > 0) {
        res.status(400).json({ message: 'Não é possível adicionar este e-mail como autor, pois já está registrado como administrador.' });
      } else {
        const result = await pool.query("INSERT INTO autor (email, cargo) VALUES ($1, 'Autor') RETURNING *", [email]);
        res.status(201).json(result.rows[0]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar novo autor' });
    }
  });


  // Rota para atualizar um autor existente
  router.put('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const { cargo } = req.body;
      const result = await pool.query('UPDATE autor SET cargo = $1 WHERE email = $2 RETURNING *', [cargo, email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar autor' });
    }
  });

  // Rota para deletar um autor existente
  router.delete('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      await pool.query('DELETE FROM autor WHERE email = $1', [email]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar autor' });
    }
  });


  return router;
};
