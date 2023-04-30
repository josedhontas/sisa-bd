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
      const result = await pool.query(
        `SELECT artigo.nome_artigo, revista.nome_revista, artigo.link_artigo,
        (SELECT nome_completo FROM usuario WHERE email = autor.email) AS nome_autor,
        (SELECT nome_completo FROM usuario WHERE email = editor.email) AS nome_editor
 FROM revisor
 INNER JOIN revisa ON revisor.id_revisor = revisa.id_revisor
 INNER JOIN artigo ON revisa.id_artigo = artigo.id_artigo
 INNER JOIN submete ON artigo.id_artigo = submete.id_artigo
 INNER JOIN autor ON submete.id_autor = autor.id_autor
 INNER JOIN revista ON artigo.id_revista = revista.id_revista
 INNER JOIN trabalha_editor ON trabalha_editor.id_revista = revista.id_revista
 INNER JOIN editor ON trabalha_editor.id_editor = editor.id_editor
 WHERE revisor.email = $1 AND revisa.aceito IS NULL;
 `,
        [email]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar informações do revisor por email' });
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


  return router;
};
