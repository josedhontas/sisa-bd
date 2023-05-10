const express = require('express');
const router = express.Router();

module.exports = (pool) => {


  // Rota para buscar todos os revisores

  /**
 * @swagger
 * /revisor:
 *   get:
 *     summary: Busca todos os revisores
 *     tags:
 *       - Revisor
 *     responses:
 *       200:
 *         description: Lista de revisores encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Revisor'
 */

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM revisor inner join usuario using(emaiL)');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar revisores');
    }
  });
  //rota que retorna o revisor a partir do email

  /**
 * @swagger
 * /revisor/{email}:
 *   get:
 *     summary: Retorna um revisor pelo email
 *     tags:
 *       - Revisor
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email do revisor a ser retornado
 *     responses:
 *       200:
 *         description: Revisor encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Revisor'
 *       404:
 *         description: Revisor não encontrado
 */

  router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const result = await pool.query('SELECT * FROM revisor inner join usuario using(email) WHERE email = $1' , [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar revisor por email' });
    }
  });

  // Rota para criar um novo revisor

  /**
 * @swagger
 * /revisor:
 *   post:
 *     summary: Cria um novo revisor
 *     tags:
 *       - Revisor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoRevisor'
 *     responses:
 *       201:
 *         description: Revisor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Revisor'
 *       500:
 *         description: Erro ao criar novo revisor
 */

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

  /**
 * @swagger
 * /revisor/{email}:
 *   put:
 *     summary: Atualiza um revisor existente
 *     tags:
 *       - Revisor
 *     parameters:
 *       - name: email
 *         in: path
 *         description: Email do revisor a ser atualizado
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizaRevisor'
 *     responses:
 *       200:
 *         description: Revisor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Revisor'
 *       500:
 *         description: Erro ao atualizar revisor
 */

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

  /**
 * @swagger
 * /revisor/{email}:
 *   delete:
 *     summary: Deleta um revisor existente
 *     tags:
 *       - Revisor
 *     parameters:
 *       - name: email
 *         in: path
 *         description: Email do revisor a ser deletado
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Revisor deletado com sucesso
 *       500:
 *         description: Erro ao deletar revisor
 */

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

  //essa rota recebe como parâmetro o email um editor e retorna todos os possíveis revisores
  //para um artigo

  /**
 * @swagger
 * /revisor/revisoresPossiveis/{email}:
 *   get:
 *     summary: Retorna todos os possíveis revisores para um artigo
 *     tags:
 *       - Revisor
 *     parameters:
 *       - name: email
 *         in: path
 *         description: Email do editor
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de revisores possíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Revisor'
 *       500:
 *         description: Erro ao buscar revisores
 */

  router.get('/revisoresPossiveis/:email', async (req, res)=>{
    const {email} = req.params;
    try {
      const result = await  pool.query(`SELECT nome_completo, email, descricao, universidade FROM usuario WHERE email not in (SELECT email FROM administrador) and email != $1`, [email]);
      res.json(result.rows);
    } catch(error){
      res.status(500).json({message: 'erro ao buscar revisores'})
    }
  })

  return router;
};
