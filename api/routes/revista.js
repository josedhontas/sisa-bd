const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  //Middlewares
  const existeUsuario = async (req, res, next)=>{
    const { email } = req.params;
    try {
      const result = await pool.query(`SELECT * FROM usuario WHERE email = '${email}'`);
      if(result.rows.length === 0){
        return res.status(404).send('Usuario nao cadastrado');
      }
      req.usuario = result.rows[0];
      next();
    } catch(error){
      console.error(error);
      res.status(500).json({error:'Erro ao verificar existencia de usuario'});
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

  router.post('/', existeUsuario, async (req, res, next) => {
    
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