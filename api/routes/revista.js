const express = require('express');
const router = express.Router();

module.exports = (pool) => {
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
