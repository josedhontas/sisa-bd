const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');

// credenciais do bucket do aws
const s3 = new AWS.S3({
  accessKeyId: 'AKIAUBXBIDPATQNYLL4X',
  secretAccessKey: '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',
  region: 'us-east-2'

});


// envio do pdf para o multer
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

  // Rota para buscar todos os artigos

  /**
 * @swagger
 * /artigo:
 *   get:
 *     summary: Busca todos os artigos
 *     tags:
 *       - Artigo
 *     responses:
 *       200:
 *         description: Lista de artigos encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artigo'
 *       500:
 *         description: Erro ao buscar artigos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro
 */

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM artigo');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar artigos');
    }
  });

  // rota que dado um id retorna as informacoes para este artigo em especifico

  /**
  * @swagger
  * /artigo/{id}:
  *   get:
  *     summary: Busca um artigo por ID
  *     tags:
  *       - Artigo
  *     parameters:
  *       - in: path
  *         name: id
  *         schema:
  *           type: integer
  *         required: true
  *         description: ID do artigo
  *     responses:
  *       200:
  *         description: Artigo encontrado com sucesso
  *         content:
  *           application/pdf:
  *             schema:
  *               type: string
  *               format: binary
  *       404:
  *         description: Artigo não encontrado
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 message:
  *                   type: string
  *                   description: Mensagem de erro
  *       500:
  *         description: Erro ao buscar artigo
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 message:
  *                   type: string
  *                   description: Mensagem de erro
  */

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

  //Essa rota recebe o id de um artigo e devolve todos os acontecimentos relacionaos ao mesmo

  /**
 * @swagger
 * /artigo/h/historico/{id_artigo}:
 *   get:
 *     summary: Busca o histórico de acontecimentos de um artigo por ID
 *     tags:
 *       - Artigo
 *     parameters:
 *       - in: path
 *         name: id_artigo
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do artigo
 *     responses:
 *       200:
 *         description: Histórico de acontecimentos encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Acontecimento'
 *       500:
 *         description: Erro ao buscar histórico de acontecimentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro
 *
 * components:
 *   schemas:
 *     Acontecimento:
 *       type: object
 *       properties:
 *         acontecimento:
 *           type: string
 *           description: Descrição do acontecimento
 *         data:
 *           type: string
 *           format: date-time
 *           description: Data do acontecimento
 *         parecer:
 *           type: string
 *           description: Parecer relacionado ao acontecimento
 *         comentario:
 *           type: string
 *           description: Comentário relacionado ao acontecimento
 */

  router.get('/h/historico/:id_artigo', async (req, res) => {

    try {
      const { id_artigo } = req.params;
      console.log("ID_ARTIGO: " + id_artigo)
      //select de, respectivamente todas as submissões, avaliações e pareceres emitidos
      const submissao = await pool.query('SELECT data_submissao FROM artigo join submete using(id_artigo) WHERE id_artigo = $1', [id_artigo]);
      const revisao = await pool.query('SELECT data_revisa, avaliacao, comentario from revisa where id_artigo = $1 and (aceito = true and avaliacao is not null)', [id_artigo])
      const parecer = await pool.query('SELECT data_parecer, parecer, comentario FROM parecer where id_artigo = $1', [id_artigo])

      //pega todas as linhas resultantes da consulta
      let submissoes = submissao.rows;
      let revisoes = revisao.rows;
      let pareceres = parecer.rows

      //padroniza todos os arrays de objetos, de modo que contenham as as mesas chaves
      //adiciona elemento que indica qual acontecimento ocorreu
      for (let acont of submissoes) {
        acont.acontecimento = 'The article was submitted';
        acont.data = acont.data_submissao;
        acont.parecer = '';
        acont.comentario = '';
        delete acont.data_submissao;
      }

      for (let acont of revisoes) {
        acont.acontecimento = "Article has been revised"
        acont.parecer = acont.avaliacao;
        delete acont.avaliacao;
        acont.data = acont.data_revisa;
        delete acont.data_revisa;
      }

      for (let acont of pareceres) {
        acont.acontecimento = "The Editor Has Issued an Opinion"
        acont.data = acont.data_parecer;
        delete acont.data_parecer;
      }

      //aloca todos os acontecimentos em um único array
      let acontecimentos = [...submissoes, ...revisoes, ...pareceres]
      //ordena acontecimentos em ordem cronológica
      acontecimentos = acontecimentos.sort((a, b) => new Date(a.data) - new Date(b.data))

      res.status(200).json(acontecimentos)
      console.log(acontecimentos);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar submissão' });
    }
  })

  // rota que dado um artigo retorna o seu historico de submissao

  router.get('/historico/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const query = `
        SELECT artigo.*, submete.id_autor, parecer.*, revisa.*
        FROM artigo
        JOIN submete ON artigo.id_artigo = submete.id_artigo
        LEFT JOIN parecer ON artigo.id_artigo = parecer.id_artigo
        LEFT JOIN revisa ON artigo.id_artigo = revisa.id_artigo
        WHERE artigo.id_artigo = $1;
      `;
      const { rows } = await pool.query(query, [id]);

      if (rows.length === 0) {
        return res.status(404).send('Artigo não encontrado.');
      }

      return res.json(rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Erro ao buscar o artigo.');
    }
  });

  // Rota que insere o artigo no bd
  router.post('/', upload.single('pdf'), (req, res) => {
    const pdf = req.file;
    const link = pdf.location; // pega o link do pdf no s3
    const { id_revista, palavras_chaves, nome_artigo, resumo } = req.body;
    const query =
      'INSERT INTO artigo (id_revista, palavras_chaves, nome_artigo, link_artigo, resumo) VALUES ($1, $2, $3, $4, $5) RETURNING id_artigo';
    const values = [id_revista, palavras_chaves, nome_artigo, link, resumo];
    pool.query(query, values, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
      } else {
        const id_artigo = results.rows[0].id_artigo;
        res.status(201).json({ id_artigo: id_artigo });
      }
    });
  });


  /*router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { email_revisor, msg_revisor } = req.body;
  
    // Verificar se o artigo com o id fornecido existe no banco de dados
    pool.query('SELECT * FROM artigo WHERE id_artigo = $1', [id], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
      } else if (results.rowCount === 0) {
        res.status(404).send('Artigo não encontrado');
      } else {
        // Atualizar o artigo no banco de dados
        const query = 'UPDATE artigo SET email_revisor = $1, msg_revisor = $2 WHERE id_artigo = $3';
        const values = [email_revisor, msg_revisor, id];
        pool.query(query, values, (error, results) => {
          if (error) {
            console.error(error);
            res.status(500).send('Erro interno do servidor');
          } else {
            res.status(200).send('Artigo atualizado com sucesso');
          }
        });
      }
    });
  });*/


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

  //Rota que retorna, dado um email, o link para os pdfs de cada submissão ordenados por data
  router.get('/links/:email', async (req, res) => {
    try {
      const email = req.params.email;

      const query = `
      SELECT a.link_artigo, s.data_submissao
      FROM artigo AS a
      JOIN submete AS s ON s.id_artigo = a.id_artigo
      JOIN autor AS au ON au.id_autor = s.id_autor
      JOIN usuario AS u ON u.email = au.email
      JOIN trabalha_editor AS te ON te.id_revista = a.id_revista
      JOIN editor AS e ON e.id_editor = te.id_editor
      JOIN revista AS r ON r.id_revista = a.id_revista
      WHERE au.email = $1
	    ORDER BY s.data_submissao;
      `;
      const result = await pool.query(query, [email]);

      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar artigos' });
    }
  });







  return router;
};
