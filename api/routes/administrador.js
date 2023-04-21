const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  // Rota para buscar todos os administradores
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM administrador');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar administradores');
    }
  });

  // Rota para buscar um administrador por email
  router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const result = await pool.query('select usuario.nome_completo, revista.nome_revista, revista.descricao from usuario inner join editor using(email) WHERE email = $1', [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar administrador por email' });
    }
  });

  // Rota para criar um novo administrador
  router.post('/', async (req, res) => {
    try {
      const { email } = req.body;
      const autorResult = await pool.query("SELECT * FROM autor WHERE email = $1", [email]);
      if (autorResult.rows.length >= 0) {
        res.status(400).json({ message: 'Não é possível adicionar este e-mail como administrador, pois já está registrado como autor.' });
      } else {
        const result = await pool.query("INSERT INTO administrador (email, cargo) VALUES ($1, 'Administrador') RETURNING *", [email]);
        res.status(201).json(result.rows[0]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar novo administrador' });
    }
  });


  // Rota para atualizar um administrador existente
  router.put('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const { cargo } = req.body;
      const result = await pool.query('UPDATE administrador SET cargo = $1 WHERE email = $2 RETURNING *', [cargo, email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar administrador' });
    }
  });

  // Rota para deletar um administrador existente
  router.delete('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      await pool.query('DELETE FROM administrador WHERE email = $1', [email]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar administrador' });
    }
  });


  return router;
};
