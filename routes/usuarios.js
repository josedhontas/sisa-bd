const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM usuario');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:email', async (req, res) => {
    const email = req.params.email;
    try {
      const { rows } = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'usuario nao encontrado' });
    }
  });

  router.post('/', async (req, res) => {
    const { email, nome_completo, senha, telefone, departamento, tipo_de_usuario, descricao } = req.body;
  
    try {
      const { rows } = await pool.query('INSERT INTO usuario (email, nome_completo, senha, telefone, departamento, tipo_de_usuario, descricao) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [email, nome_completo, senha, telefone, departamento, tipo_de_usuario, descricao]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/:email', async (req, res) => {
    const { email } = req.params;
    const { nome_completo, senha, telefone, departamento, tipo_de_usuario, descricao } = req.body;
  
    try {
      const { rows } = await pool.query('UPDATE usuario SET nome_completo=$1, senha=$2, telefone=$3, departamento=$4, tipo_de_usuario=$5, descricao=$6 WHERE email=$7 RETURNING *', [nome_completo, senha, telefone, departamento, tipo_de_usuario, descricao, email]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/:email', async (req, res) => {
    const { email } = req.params;
  
    try {
      const { rows } = await pool.query('DELETE FROM usuario WHERE email=$1 RETURNING *', [email]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
  

  return router;
};
