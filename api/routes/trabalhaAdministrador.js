const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  
  const express = require('express');
  const router = express.Router();
  
  module.exports = (pool) => {
  
  //retorna a relação de um admin e a revista que ele é responsável
  
  router.get('/', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM trabalha_administrador');
        res.json(result.rows);
      } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar o admin e sua respectiva revista');
      }
    });
  
  // Rota para criar uma nova relação admin/revista
  
    router.post('/', async (req, res) => {
      try {
        const { id_administrador , id_revista } = req.body;
        const result = await pool.query("INSERT INTO trabalha_administrador (id_administrador, id_revista) VALUES ($1, $2) RETURNING *", [id_administrador, id_revista]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao relacionar o admin com a revista' });
      }
    });
    return router
  };


  // Rota para buscar um administrador por email
  router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const result = await pool.query('select usuario.nome_completo, revista.nome_revista, revista.descricao from usuario inner join adiministrador using(email) join trabalha_administrador using(id_editor) join revista using(id_revista) WHERE email = $1', [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar administrador por email' });
    }
  });

  return router;
};