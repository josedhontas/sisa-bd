const express = require('express');
const router = express.Router();

//rota que devolve as informações do gestor
module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT usuario.email, usuario.nome_completo,usuario.departamento, papel.nome_papel FROM usuario JOIN papel ON usuario.email = papel.email WHERE papel.nome_papel = 'Gestor'"); res.json(rows);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  //rota que devolve as informações do gestor a partir do email
  router.get('/:email', async (req, res) => {
    const email = req.params.email;
    try {
      const { rows } = await pool.query("SELECT usuario.email, usuario.nome_completo,usuario.departamento, papel.nome_papel FROM usuario JOIN papel ON usuario.email = papel.email where papel.nome_papel = 'Gestor' and usuario.email = $1", [email]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'gestor nao encontrado' });
    }
  });

  //rota que insere o id_papel na tabela gestor
  router.post('/', async (req, res) => {
    const {id_papel } = req.body;
  
    try {
      const { rows } = await pool.query('INSERT INTO gestor (id_papel) VALUES ($1) RETURNING *', [id_papel]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  //rota que atualiza a tabela gestor
  router.put('/:id', async (req, res) => {
    const { id_gestor } = req.params;
    const { id_papel} = req.body;
  
    try {
      const { rows } = await pool.query('UPDATE gestor SET id_papel=$1 WHERE id_gestor=$2 RETURNING *', [id_papel, id_gestor]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  //rota que deleta um gestor a partir do id_gestor
  router.delete('/:id', async (req, res) => {
    const { id_gestor } = req.params;
  
    try {
      const { rows } = await pool.query('DELETE FROM gestor WHERE id_gestor=$1 RETURNING *', [id_gestor]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};
