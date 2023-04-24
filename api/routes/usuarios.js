const express = require('express');
const router = express.Router();

const authenticate = (req, res, next) => {
  const isAuthenticated = true;

  if (isAuthenticated) {
    next();
  } else {
    res.status(401).send('Não autorizado');
  }
};

module.exports = (pool) => {
  // Rota para buscar todos os usuários
  router.get('/', authenticate, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM usuario');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuários');
    }
  });

  //Rota para autentificar um usuario
  router.get('/:email/:senha', authenticate, async (req, res) => {
    const { email, senha } = req.params;
    try {
      const result = await pool.query('SELECT * FROM usuario WHERE email = $1 and senha = $2', [email, senha]);
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
  router.get('/:email', authenticate, async (req, res) => {
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
  router.post('/', authenticate, (req, res) => {
    const { email, nome_completo, senha, telefone, departamento, universidade } = req.body;
  
    // Realizar a inserção no banco de dados
    pool.query(
      'INSERT INTO usuario (email, nome_completo, senha, telefone, departamento, universidade) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, nome_completo, senha, telefone, departamento, universidade],
      (error, result) => {
        if (error) {
          res.status(500).send(error.message);
        } else {
          // Adicionar usuário à tabela "autor"
          pool.query(
            'INSERT INTO autor (email, cargo) VALUES ($1, $2)',
            [email, 'Autor'],
            (error, result) => {
              if (error) {
                res.status(500).send(error.message);
              } else {
                res.status(201).send('Usuário criado com sucesso!');
              }
            }
          );
        }
      }
    );
  });
  

  router.put('/:email', authenticate, (req, res) => {
    const { nome_completo, senha, telefone, departamento, universidade, descricao, link_imagem } = req.body;
    const { email } = req.params;


    pool.query('UPDATE usuario SET nome_completo = $1, senha = $2, telefone = $3, departamento = $4, universidade = $5, descricao = $6, link_imagem = $7 WHERE email = $8',
      [nome_completo, senha, telefone, departamento, universidade, descricao, link_imagem, email],
      (error, result) => {
        if (error) {
          res.status(500).send(error.message);
        } else if (result.rowCount === 0) {
          res.status(404).send('Usuário não encontrado');
        } else {
          res.status(200).send('Usuário atualizado com sucesso!');
        }
      }
    );
  });

  router.delete('/:email', authenticate, (req, res) => {
    const { email } = req.params;
    pool.query('DELETE FROM usuario WHERE email = $1', [email], (error, result) => {
      if (error) {
        res.status(500).send(error.message);
      } else if (result.rowCount === 0) {
        res.status(404).send('Usuário não encontrado');
      } else {
        res.status(200).send('Usuário excluído com sucesso!');
      }
    });
  });

  return router;
};    