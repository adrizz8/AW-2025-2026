const btn = document.getElementById('btn-cargadores');
const mapDiv = document.getElementById('map');

let map;

btn.addEventListener('click', () => {
  console.log()
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización');
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    if (!map) {
      map = L.map('map').setView([lat, lon], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    } else {
      map.setView([lat, lon], 13);
    }

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      distance: '5',
    });

    const res = await fetch('/api/chargers/nearby?' + params.toString());
    if (!res.ok) {
      alert('Error obteniendo cargadores');
      return;
    }

    const chargers = await res.json();

    chargers.forEach((ch) => {
      if (ch.latitude && ch.longitude) {
        L.marker([ch.latitude, ch.longitude])
          .addTo(map)
          .bindPopup(ch.station_name || 'Punto de recarga');
      }
    });
  });
});
