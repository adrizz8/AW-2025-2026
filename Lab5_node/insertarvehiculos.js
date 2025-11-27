const db = require('./public/js/conexion');

const concesionarios = [
{ nombre: 'AutoCenter Madrid', ciudad: 'Madrid', direccion: 'Calle Gran Vía, 25', telefono_contacto: '910123456' },
{ nombre: 'ElectroCars Barcelona', ciudad: 'Barcelona', direccion: 'Avinguda Diagonal, 450', telefono_contacto: '933456789' },
{ nombre: 'Green Motors Valencia', ciudad: 'Valencia', direccion: 'Calle Colón, 10', telefono_contacto: '963123789' },
{ nombre: 'EcoDrive Sevilla', ciudad: 'Sevilla', direccion: 'Avenida de la Constitución, 15', telefono_contacto: '954987654' }
];

const vehiculos = [
{ matricula: 'EV1001', marca: 'Tesla', modelo: 'Model 3', anio_matriculacion: 2023, numero_plazas: 5, autonomia_km: 500, color: 'Blanco', imagen: '/images/tesla_model3.jpg', estado: 'disponible', concesionario_index: 0 },
{ matricula: 'EV1002', marca: 'Nissan', modelo: 'Leaf', anio_matriculacion: 2022, numero_plazas: 5, autonomia_km: 385, color: 'Azul', imagen: '/images/nissan_leaf.jpg', estado: 'disponible', concesionario_index: 0 },
{ matricula: 'EV1003', marca: 'BMW', modelo: 'i3', anio_matriculacion: 2021, numero_plazas: 4, autonomia_km: 310, color: 'Negro', imagen: '/images/bmw_i3.jpg', estado: 'disponible', concesionario_index: 1 },
{ matricula: 'EV1004', marca: 'Hyundai', modelo: 'Kona Electric', anio_matriculacion: 2022, numero_plazas: 5, autonomia_km: 450, color: 'Rojo', imagen: '/images/hyundai_kona.jpg', estado: 'disponible', concesionario_index: 1 }
];

db.query('DELETE FROM vehiculos', err => {
if (err) return console.error(err);
console.log('Tabla vehiculos vaciada.');

db.query('DELETE FROM concesionarios', err => {
if (err) return console.error(err);
console.log('Tabla concesionarios vaciada.');


let concesionariosInsertados = [];
concesionarios.forEach((c, i) => {
  db.query(
    'INSERT INTO concesionarios (nombre, ciudad, direccion, telefono_contacto) VALUES (?, ?, ?, ?)',
    [c.nombre, c.ciudad, c.direccion, c.telefono_contacto],
    (err, result) => {
      if (err) return console.error(err);
      console.log(`Concesionario insertado: ${c.nombre}`);
      concesionariosInsertados[i] = result.insertId;

      if (concesionariosInsertados.filter(Boolean).length === concesionarios.length) {
        // Insertar vehículos con los IDs correctos
        vehiculos.forEach(v => {
          const id_concesionario_real = concesionariosInsertados[v.concesionario_index];
          db.query(
            'INSERT INTO vehiculos (matricula, marca, modelo, anio_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [v.matricula, v.marca, v.modelo, v.anio_matriculacion, v.numero_plazas, v.autonomia_km, v.color, v.imagen, v.estado, id_concesionario_real],
            (err, result) => {
              if (err) return console.error('Error insertando vehículo:', err);
              console.log(`Vehículo insertado: ${v.marca} ${v.modelo}`);
            }
          );
        });
      }
    }
  );
});


});
});
