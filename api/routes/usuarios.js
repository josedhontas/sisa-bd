const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Rota para buscar todos os usuários
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM usuario');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuários');
    }
  });

  // Rota para buscar um usuário por email
  router.get('/:email', async (req, res) => {
    const { email } = req.params;
    try {
      const result = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        res.status(404).send('Usuário não encontrado');
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuário');
    }
  });

  // Rota para criar um usuário
  router.post('/', async (req, res) => {
    const { email, nome_completo, senha, telefone, departamento, descricao, link_imagem } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO usuario (email, nome_completo, senha, telefone, departamento, descricao, link_imagem) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [email, nome_completo, senha, telefone, departamento, descricao, link_imagem]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao criar usuário');
    }
  });

  router.put('/:email', (req, res) => {
    const email = req.params.email;
    const { nome_completo, senha, telefone, departamento, descricao, link_imagem } = req.body;
    const query = 'UPDATE usuario SET nome_completo=$1, senha=$2, telefone=$3, departamento=$4, descricao=$5, link_imagem=$6 WHERE email=$7';
  
    pool.query(query, [nome_completo, senha, telefone, departamento, descricao, link_imagem, email], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar usuário.');
      } else {
        res.status(200).send(`Usuário ${email} atualizado com sucesso.`);
      }
    });
  });
  

  router.delete('/:email', (req, res) => {
    const email = req.params.email;
    const query = 'DELETE FROM usuario WHERE email=$1';
  
    pool.query(query, [email], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Erro ao excluir usuário.');
      } else {
        res.status(200).send(`Usuário ${email} excluído com sucesso.`);
      }
    });
  });
  




  return router;
};
