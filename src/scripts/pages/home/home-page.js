import CONFIG from '../../config';
import initMap from '../../utils/map';

export default class HomePage {
  async render() {
    return `
      <section 
        class="map-section" 
        style="width:100vw; height:100vh; margin:0; padding:0; position:relative;"
        aria-label="Peta interaktif StoryMap. Tekan Tab untuk melompat ke marker cerita."
      >
        <h1 class="map-title">
          Peta Kisah
        </h1>

        <div 
          id="map" 
          style="width:100%; height:100%;" 
          role="region"
          aria-label="Peta cerita pengguna"
          aria-describedby="map-desc"
        ></div>
        <p id="map-desc" class="visually-hidden">
          Peta menampilkan lokasi cerita pengguna. Gunakan Tab untuk fokus pada tombol detail setelah membuka marker.
        </p>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    const { map, customIcon } = initMap();
    if (!map) return;

    const style = document.createElement('style');
    style.innerHTML = `
      .visually-hidden {
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }

      /* Nonaktifkan pembacaan screen reader pada elemen marker dan tile */
      .leaflet-marker-icon,
      .leaflet-pane,
      .leaflet-tile,
      .leaflet-shadow-pane img,
      .leaflet-marker-shadow,
      .leaflet-control-container {
        aria-hidden: true !important;
        role: presentation !important;
      }
    `;
    document.head.appendChild(style);

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${CONFIG.BASE_URL}/stories?location=1`, { headers });
      const result = await response.json();

      if (result.error) throw new Error(result.message);

      let activeMarker = null;

      // Ikon Marker
      const highlightIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149060.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -36],
      });

      result.listStory.forEach((story) => {
        if (story.lat && story.lon) {
          const marker = L.marker([story.lat, story.lon], { icon: customIcon }).addTo(map);

          // Disable Marker from screen reading
          const markerEl = marker._icon;
          if (markerEl) {
            markerEl.setAttribute('aria-hidden', 'true');
            markerEl.setAttribute('role', 'presentation');
          }

          marker.bindPopup(`
            <div style="text-align:center; max-width:200px;">
              <img 
                src="${story.photoUrl}" 
                alt="Foto cerita milik ${story.name}" 
                style="width:160px;height:90px;object-fit:cover;border-radius:6px;margin-bottom:6px;">
              <h4 style="margin:4px 0;">${story.name}</h4>
              <button 
                id="view-${story.id}" 
                class="btn-detail" 
                tabindex="0"
                aria-label="Cerita milik ${story.name}, pergi ke detail"
              >
                Lihat Detail
              </button>
            </div>
          `);

          // Highlight marker
          marker.on('click', () => {
            if (activeMarker && activeMarker !== marker) {
              activeMarker.setIcon(customIcon);
            }
            marker.setIcon(highlightIcon);
            activeMarker = marker;
          });

          // Reset marker
          marker.on('popupclose', () => {
            if (activeMarker === marker) {
              marker.setIcon(customIcon);
              activeMarker = null;
            }
          });

          // Fokus otomatis ke tombol di popup
          marker.on('popupopen', () => {
            setTimeout(() => {
              const btn = document.querySelector(`#view-${story.id}`);
              if (btn) {
                btn.focus();
                btn.addEventListener('click', () => {
                  window.location.hash = `#/details/${story.id}`;
                });
                btn.addEventListener('keypress', (event) => {
                  if (event.key === 'Enter') {
                    window.location.hash = `#/details/${story.id}`;
                  }
                });
              }
            }, 100);
          });
        }
      });
    } catch (err) {
      console.error('Gagal memuat story:', err);
      alert('Gagal memuat peta cerita. Silakan coba lagi.');
    }
  }
}
