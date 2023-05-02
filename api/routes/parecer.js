const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  
  // rota que armazena o parecer de um editor para dado artigo
  router.post('/', async (req, res)=>{
    try {
      const {id_editor, id_artigo, comentario, parecer} = req.body;
      console.log(id_editor, id_artigo, comentario, parecer);
      const result = await pool.query("INSERT INTO parecer (id_editor, id_artigo, comentario, parecer) VALUES ($1, $2, $3, $4) RETURNING *", [id_editor, id_artigo, comentario, parecer]);
      res.status(201).json(result.rows[0]);
    } catch(error){
      res.status(500).json({message:"erro ao cadastrar parecer"});
    }
  })
  
  // rota que retorna todos os pareceres existentes
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM parecer');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar aprecer');
    }
  });



router.get('/:id_editor', async (req, res) => {
  try {
    const { id_editor } = req.params;
    const result = await pool.query('select * from parecer  WHERE id_editor = $1', [id_editor]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar parecer' });
  }
});


  return router;

};

