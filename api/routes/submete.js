const express = require('express');
const router = express.Router();

module.exports = (pool) => {
//rota que insere o id_autor e id_artigo na tabela submissao
    router.post('/', async (req, res) => {
        try {
          const { email, id_artigo } = req.body;
      
          // Busca o id_autor com base no email
          const queryAutor = await pool.query('SELECT id_autor FROM autor WHERE email = $1', [email]);
          const id_autor = queryAutor.rows[0].id_autor;
      
          // Insere uma nova linha na tabela "submissao"
          const result = await pool.query('INSERT INTO submissao (id_autor, id_artigo) VALUES ($1, $2) RETURNING *', [id_autor, id_artigo]);
      
          res.status(201).json(result.rows[0]);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Erro ao criar nova submissão' });
        }
      });

      // rota que retorna as submissões do autor pegando o seu id a partir do email
      router.get('/:email', async (req, res) => {
        try {
          const { email } = req.params;
      
          // Busca o id_autor com base no email
          const queryAutor = await pool.query('SELECT id_autor FROM autor WHERE email = $1', [email]);
          const id_autor = queryAutor.rows[0].id_autor;
      
          // Busca as submissões do autor
          const querySubmissoes = await pool.query(`
            SELECT r.nome_revista, a.nome_artigo, a.id_artigo
            FROM submissao s
            JOIN artigo a ON s.id_artigo = a.id_artigo
            JOIN revista r ON a.id_revista = r.id_revista
            WHERE s.id_autor = $1
          `, [id_autor]);
      
          res.json(querySubmissoes.rows);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Erro ao buscar submissões do autor' });
        }
      });
      

      

  return router;
};
