const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: 'AKIAUBXBIDPATQNYLL4X',
  secretAccessKey: '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',
  region: 'us-east-2'
  
});

const upload = multer({
  storage: multerS3({
      s3: s3,
      bucket: 'sisa-bucket',
      metadata: function (request, file, cb) {
          cb(null, { fieldName: file.fieldname });
      },
      key: function (request, file, cb) {
          cb(null, Date.now().toString() + '-' + file.originalname);
      }
  })
});


module.exports = (pool) => {

  // Rota para buscar todos os artigoes
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM artigo');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar artigos');
    }
  });


  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT artigo FROM artigo WHERE id_artigo = $1', [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Artigo não encontrado' });
      }
  
      const artigo = result.rows[0];
  
      // Define o tipo do conteúdo como pdf
      res.setHeader('Content-Type', 'application/pdf');
  
      // Envia o conteúdo do artigo, que deve ser o arquivo PDF armazenado diretamente no banco de dados
      res.send(artigo.artigo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar artigo' });
    }
  });
  


  
  router.post('/', upload.single('pdf'), (req, res) => {
    const pdf = req.file;
    const link = pdf.location; // pega o link do pdf no s3
    const { id_revista, email_revisor, palavras_chaves, nome_artigo, msg_revisor, resumo } = req.body;
    const query =
      'INSERT INTO artigo (id_revista, email_revisor, palavras_chaves, nome_artigo, link_artigo, msg_revisor, resumo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_artigo';
    const values = [id_revista, email_revisor, palavras_chaves, nome_artigo, link, msg_revisor, resumo];
    pool.query(query, values, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
      } else {
        const id_artigo = results.rows[0].id_artigo;
        res.status(201).json({ id_artigo, ...req.body, link_artigo: link });
      }
    });
  });
  
  
  

  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { id_revista, email_revisor, palavras_chaves, nome_artigo,  msg_revisor, resumo } = req.body;
  
    // Verificar se o artigo com o id fornecido existe no banco de dados
    db.query('SELECT * FROM artigo WHERE id_artigo = $1', [id], (err, result) => {
      if (err) {
        throw err;
      }
  
      if (result.rows.length === 0) {
        return res.status(404).send('Artigo não encontrado');
      }
  
      // Atualizar o artigo no banco de dados
      db.query('UPDATE artigo SET id_revista = $1, email_revisor = $2, palavras_chaves = $3, nome_artigo = $4, artigo = $5, msg_revisor = $6, resumo = $7 WHERE id_artigo = $8',
        [id_revista, email_revisor, palavras_chaves, nome_artigo, artigo, msg_revisor, resumo, id], (err, result) => {
          if (err) {
            throw err;
          }
  
          res.send('Artigo atualizado com sucesso');
        });
    });
  });

  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM artigo WHERE id_artigo = $1', [id]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar artigo' });
    }
  });
  
  



  return router;
};
