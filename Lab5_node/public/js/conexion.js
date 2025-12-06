const mysql = require('mysql2');

// Crear pool de conexiones
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'moveit',
  waitForConnections: true,
  connectionLimit: 10, // Número máximo de conexiones simultáneas
  queueLimit: 0, // 0 = sin límite de cola
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Verificar la conexión inicial
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL exitosamente");
  connection.release(); // Liberar la conexión de vuelta al pool
});

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('La conexión con la base de datos se perdió');
  }
});

module.exports = pool;