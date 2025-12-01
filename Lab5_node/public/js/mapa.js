const mapDiv = document.getElementById('map');

let map;
let markersLayer;
let myLocationMarker;
let userLat;
let userLon;

// Iconos del mapa
const chargerIcon = L.icon({
  iconUrl: '/images/green_gps.png',
  shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [20, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dealerIcon = L.icon({
  iconUrl: '/images/red_gps.png',
  shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [20, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const myLocationIcon = L.icon({
  iconUrl: '/images/blue_gps.png',
  shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [20, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Leyenda
function addLegend(map) {
  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = `
      <div><img src="/images/green_gps.png" style="width:15px; vertical-align:middle"> Cargadores</div>
      <div><img src="/images/red_gps.png" style="width:15px; vertical-align:middle"> Concesionarios</div>
      <div><img src="/images/blue_gps.png" style="width:15px; vertical-align:middle"> Mi ubicación</div>
    `;
    return div;
  };

  legend.addTo(map);
}

// Distancia (km) entre dos coordenadas
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function updateNearest(userLat, userLon, points) {
  let nearestCharger = null;
  let nearestChargerDist = Infinity;

  let nearestDealer = null;
  let nearestDealerDist = Infinity;

  points.forEach((p) => {
    if (!p.latitude || !p.longitude) return;

    const d = distanceKm(userLat, userLon, p.latitude, p.longitude);

    if (p.type === 'charger') {
      if (d < nearestChargerDist) {
        nearestChargerDist = d;
        nearestCharger = p;
      }
    } else if (p.type === 'dealer') {
      if (d < nearestDealerDist) {
        nearestDealerDist = d;
        nearestDealer = p;
      }
    }
  });

  const chargerEl = document.getElementById('nearest-charger');
  const dealerEl = document.getElementById('nearest-dealer');

  if (nearestCharger) {
    chargerEl.textContent =
      `${nearestCharger.station_name} (${nearestChargerDist.toFixed(2)} km)`;
  } else {
    chargerEl.textContent = 'Cargador más cercano: no se han encontrado cargadores.';
  }

  if (nearestDealer) {
    dealerEl.textContent =
      `${nearestDealer.station_name} (${nearestDealerDist.toFixed(2)} km)`;
  } else {
    dealerEl.textContent = 'Concesionario más cercano: no se han encontrado concesionarios.';
  }
}

// Función principal: geolocalizar, crear mapa y cargar puntos
async function initMap() {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización');
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    userLat = pos.coords.latitude;
    userLon = pos.coords.longitude;

    // Crear mapa solo una vez
    if (!map) {
      map = L.map('map').setView([userLat, userLon], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      markersLayer = L.layerGroup().addTo(map);
      addLegend(map);
    } else {
      map.setView([userLat, userLon], 13);
    }

    // Marcador de mi ubicación
    if (myLocationMarker) {
      myLocationMarker.setLatLng([userLat, userLon]);
    } else {
      myLocationMarker = L.marker([userLat, userLon], { icon: myLocationIcon })
        .addTo(map)
        .bindPopup('Estás aquí');
    }

    const params = new URLSearchParams({
      lat: userLat.toString(),
      lon: userLon.toString(),
      distance: '5',
    });

    const res = await fetch('/api/chargers/nearby?' + params.toString());
    if (!res.ok) {
      alert('Error obteniendo puntos');
      return;
    }

    const points = await res.json();

    markersLayer.clearLayers();

    points.forEach((p) => {
      if (p.latitude && p.longitude) {
        const icon = p.type === 'dealer' ? dealerIcon : chargerIcon;

        L.marker([p.latitude, p.longitude], { icon })
          .addTo(markersLayer)
          .bindPopup(p.station_name || 'Punto');
      }
    });

    // Actualizar “más cercanos”
    updateNearest(userLat, userLon, points);
  }, (err) => {
    console.error('Error geolocalización:', err);
    alert('No se pudo obtener tu ubicación');
  });
}

document.addEventListener('DOMContentLoaded', initMap);
