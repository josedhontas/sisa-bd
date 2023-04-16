const express = require('express');
const app = express();
const pool = require('./database');

const usuariosRoutes = require('./routes/usuarios')(pool);
app.use('/usuarios', usuariosRoutes);

app.listen(8000, () => {
  console.log('Servidor iniciado na porta 8000');
});
