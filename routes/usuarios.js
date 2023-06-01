const express = require('express');
const router = express.Router();

const authenticate = (req, res, next) => {
  const isAuthenticated = true;

  if (isAuthenticated) {
    next();
  } else {
    res.status(401).send('Não autorizado');
  }
};

module.exports = (pool) => {
  // Rota para buscar todos os usuários
  router.get('/', authenticate, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM usuario');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuários');
    }
  });

  //Rota para autentificar um usuario

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - cpf
 *         - nome
 *         - data_nascimento
 *       properties:
 *         cpf:
 *           type: integer
 *           description: CPF do usuário
 *         nome:
 *           type: string
 *           description: Nome do usuário
 *         data_nascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do usuário
 *       example:
 *         cpf: 12345678901
 *         nome: João da Silva
 *         data_nascimento: 2000-01-01
 */

/**
 * @swagger
 * /usuarios/{email}/{senha}:
 *   get:
 *     summary: Autentica um usuário
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email do usuário
 *       - in: path
 *         name: senha
 *         schema:
 *           type: string
 *         required: true
 *         description: Senha do usuário
 *     responses:
 *       200:
 *         description: Usuário autenticado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Erro ao buscar usuário
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */


  router.get('/:email/:senha', authenticate, async (req, res) => {
    const { email, senha } = req.params;
    try {
      const result = await pool.query('SELECT * FROM usuario WHERE email = $1 and senha = $2', [email, senha]);
      if (result.rows.length === 0) {
        res.status(404).send('Usuario não encontrado');
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuário');
    }
  });

  // Rota para buscar um usuário por email

  /**
 * @swagger
 * /usuarios/{email}:
 *   get:
 *     summary: Busca um usuário por e-mail
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Erro ao buscar usuário
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */

  router.get('/:email', authenticate, async (req, res) => {
    const { email } = req.params;
    try {
      const result = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        res.status(404).send('Usuário não encontrado');
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar usuário');
    }
  });

  // Rota para criar um usuário


  /**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     tags:
 *       - Usuários
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *               nome_completo:
 *                 type: string
 *                 description: Nome completo do usuário
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *               telefone:
 *                 type: string
 *                 description: Telefone do usuário
 *               departamento:
 *                 type: string
 *                 description: Departamento do usuário
 *               universidade:
 *                 type: string
 *                 description: Universidade do usuário
 *             example:
 *               email: andre@gmail.com
 *               nome_completo: André Britto de Carvalho
 *               senha: senha123456
 *               telefone: (11) 98765-4321
 *               departamento: DCOMP
 *               universidade: UFS
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Erro ao criar usuário
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */

  router.post('/', authenticate, (req, res) => {
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
            'INSERT INTO autor (email, cargo) VALUES ($1, $2)',
            [email, 'Autor'],
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
  
//rota que atualiza as informações de um usuário a partir do seu email


/**
 * @swagger
 * /usuarios/{email}:
 *   put:
 *     summary: Atualiza as informações de um usuário pelo e-mail
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome_completo:
 *                 type: string
 *                 description: Nome completo do usuário
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *               telefone:
 *                 type: string
 *                 description: Telefone do usuário
 *               departamento:
 *                 type: string
 *                 description: Departamento do usuário
 *               universidade:
 *                 type: string
 *                 description: Universidade do usuário
 *               descricao:
 *                 type: string
 *                 description: Descrição do usuário
 *               link_imagem:
 *                 type: string
 *                 description: Link da imagem do usuário
 *             example:
 *               nome_completo: André Britto de Carvalho
 *               senha: novaSenha12345
 *               telefone: (11) 98765-4321
 *               departamento: DCOMP
 *               universidade: UFS
 *               descricao: Descrição do usuário
 *               link_imagem: https://example.com/imagem.jpg
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Erro ao atualizar usuário
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */

  router.put('/:email', authenticate, (req, res) => {
    const { nome_completo, senha, telefone, departamento, universidade, descricao, link_imagem } = req.body;
    const { email } = req.params;
  
    pool.query('UPDATE usuario SET nome_completo = $1, senha = $2, telefone = $3, departamento = $4, universidade = $5, descricao = $6, link_imagem = $7 WHERE email = $8',
      [nome_completo, senha, telefone, departamento, universidade, descricao, link_imagem, email],
      async (error, result) => {
        if (error) {
          res.status(500).send(error.message);
        } else if (result.rowCount === 0) {
          res.status(404).send('Usuário não encontrado');
        } else {
          // Insere o email na tabela autor
          try {
            const queryAutor = await pool.query("INSERT INTO autor (email, cargo) VALUES ($1, 'Autor') RETURNING *", [email]);
            console.log(`Email ${email} inserido na tabela autor com sucesso!`);
          } catch (err) {
            console.error(err);
          }
          res.status(200).send('Usuário atualizado com sucesso!');
        }
      }
    );
  });
  
// rota que deleta um usuário recebendo o seu email

/**
 * @swagger
 * /usuarios/{email}:
 *   delete:
 *     summary: Exclui um usuário pelo e-mail
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email do usuário
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Erro ao excluir usuário
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */

  router.delete('/:email', authenticate, (req, res) => {
    const { email } = req.params;
    pool.query('DELETE FROM usuario WHERE email = $1', [email], (error, result) => {
      if (error) {
        res.status(500).send(error.message);
      } else if (result.rowCount === 0) {
        res.status(404).send('Usuário não encontrado');
      } else {
        res.status(200).send('Usuário excluído com sucesso!');
      }
    });
  });

  return router;
};    