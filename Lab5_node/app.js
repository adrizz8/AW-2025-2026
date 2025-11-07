// app.js
const http = require('http');
const manejarRutas = require('./routes');

const servidor = http.createServer((req, res) => {
    manejarRutas(req, res);
});

const PORT = 3000;

servidor.listen(PORT, (error) => {
    if (error) {
        console.error('❌ Error al iniciar el servidor:', error);
    } else {
        console.log(`✅ Servidor iniciado en http://localhost:${PORT}`);
    }
});
