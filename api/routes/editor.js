const express = require('express');
const router = express.Router();

module.exports = (pool) => {


  // Rota para buscar todos os editores e revistas deles
  router.get('/', async (req, res) => {
    const newQuery = `SELECT * FROM editor`
    try {
      //const result = await pool.query('select usuario.nome_completo, revista.id_revista, revista.nome_revista, usuario.email, revista.descricao from usuario inner join editor using(email) join trabalha_editor using(id_editor) join revista using(id_revista)');
      const result = await pool.query(newQuery);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar editores');
    }
  });
  // Rota para buscar todos os aritigos submetidos, tem que colocar restricao depois
  router.get('/:email', async (req, res) => {
    try {
      const email = req.params.email;
  
      const query = `
      SELECT a.nome_artigo, a.palavras_chaves, a.resumo, a.link_artigo, u.nome_completo AS nome_autor, r.nome_revista
      FROM artigo AS a
      JOIN submete AS s ON s.id_artigo = a.id_artigo
      JOIN autor AS au ON au.id_autor = s.id_autor
      JOIN usuario AS u ON u.email = au.email
      JOIN trabalha_editor AS te ON te.id_revista = a.id_revista
      JOIN editor AS e ON e.id_editor = te.id_editor
      JOIN revista AS r ON r.id_revista = a.id_revista
      WHERE e.email = $1;
      `;
      const result = await pool.query(query, [email]);
  
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar artigos' });
    }
  });

  // Rota para criar um novo editor
  router.post('/', async (req, res) => {
    try {
      const { email } = req.body;
      const result = await pool.query("INSERT INTO editor (email, cargo) VALUES ($1, 'Editor') RETURNING *", [email]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar novo editor' });
    }
  });

  // Rota para atualizar um editor existente
  router.put('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const { cargo } = req.body;
      const result = await pool.query('UPDATE editor SET cargo = $1 WHERE email = $2 RETURNING *', [cargo, email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar editor' });
    }
  });

  // Rota para deletar um editor existente
  router.delete('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      await pool.query('DELETE FROM editor WHERE email = $1', [email]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar editor' });
    }
  });

  router.get('/buscar/:email', async (req, res, next)=>{
    const {email} = req.params;
    try {
      const result = await pool.query(`SELECT * FROM editor WHERE email = '${email}'` );
      res.json(result.rows.length)
    } catch(error){
      res.status(500).json({message:'Erro ao buscar editor'})
    }
    

  });

 


  return router;
};
