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
      
      

  return router;
};
