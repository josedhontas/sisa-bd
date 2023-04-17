const express = require('express');
const app = express();
const pool = require('./database');
const porta = 8000
const usuariosRoutes = require('./routes/usuarios')(pool);
const editorRoutes = require('./routes/editor')(pool);
const papelRoutes = require('./routes/papel')(pool);
const autorRoutes = require('./routes/autor')(pool);
const revisorRoutes = require('./routes/revisor')(pool);
const gestorRoutes = require('./routes/gestor')(pool);
const administradorRoutes = require('./routes/administrador')(pool);





app.use('/usuarios', usuariosRoutes);
app.use('/papel', papelRoutes);
app.use('/editor', editorRoutes);
app.use('/autor', autorRoutes);
app.use('/revisor', revisorRoutes);
app.use('/gestor', gestorRoutes);




app.listen(porta, () => {
  console.log('Servidor iniciado na porta '+ porta);
});
