const express = require('express');
const router = express.Router();

module.exports = (pool) => {

    router.post('/submete', async (req, res) => {
        try {
          const { email, id_artigo } = req.body;
      
          // Busca o id_autor com base no email
          const queryAutor = await pool.query('SELECT id_autor FROM autor WHERE email = $1', [email]);
          const id_autor = queryAutor.rows[0].id_autor;
      
          // Insere uma nova linha na tabela "submete"
          const result = await pool.query('INSERT INTO submete (id_autor, id_artigo) VALUES ($1, $2) RETURNING *', [id_autor, id_artigo]);
      
          res.status(201).json(result.rows[0]);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Erro ao criar nova submissão' });
        }
      });
      

  return router;
};
