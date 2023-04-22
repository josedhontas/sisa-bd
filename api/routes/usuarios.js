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

  //Rota para autentificar um usuario
  router.get('/:email/:senha', async (req, res) => {
    const { email, senha } = req.params;
    try {
      const result = await pool.query('SELECT * FROM usuario WHERE email = $1 and senha = $2' , [email, senha]);
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
  router.post('/', (req, res) => {
    const { email, nome_completo, senha, telefone, departamento, universidade} = req.body;
  
    // Realizar a inserção no banco de dados
    pool.query(
      'INSERT INTO usuario (email, nome_completo, senha, telefone, departamento, universidade) VALUES ($1, $2, $3, $4, $5, $6)',
      [email, nome_completo, senha, telefone, departamento, universidade],
      (error, result) => {
        if (error) {
          res.status(500).send(error.message);
        } else {
          res.status(201).send('Usuário criado com sucesso!');
        }
      }
    );
  });

  router.put('/:email', (req, res) => {
    const { nome_completo, senha, telefone, departamento, universidade, descricao, link_imagem } = req.body;
    const { email } = req.params;
  
  
    pool.query('UPDATE usuario SET nome_completo = $1, senha = $2, telefone = $3, departamento = $4, universidade = $5, descricao = $6, link_imagem = $7 WHERE email = $8', 
      [nome_completo, senha, telefone, departamento, universidade, descricao, link_imagem, email], 
      (error, results) => {
        if (error) {
          throw error;
        }
        res.status(200).send(`Usuário atualizado com sucesso!`);
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
