const express = require('express');
const app = express();
const usuariosRouter = require('./routes/usuarios');
const swagger = require('./swagger');

app.use(express.json());

app.use('/usuarios', usuariosRouter);

swagger(app);

app.listen(8000, () => {
  console.log('Servidor iniciado na porta 8000');
});
