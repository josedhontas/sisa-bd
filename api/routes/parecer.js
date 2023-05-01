const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  

  router.post('/', async (req, res)=>{
    try {
      const {id_editor, id_artigo, comentario, parecer} = req.body;
      await pool.query('INSERT INTO parecer (id_editor, id_artigo, comentario, parecer) VALUES($1, $2, $3, $4) RETURNING *', [id_editor, id_artigo, comentario, parecer]);
      res.status(200).json({massage: 'ok'});
    } catch(error){
      res.status(500).json({message:"erro ao cadastrar parecer"});
    }
  })
  

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM parecer');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar aprecer');
    }
  });

  router.get ('/:id_editor', async (req, res) => {
 try{
  const {id_editor} = req.params;
  const result =  await pool.query ('SELECT * FROM parecer WHERE id_editor = $1', [id_editor])
  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Parecer não encontrado' });
  } else {
    res.json(result.rows);
  }
  
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar artigo' });
}
})
  return router;

};

