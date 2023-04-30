const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  //Middlewares
  const existsUser = async (req, res, next)=>{
    const { email } = req.body;
    try {
      const result = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        res.status(404).send('Usuário não encontrado');
        return;
      } else {
        res.json(result.rows[0]);
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuário');
    }
  }
  
  const adminValidado = async (req, res , next) =>{
    const {email, cargo} = req.body;
    try {
      const result = await pool.query('SELECT * from administrador where email = $1 and cargo = $2', [email, "Administrador"] );
      if (result.rows.length === 0) {
        res.status(404).send({resp:404});
        return;
      } else {
        //res.json(result.rows[0]);
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuário');
    }
  }
  

  // Retorna todas as revistas cadastradas
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM revista');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar revista');
    }
  });

   // Retorna todas as revistas com o nome
  router.get('/:nome', (req, res) => {
    const nome = req.params.nome;
    const query = `SELECT * FROM revista WHERE nome_revista LIKE '%${nome}%'`;
    pool.query(query, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
      } else {
        res.json(results.rows);
      }
    });
  });

  //verifica se adminstrador é válido
  router.get('/valida/:email', async (req, res, next)=>{
    const {email} = req.params;
    console.log(email)
    try {
      const result = await pool.query('SELECT * from administrador where email = $1 and cargo = $2', [email, "Administrador"] );
      console.log(result.rows)
      if (result.rows.length === 0) {
        res.send({resp:"404"});
        return;
      } else {
        res.send({resp:"200"});
        res.status(200).send({resp:"200"});
      }

    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuário');
    }
  });

  // insere nova revista 
  
  router.post('/', existsUser, async (req, res, next) => {
    const { nome_revista, descricao, email } = req.body;
    console.log(email, nome_revista)
  
    try {
    
      const editorResult = await pool.query(
        'INSERT INTO editor (email, cargo) VALUES ($1, $2) RETURNING id_editor',
        [email, 'Editor']
      );
      const editorId = editorResult.rows[0].id_editor;
    
      const revistaResult = await pool.query(
        'INSERT INTO revista (nome_revista, descricao) VALUES ($1, $2) RETURNING id_revista',
        [nome_revista, descricao]
      );
      const revistaId = revistaResult.rows[0].id_revista;
  
      await pool.query(
        'INSERT INTO trabalha_editor (id_editor, id_revista) VALUES ($1, $2)',
        [editorId, revistaId]
      );
  
      res.status(201).json({resp:201});
    } catch (error) {
      console.error(error);
      res.status(500).json({ resp:500 });
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
