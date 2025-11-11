import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const initMap = (mapId = 'map') => {
  const mapElement = document.getElementById(mapId);
  if (!mapElement) {
    console.error(`Element dengan id="${mapId}" tidak ditemukan.`);
    return null;
  }

  const map = L.map(mapElement, {
    center: [-2.5, 118],
    zoom: 5,
    minZoom: 4,
    maxZoom: 12,
    worldCopyJump: true,
  });

  // Base layer
  const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  });

  // Control layer
  L.control.layers({
    'Street View': streetLayer,
    'Satellite': satelliteLayer,
  }).addTo(map);

  // Icon
  const customIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });

  return { map, customIcon };
};

export default initMap;
