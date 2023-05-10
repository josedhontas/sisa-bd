const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  // Rota para buscar todos os autores

  /**
 * @swagger
 * /autor:
 *   get:
 *     summary: Retorna a lista de autores
 *     tags:
 *       - Autor
 *     responses:
 *       200:
 *         description: Lista de autores retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Autor'
 *       500:
 *         description: Erro ao buscar autores
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */


  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM autor');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar autores');
    }
  });

  // Rota para buscar um autor por email

  /**
 * @swagger
 * /autor/{email}:
 *   get:
 *     summary: Retorna um autor pelo e-mail
 *     tags:
 *       - Autor
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email do autor
 *     responses:
 *       200:
 *         description: Autor retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Autor'
 *       500:
 *         description: Erro ao buscar autor por email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro
 */

  router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const result = await pool.query('select usuario.nome_completo, revista.nome_revista, revista.descricao from usuario inner join autor using(email) WHERE email = $1', [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar autor por email' });
    }
  });

  // Rota para criar um novo autor

  /**
 * @swagger
 * /autor:
 *   post:
 *     summary: Cria um novo autor
 *     tags:
 *       - Autor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email do autor
 *             example:
 *               email: autor@example.com
 *     responses:
 *       201:
 *         description: Autor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Autor'
 *       400:
 *         description: Não é possível adicionar o e-mail como autor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro
 *       500:
 *         description: Erro ao criar novo autor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro
 */

  router.post('/', async (req, res) => {
    try {
      const { email } = req.body;
      const autorResult = await pool.query("SELECT * FROM administrador WHERE email = $1", [email]);
      if (autorResult.rows.length > 0) {
        res.status(400).json({ message: 'Não é possível adicionar este e-mail como autor, pois já está registrado como administrador.' });
      } else {
        const result = await pool.query("INSERT INTO autor (email, cargo) VALUES ($1, 'Autor') RETURNING *", [email]);
        res.status(201).json(result.rows[0]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar novo autor' });
    }
  });


  // Rota para atualizar um autor existente

  /**
 * @swagger
 * /autor/{email}:
 *   put:
 *     summary: Atualiza um autor existente
 *     tags:
 *       - Autor
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email do autor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cargo:
 *                 type: string
 *                 description: Cargo do autor
 *             example:
 *               cargo: Revisor
 *     responses:
 *       200:
 *         description: Autor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Autor'
 *       500:
 *         description: Erro ao atualizar autor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro
 */

  router.put('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const { cargo } = req.body;
      const result = await pool.query('UPDATE autor SET cargo = $1 WHERE email = $2 RETURNING *', [cargo, email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar autor' });
    }
  });

  // Rota para deletar um autor existente

  /**
 * @swagger
 * /autor/{email}:
 *   delete:
 *     summary: Exclui um autor
 *     tags:
 *       - Autor
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email do autor
 *     responses:
 *       204:
 *         description: Autor excluído com sucesso
 *       500:
 *         description: Erro ao excluir autor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro
 */

  router.delete('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      await pool.query('DELETE FROM autor WHERE email = $1', [email]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar autor' });
    }
  });


  return router;
};
