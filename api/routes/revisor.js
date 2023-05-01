const express = require('express');
const router = express.Router();

module.exports = (pool) => {


  // Rota para buscar todos os revisores
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM revisor inner join usuario using(emaiL)');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar revisores');
    }
  });
  
  router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const result = await pool.query('SELECT * FROM revisor inner join usuario using(email) WHERE email = $1' , [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar revisor por email' });
    }
  });

  // Rota para criar um novo revisor
  router.post('/', async (req, res) => {
    try {
      const { email } = req.body;
      const result = await pool.query("INSERT INTO revisor (email, cargo) VALUES ($1, 'revisor') RETURNING *", [email]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar novo revisor' });
    }
  });

  // Rota para atualizar um revisor existente
  router.put('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const { cargo } = req.body;
      const result = await pool.query('UPDATE revisor SET cargo = $1 WHERE email = $2 RETURNING *', [cargo, email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar revisor' });
    }
  });

  // Rota para deletar um revisor existente
  router.delete('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      await pool.query('DELETE FROM revisor WHERE email = $1', [email]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar revisor' });
    }
  });

  //essa rota recebe como parâmetro o email um editor e retorna todos os possíveis revisores
  //para um artigo
  router.get('/revisoresPossiveis/:email', async (req, res)=>{
    const {email} = req.params;
    try {
      const result = await  pool.query(`SELECT * FROM usuario WHERE email not in (SELECT email FROM administrador) and email != $1`, [email]);
      res.json(result.rows);
    } catch(error){
      res.status(500).json({message: 'erro ao buscar revisores'})
    }
  })

  return router;
};
