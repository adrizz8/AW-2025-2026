const express = require('express');
const router = express.Router();

const API_KEY = process.env.API_NINJAS_KEY;

const cache = {}; // { 'lat:lon:distance': { timestamp, data } }
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

// Concesionarios
const concesionarios = [
  {
    latitude: 40.4168,
    longitude: -3.7038,
    station_name: "Concesionario Centro ",
    type: 'dealer',
  },
  {
    latitude: 40.4070,
    longitude: -3.6540,
    station_name: "Concesionario Este ",
    type: 'dealer',
  },
  {
    latitude: 40.4310,
    longitude: -3.7160,
    station_name: "Concesionario Oeste ",
    type: 'dealer',
  },
];



router.get('/nearby', async (req, res) => {
  const { lat, lon, distance } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat y lon son obligatorios' });
  }

  const dist = distance || '5';
  const cacheKey = `${lat}:${lon}:${dist}`;
  const now = Date.now();

  // Comprobar caché
  const cached = cache[cacheKey];
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    console.log('Devolviendo datos desde caché para', cacheKey);
    return res.json(cached.data);
  }

  try {
    // Llamada real a la API externa
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      distance: dist,
    });

    const url = 'https://api.api-ninjas.com/v1/evcharger?' + params.toString();

    const apiRes = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
      },
    });

    console.log('STATUS API NINJAS:', apiRes.status, apiRes.statusText);

    if (!apiRes.ok) {
      const text = await apiRes.text();
      console.error('Respuesta de error de API Ninjas:', text);
      return res
        .status(502)
        .json({ error: 'Error en la API externa', status: apiRes.status, body: text });
    }

    const data = await apiRes.json();

    const chargers = data.map((ch) => ({
      latitude: ch.latitude,
      longitude: ch.longitude,
      station_name: ch.name || ch.address || 'Punto de recarga',
      type: 'charger',
    }));

    const allPoints = [...chargers, ...concesionarios];

    // Guardamos en caché
    cache[cacheKey] = {
      timestamp: now,
      data: allPoints,
    };

    res.json(allPoints);
  } catch (err) {
    console.error('Error cargadores:', err);
    res.status(500).json({ error: 'Error obteniendo cargadores' });
  }
});

module.exports = router;
