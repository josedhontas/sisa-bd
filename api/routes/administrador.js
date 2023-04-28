const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  //Middlewares
  const cadastrarUsuarioAdmin = (req, res, next)=>{
    const {email, nome_completo, senha, telefone, departamento, universidade} = req.body
    pool.query(
      'INSERT INTO usuario (email, nome_completo, senha, telefone, departamento, universidade) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, nome_completo, senha, telefone, departamento, universidade],
      (error, res) => {
        if (error) {
          res.status(500).send(error.message);
        } else {
          res.status(200).send('Usuario cadastrado com sucesso!');
          next();
        }
      }
    );
  }

  // Rota para buscar todos os administradores e o nome
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT usuario.nome_completo, usuario.email FROM usuario INNER JOIN administrador USING(email)');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar administradores');
    }
  });

  //rota autenticar admin por email e senha
  router.get('/:email/:senha', async (req, res) => {
    const { email, senha } = req.params;
    try {
      const result = await pool.query('SELECT * FROM usuario join administrador using(email) WHERE email = $1 and senha = $2', [email, senha]);
      if (result.rows.length === 0) {
        res.status(404).send('Admin não encontrado');
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuário');
    }
  });

  // Rota para buscar um administrador por email
  router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const result = await pool.query('select usuario.nome_completo, usuario.email from usuario inner join administrador using(email) WHERE email = $1', [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar administrador por email' });
    }
  });

  // Rota para criar um novo administrador
  router.post('/', cadastrarUsuarioAdmin,  async (req, res) => {
    try {
      const { email } = req.body;
      const autorResult = await pool.query("SELECT * FROM autor WHERE email = $1", [email]);
      if (autorResult.rows.length >= 0) {
        await pool.query("DELETE FROM autor where email = $1", [email]);
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
