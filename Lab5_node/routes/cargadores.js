const express = require('express');
const router = express.Router();

const API_KEY = process.env.API_NINJAS_KEY;

router.get('/nearby', async (req, res) => {
  const { lat, lon, distance } = req.query;

  console.log('query recibida:', req.query);

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat y lon son obligatorios' });
  }

  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      distance: distance || '5',
    });

    const url = 'https://api.api-ninjas.com/v1/evcharger?' + params.toString();
    console.log('URL que se llama:', url);

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
    }));

    res.json(chargers);
  } catch (err) {
    console.error('Error cargadores:', err);
    res.status(500).json({ error: 'Error obteniendo cargadores' });
  }
});

module.exports = router;


