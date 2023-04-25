const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./database');
const porta = 8000
const revistaRoutes = require('./routes/revista')(pool);
const usuariosRoutes = require('./routes/usuarios')(pool);
const editorRoutes = require('./routes/editor')(pool);
const autorRoutes = require('./routes/autor')(pool);
const revisorRoutes = require('./routes/revisor')(pool);
const gestorRoutes = require('./routes/gestor')(pool);
const administradorRoutes = require('./routes/administrador')(pool);
const artigoRoutes = require('./routes/artigo')(pool);
const avaliacaoRoutes = require('./routes/avaliacao')(pool);
const parecerRoutes = require('./routes/parecer')(pool);
const trabalha_administradorRoutes = require('./routes/trabalha_administrador')(pool);
const trabalhaEditorRoutes = require('./routes/trabalhaEditor')(pool);



app.use(express.json());

app.use(cors());
app.use('/usuarios', usuariosRoutes);
app.use('/editor', editorRoutes);
app.use('/autor', autorRoutes);
app.use('/revisor', revisorRoutes);
app.use('/gestor', gestorRoutes);
app.use('/administrador', administradorRoutes);
app.use('/artigo', artigoRoutes);
app.use('/avaliacao', avaliacaoRoutes);
app.use('/parecer', parecerRoutes);
app.use('/revista', revistaRoutes);
app.use('/trabalha_administrador', trabalha_administradorRoutes);
app.use('/trabalhaEditor', trabalhaEditorRoutes);




app.listen(porta, () => {
  console.log('Servidor iniciado na porta '+ porta);
});
