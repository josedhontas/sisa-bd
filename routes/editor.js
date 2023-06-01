const express = require('express');
const router = express.Router();

module.exports = (pool) => {


  // Rota para buscar todos os editores e revistas deles

  /**
 * @swagger
 * /editor:
 *   get:
 *     summary: Busca todos os editores e suas revistas
 *     tags:
 *       - Editor
 *     responses:
 *       200:
 *         description: Lista de editores e suas revistas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_editor:
 *                     type: integer
 *                     description: ID do editor
 *                     example: 1
 *                   nome_completo:
 *                     type: string
 *                     description: Nome completo do editor
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     description: E-mail do editor
 *                     example: john.doe@example.com
 *                   revistas:
 *                     type: array
 *                     description: Lista de revistas do editor
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_revista:
 *                           type: integer
 *                           description: ID da revista
 *                           example: 1
 *                         nome_revista:
 *                           type: string
 *                           description: Nome da revista
 *                           example: Science Journal
 *                         descricao:
 *                           type: string
 *                           description: Descrição da revista
 *                           example: Revista científica sobre ciência e tecnologia
 */

  router.get('/', async (req, res) => {
    const newQuery = `SELECT * FROM editor`
    try {
      //const result = await pool.query('select usuario.nome_completo, revista.id_revista, revista.nome_revista, usuario.email, revista.descricao from usuario inner join editor using(email) join trabalha_editor using(id_editor) join revista using(id_revista)');
      const result = await pool.query(newQuery);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar editores');
    }
  });
  // Rota para buscar todos os aritigos submetidos, tem que colocar restricao depois


  /**
 * @swagger
 * /editor/{email}:
 *   get:
 *     summary: Busca todos os artigos submetidos por um editor
 *     tags:
 *       - Editor
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: E-mail do editor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de artigos submetidos pelo editor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nome_artigo:
 *                     type: string
 *                     description: Nome do artigo
 *                     example: Artigo de Exemplo
 *                   id_artigo:
 *                     type: integer
 *                     description: ID do artigo
 *                     example: 1
 *                   palavras_chaves:
 *                     type: string
 *                     description: Palavras-chave do artigo
 *                     example: ciência, tecnologia
 *                   resumo:
 *                     type: string
 *                     description: Resumo do artigo
 *                     example: Este artigo apresenta uma análise sobre o avanço da tecnologia na sociedade.
 *                   link_artigo:
 *                     type: string
 *                     description: Link do artigo
 *                     example: http://exemplo.com/artigo
 *                   nome_autor:
 *                     type: string
 *                     description: Nome completo do autor
 *                     example: John Doe
 *                   nome_revista:
 *                     type: string
 *                     description: Nome da revista
 *                     example: Science Journal
 */

  router.get('/:email', async (req, res) => {
    try {
      const email = req.params.email;

      const query = `
      SELECT a.nome_artigo, a.id_artigo, a.palavras_chaves, a.resumo, a.link_artigo, u.nome_completo AS nome_autor, r.nome_revista
      FROM artigo AS a
      JOIN submissao AS s ON s.id_artigo = a.id_artigo
      JOIN autor AS au ON au.id_autor = s.id_autor
      JOIN usuario AS u ON u.email = au.email
      JOIN trabalha_editor AS te ON te.id_revista = a.id_revista
      JOIN editor AS e ON e.id_editor = te.id_editor
      JOIN revista AS r ON r.id_revista = a.id_revista
      WHERE e.email = $1;
      `;
      const result = await pool.query(query, [email]);

      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar artigos' });
    }
  });

  // Rota para criar um novo editor

  /**
 * @swagger
 * /editor:
 *   post:
 *     summary: Cria um novo editor
 *     tags:
 *       - Editor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: E-mail do novo editor
 *                 example: editor@example.com
 *     responses:
 *       201:
 *         description: Novo editor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: E-mail do editor
 *                   example: editor@example.com
 *                 cargo:
 *                   type: string
 *                   description: Cargo do editor
 *                   example: Editor
 */

  router.post('/', async (req, res) => {
    try {
      const { email } = req.body;
      const result = await pool.query("INSERT INTO editor (email, cargo) VALUES ($1, 'Editor') RETURNING *", [email]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar novo editor' });
    }
  });
  // rota que devolve o Id_editor a partir do email

  /**
 * @swagger
 * /editor/retornaId_editor/{email}:
 *   get:
 *     summary: Retorna o ID do editor a partir do e-mail
 *     tags:
 *       - Editor
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: E-mail do editor
 *         example: editor@example.com
 *     responses:
 *       200:
 *         description: ID do editor retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_editor:
 *                   type: integer
 *                   description: ID do editor
 *                   example: 1
 */

  router.get('/retornaId_editor/:email', async (req, res) => {
    try {
      const { email } = req.params
      console.log(email)
      const result = await pool.query('select id_editor from editor join usuario using(email) where email = $1', [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar id_editor pela email' });
    }
  });


  // Rota para atualizar um editor existente

  /**
 * @swagger
 * /editor/{email}:
 *   put:
 *     summary: Atualiza um editor existente
 *     tags:
 *       - Editor
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: E-mail do editor
 *         example: editor@example.com
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             cargo:
 *               type: string
 *               description: Cargo do editor
 *               example: Editor-chefe
 *     responses:
 *       200:
 *         description: Editor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_editor:
 *                   type: integer
 *                   description: ID do editor atualizado
 *                   example: 1
 */

  router.put('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const { cargo } = req.body;
      const result = await pool.query('UPDATE editor SET cargo = $1 WHERE email = $2 RETURNING *', [cargo, email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar editor' });
    }
  });

  // Rota para deletar um editor existente

  /**
 * @swagger
 * /editor/{email}:
 *   delete:
 *     summary: Deleta um editor existente
 *     tags:
 *       - Editor
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: E-mail do editor
 *         example: editor@example.com
 *     responses:
 *       204:
 *         description: Editor deletado com sucesso
 */

  router.delete('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      await pool.query('DELETE FROM editor WHERE email = $1', [email]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar editor' });
    }
  });

  // rota que retorna o editor a partir do email

  /**
 * @swagger
 * /editor/buscar/{email}:
 *   get:
 *     summary: Retorna o editor a partir do e-mail
 *     tags:
 *       - Editor
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: E-mail do editor
 *         example: editor@example.com
 *     responses:
 *       200:
 *         description: Editor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Editor'
 *       404:
 *         description: Editor não encontrado
 */

  router.get('/buscar/:email', async (req, res, next) => {
    const { email } = req.params;
    try {
      const result = await pool.query(`SELECT * FROM editor WHERE email = '${email}'`);
      res.json(result.rows.length)
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar editor' })
    }


  });

  return router;
};
