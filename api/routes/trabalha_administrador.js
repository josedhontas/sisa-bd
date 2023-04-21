const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  
  // Rota para buscar um administrador por email
  router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const result = await pool.query('select usuario.nome_completo, revista.nome_revista, revista.descricao from usuario inner join editor using(email) join trabalha_administrador using(id_editor) join revista using(id_revista) WHERE email = $1', [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar administrador por email' });
    }
  });

  return router;
};