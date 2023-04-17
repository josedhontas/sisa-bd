const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT usuario.email, usuario.nome,usuario.departamento papel.nome_papel FROM usuario JOIN papel ON usuario.email = papel.email WHERE papel.nome_papel = 'Administrador'"); res.json(rows);
        res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:email', async (req, res) => {
    const email = req.params.email;
    try {
      const { rows } = await pool.query('SELECT u.email, u.nome_completo, u.telefone, u.departamento, u.descricao, p.nome_papel FROM usuario u INNER JOIN papel p ON u.email = p.email INNER JOIN administrador e ON p.id_papel = e.id_papel WHERE u.email = $1', [email]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'administrador nao encontrado' });
    }
  });

  router.post('/', async (req, res) => {
    const {id_papel } = req.body;
  
    try {
      const { rows } = await pool.query('INSERT INTO administrador (id_papel) VALUES ($1) RETURNING *', [id_papel]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/:id', async (req, res) => {
    const { id_administrador } = req.params;
    const { id_papel} = req.body;
  
    try {
      const { rows } = await pool.query('UPDATE administrador SET id_papel=$1 WHERE id_administrador=$2 RETURNING *', [id_papel, id_administrador]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    const { id_administrador } = req.params;
  
    try {
      const { rows } = await pool.query('DELETE FROM administrador WHERE id_administrador=$1 RETURNING *', [id_administrador]);
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};
