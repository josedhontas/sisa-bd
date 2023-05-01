const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  router.post('/', (req, res) => {
    const { id_artigo, msg_revisor, email_revisor } = req.body;

    // Primeiro, busca pelo ID do revisor com base no email fornecido
    const query1 = 'SELECT id_revisor FROM revisor WHERE email = $1';
    const values1 = [email_revisor];
    pool.query(query1, values1, (error1, results1) => {
      if (error1) {
        console.error(error1);
        res.status(500).send('Erro interno do servidor');
        return;
      }

      // Se encontrou um revisor com esse email, use o ID dele para inserir na tabela revisa
      if (results1.rowCount > 0) {
        const id_revisor = results1.rows[0].id_revisor;
        const query2 = 'INSERT INTO revisa (id_artigo, id_revisor, msg_revisor) VALUES ($1, $2, $3)';
        const values2 = [id_artigo, id_revisor, msg_revisor];
        pool.query(query2, values2, (error2, results2) => {
          if (error2) {
            console.error(error2);
            res.status(500).send('Erro interno do servidor');
          } else {
            res.status(201).send('Revisão adicionada com sucesso!');
          }
        });
      }
      // Se não encontrou, busca pelo email na tabela usuário para inserir um novo revisor
      else {
        const query3 = 'SELECT email FROM usuario WHERE email = $1';
        const values3 = [email_revisor];
        pool.query(query3, values3, (error3, results3) => {
          if (error3) {
            console.error(error3);
            res.status(500).send('Erro interno do servidor');
            return;
          }
          // Se encontrou um usuário com esse email, insere um novo revisor e usa o ID gerado para inserir na tabela revisa
          if (results3.rowCount > 0) {
            const query4 = 'INSERT INTO revisor (email) VALUES ($1) RETURNING id_revisor';
            const values4 = [email_revisor];
            pool.query(query4, values4, (error4, results4) => {
              if (error4) {
                console.error(error4);
                res.status(500).send('Erro interno do servidor');
                return;
              }
              const id_revisor = results4.rows[0].id_revisor;
              const query5 = 'INSERT INTO revisa (id_artigo, id_revisor, msg_revisor) VALUES ($1, $2, $3)';
              const values5 = [id_artigo, id_revisor, msg_revisor];
              pool.query(query5, values5, (error5, results5) => {
                if (error5) {
                  console.error(error5);
                  res.status(500).send('Erro interno do servidor');
                } else {
                  res.status(201).send('Revisão adicionada com sucesso!');
                }
              });
            });
          }
          // Se não encontrou um usuário com esse email, não é possível inserir um revisor sem um usuário correspondente
          else {
            res.status(400).send('Não foi possível adicionar a revisão: email de revisor inválido.');
          }
        });
      }
    });
  });


  router.get('/:email/:boleano', async (req, res) => {
    try {
      const { email, boleano } = req.params;

      const condition = boleano === 'true' ? '= true' : '= false';


      const result = await pool.query(
        `SELECT artigo.nome_artigo, revisa.id_revisa, revista.nome_revista, artigo.link_artigo,
            (SELECT nome_completo FROM usuario WHERE email = autor.email) AS nome_autor,
            (SELECT nome_completo FROM usuario WHERE email = editor.email) AS nome_editor
            FROM revisor
            INNER JOIN revisa ON revisor.id_revisor = revisa.id_revisor
            INNER JOIN artigo ON revisa.id_artigo = artigo.id_artigo
            INNER JOIN submete ON artigo.id_artigo = submete.id_artigo
            INNER JOIN autor ON submete.id_autor = autor.id_autor
            INNER JOIN revista ON artigo.id_revista = revista.id_revista
            INNER JOIN trabalha_editor ON trabalha_editor.id_revista = revista.id_revista
            INNER JOIN editor ON trabalha_editor.id_editor = editor.id_editor
            WHERE revisor.email = $1 AND revisa.aceito ${condition}`,
        [email]
      );

      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar informações do revisor por email' });
    }
  });
  router.get('/r/revisores/:id_artigo', async (req, res) => {
    try {
      const idArtigo = parseInt(req.params.id_artigo);
  
      // Consulta SQL para obter os revisores associados ao artigo
      const consulta = `
        SELECT usuario.nome_completo, usuario.email, revisa.id_revisa
        FROM usuario
        INNER JOIN revisor ON usuario.email = revisor.email
        INNER JOIN revisa ON revisor.id_revisor = revisa.id_revisor
        WHERE revisa.id_artigo = $1
      `;
  
      const resultado = await pool.query(consulta, [idArtigo]);
  
      res.json(resultado.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro do servidor');
    }
  });


  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM revisa WHERE id_revisa = $1', [id]);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar' });
    }
  });


  router.put('/:id', async (req, res) => {
    const id = req.params.id; // aqui estamos acessando o valor do parâmetro 'id'
    const { avaliacao, comentario } = req.body;
    try {
      const result = await pool.query(
        'UPDATE revisa SET avaliacao = $1, comentario = $2 WHERE id_revisa = $3',
        [avaliacao, comentario, id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro ao atualizar informações de revisão');
    }
  });


  router.put('/aceito/:id', async (req, res) => {
    const { id } = req.params;
    const { aceito } = req.body;

    try {
      const result = await pool.query('UPDATE revisa SET aceito = $1 WHERE id_revisa = $2', [aceito, id]);
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/revisor/:email/', async (req, res) => {
    const { email} = req.params;
    const { id_artigo } = req.body;
    
    try {
        // Verificar se o revisor existe
        const revisorExists = await pool.query(
            'SELECT id_revisor FROM revisor WHERE email = $1',
            [email]
        );

        let id_revisor;

        // Se o revisor já existir, obter seu id
        if (revisorExists.rows.length > 0) {
            id_revisor = revisorExists.rows[0].id_revisor;
        } else { // Se o revisor não existir, criar um novo revisor
            const newRevisor = await pool.query(
                'INSERT INTO revisor (email) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id_revisor',
                [email]
            );
            id_revisor = newRevisor.rows[0].id_revisor;
        }

        // Verificar se já existe uma revisão para o artigo
        const revisaExists = await pool.query(
            'SELECT * FROM revisa WHERE id_artigo = $1',
            [id_artigo]
        );

        if (revisaExists.rows.length > 1) { // Se já existe dois revisores, atualizar o ultimo revisor existente
            const updateRevisa = await pool.query(
                'UPDATE revisa SET id_revisor = $1, aceito = false WHERE id_artigo = $2',
                [id_revisor, id_artigo]
            );

            res.send(`Revisa atualizada com sucesso para o artigo de id ${id_artigo}`);
        } else { // Se não existe uma revisão, criar uma nova revisão
            const newRevisa = await pool.query(
                'INSERT INTO revisa (id_artigo, id_revisor, aceito) VALUES ($1, $2, false)',
                [id_artigo, id_revisor]
            );

            res.send(`Nova revisa criada com sucesso para o artigo de id ${id_artigo}`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno no servidor');
    }
});


  return router;
};
