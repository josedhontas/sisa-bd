const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT u.email, u.nome_completo, u.telefone, u.departamento, u.descricao, p.nome_papel FROM papel e INNER JOIN papel p ON e.id_papel = p.id_papel INNER JOIN usuario u ON p.email = u.email');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:email', async (req, res) => {
    const email = req.params.email;
    try {
      const { rows } = await pool.query('SELECT u.email, u.nome_completo, u.telefone, u.departamento, u.descricao, p.nome_papel FROM usuario u INNER JOIN papel p ON u.email = p.email INNER JOIN papel e ON p.id_papel = e.id_papel WHERE u.email = $1', [email]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'papel nao encontrado' });
    }
  });

  router.post('/', async (req, res) => {
    const {email, nome_papel } = req.body;
  
    try {
      const { rows } = await pool.query('INSERT INTO papel (email, nome_papel) VALUES ($1, $2) RETURNING *', [email, nome_papel]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/:id', async (req, res) => {
    const { email, nome_papel } = req.body;
    const { id_papel } = req.params;
  
    try {
      const result = await pool.query(
        'UPDATE papel SET email = $1, nome_papel = $2 WHERE id_papel = $3',
        [email, nome_papel, id_papel]
      );
      res.status(200).send(`Registro com ID ${id_papel} atualizado com sucesso!`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao atualizar registro na tabela "papel"');
    }
  });

  router.delete('/:id', async (req, res) => {
    const { id_papel } = req.params;
  
    try {
      const { rows } = await pool.query('DELETE FROM papel WHERE id_papel=$1 RETURNING *', [id_papel]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};
