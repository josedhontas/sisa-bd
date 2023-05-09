const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  

  // Rota para buscar todos os administradores e o nome

  /**
 * @swagger
 * /administrador:
 *   get:
 *     summary: Busca todos os administradores e seus nomes
 *     tags:
 *       - Administrador
 *     responses:
 *       200:
 *         description: Sucesso ao buscar os administradores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nome_completo:
 *                     type: string
 *                     description: Nome completo do administrador
 *                   email:
 *                     type: string
 *                     description: E-mail do administrador
 *                   cargo:
 *                     type: string
 *                     description: Cargo do administrador
 *       500:
 *         description: Erro ao buscar administradores
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Erro ao buscar administradores.
 */

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT usuario.nome_completo, usuario.email, administrador.cargo FROM usuario INNER JOIN administrador USING(email)');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar administradores');
    }
  });

  //rota autenticar admin por email e senha

  /**
 * @swagger
 * /administrador/{email}/{senha}:
 *   get:
 *     summary: Autentica um administrador por e-mail e senha
 *     tags:
 *       - Administrador
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: E-mail do administrador
 *       - in: path
 *         name: senha
 *         schema:
 *           type: string
 *         required: true
 *         description: Senha do administrador
 *     responses:
 *       200:
 *         description: Sucesso ao autenticar o administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nome_completo:
 *                   type: string
 *                   description: Nome completo do administrador
 *                 email:
 *                   type: string
 *                   description: E-mail do administrador
 *                 cargo:
 *                   type: string
 *                   description: Cargo do administrador
 *       404:
 *         description: Admin não encontrado
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Admin não encontrado
 *       500:
 *         description: Erro ao buscar usuário
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Erro ao buscar usuário
 */

  router.get('/:email/:senha', async (req, res) => {
    const { email, senha } = req.params;
    try {
      const result = await pool.query('SELECT * FROM usuario join administrador using(email) WHERE email = $1 and senha = $2', [email, senha]);
      if (result.rows.length === 0) {
        res.status(404).send('Admin não encontrado');
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuário');
    }
  });

  //Rota para verificar de Administrador é válido
  router.get('/:email', async ()=>{

  });
  /**
 * @swagger
 * /administrador/{email}:
 *   get:
 *     summary: Busca um administrador pelo e-mail
 *     tags:
 *       - Administrador
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: E-mail do administrador a ser buscado
 *     responses:
 *       200:
 *         description: Administrador encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nome_completo:
 *                   type: string
 *                   description: Nome completo do administrador
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   description: E-mail do administrador
 *                   example: john.doe@example.com
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao buscar administrador por email
 *       404:
 *         description: Administrador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Administrador não encontrado
 */


  // Rota para buscar um administrador por email
  router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const result = await pool.query('select usuario.nome_completo, usuario.email from usuario inner join administrador using(email) WHERE email = $1', [email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar administrador por email' });
    }
  });

  //Rota responsável por cadastrar administrador

  /**
 * @swagger
 * /administrador:
 *   post:
 *     summary: Cadastra um administrador
 *     tags:
 *       - Administrador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: E-mail do administrador
 *               nome_completo:
 *                 type: string
 *                 description: Nome completo do administrador
 *               senha:
 *                 type: string
 *                 description: Senha do administrador
 *               telefone:
 *                 type: string
 *                 description: Telefone do administrador
 *               departamento:
 *                 type: string
 *                 description: Departamento do administrador
 *               universidade:
 *                 type: string
 *                 description: Universidade do administrador
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Usuário criado com sucesso!
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Erro interno do servidor
 */

  router.post('/', (req, res) => {
    const { email, nome_completo, senha, telefone, departamento, universidade } = req.body;
  
    // Realizar a inserção no banco de dados
    pool.query(
      'INSERT INTO usuario (email, nome_completo, senha, telefone, departamento, universidade) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, nome_completo, senha, telefone, departamento, universidade],
      (error, result) => {
        if (error) {
          res.status(500).send(error.message);
        } else {
          // Adicionar usuário à tabela "autor"
          pool.query(
            'INSERT INTO administrador (email, cargo) VALUES ($1, $2)',
            [email, 'Administrador Inválido'],
            (error, result) => {
              if (error) {
                res.status(500).send(error.message);
              } else {
                res.status(201).send('Usuário criado com sucesso!');
              }
            }
          );
        }
      }
    );
  });
  


  // Rota para atualizar um administrador existente

  /**
 * @swagger
 * /administrador/{email}:
 *   put:
 *     summary: Atualiza um administrador existente
 *     tags:
 *       - Administrador
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: E-mail do administrador a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cargo:
 *                 type: string
 *                 description: Cargo do administrador
 *     responses:
 *       200:
 *         description: Administrador atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: E-mail do administrador
 *                 cargo:
 *                   type: string
 *                   description: Cargo do administrador
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Erro ao atualizar administrador
 *       404:
 *         description: Administrador não encontrado
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Administrador não encontrado
 */

  router.put('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const { cargo } = req.body;
      const result = await pool.query('UPDATE administrador SET cargo = $1 WHERE email = $2 RETURNING *', [cargo, email]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar administrador' });
    }
  });

  // Rota para deletar um administrador existente

  /**
 * @swagger
 * /administrador/{email}:
 *   delete:
 *     summary: Exclui um administrador existente
 *     tags:
 *       - Administrador
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: E-mail do administrador a ser excluído
 *     responses:
 *       204:
 *         description: Administrador excluído com sucesso
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao deletar administrador
 *       404:
 *         description: Administrador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Administrador não encontrado
 */

  router.delete('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      await pool.query('DELETE FROM administrador WHERE email = $1', [email]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar administrador' });
    }
  });


  return router;
};