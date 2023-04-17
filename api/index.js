const express = require('express');
const app = express();
const pool = require('./database');
const porta = 8000
const usuariosRoutes = require('./routes/usuarios')(pool);
const editorRoutes = require('./routes/editor')(pool);
const papelRoutes = require('./routes/papel')(pool);


app.use('/usuarios', usuariosRoutes);
app.use('/papel', papelRoutes);
app.use('/editor', editorRoutes);



app.listen(porta, () => {
  console.log('Servidor iniciado na porta '+ porta);
});
