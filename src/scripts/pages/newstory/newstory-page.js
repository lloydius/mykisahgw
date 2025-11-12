import CONFIG from '../../config';
import initMap from '../../utils/map';
import '../../../styles/newstory.css';

export default class NewStoryPage {
    async render() {
        return `
      <section class="container new-story">
        <h1>Tambah Cerita Baru</h1>

        <form id="new-story-form" class="story-form">
          <div class="form-group">
            <label for="description">Deskripsi Cerita</label>
            <textarea id="description" rows="3" placeholder="Tulis cerita kamu..." required></textarea>
          </div>

          <div class="form-group">
            <label for="photo">Upload Gambar</label>
            <input type="file" id="photo" accept="image/*" required />
          </div>

          <div class="form-group">
            <button type="button" id="cameraButton">Gunakan Kamera</button>
            <button type="button" id="captureButton" style="display:none;">Ambil Foto</button>
            <video id="cameraPreview" autoplay playsinline style="display:none; width:100%; border-radius:6px;"></video>
            <canvas id="photoCanvas" style="display:none;"></canvas>
            <img id="imagePreview" alt="Preview Gambar" style="display:none; width:100%; margin-top:10px; border-radius:6px; object-fit:cover;">
          </div>

          <div class="form-group">
            <label>Pilih Lokasi di Peta</label>
            <div id="map" class="story-map"></div>
            <p id="location-display">Klik peta untuk memilih lokasi.</p>
          </div>

          <button type="submit" class="btn-submit">Kirim Cerita</button>
          <p id="form-message" class="form-message"></p>
        </form>
      </section>
    `;
    }

    async afterRender() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.hash = '#/login';
            return;
        }

        const { map, customIcon } = initMap();
        if (!map) return;

        let selectedLat = null;
        let selectedLon = null;
        let marker = null;

        // Location
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            selectedLat = lat;
            selectedLon = lng;
            document.querySelector('#location-display').textContent = `Lokasi: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        });

        // Camera and Preview
        const cameraButton = document.querySelector('#cameraButton');
        const captureButton = document.querySelector('#captureButton');
        const cameraPreview = document.querySelector('#cameraPreview');
        const photoCanvas = document.querySelector('#photoCanvas');
        const photoInput = document.querySelector('#photo');
        const imagePreview = document.querySelector('#imagePreview');

        let mediaStream = null;

        cameraButton.addEventListener('click', async () => {
            if (!mediaStream) {
                try {
                    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    cameraPreview.srcObject = mediaStream;
                    cameraPreview.style.display = 'block';
                    captureButton.style.display = 'inline-block';
                    cameraButton.textContent = 'Tutup Kamera';
                } catch (error) {
                    alert('Tidak bisa mengakses kamera.');
                }
            } else {
                const tracks = mediaStream.getTracks();
                tracks.forEach((t) => t.stop());
                mediaStream = null;
                cameraPreview.style.display = 'none';
                captureButton.style.display = 'none';
                cameraButton.textContent = 'Gunakan Kamera';
            }
        });

        captureButton.addEventListener('click', () => {
            if (!mediaStream) return;

            const video = cameraPreview;
            const canvas = photoCanvas;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const file = new File([blob], 'captured_photo.jpg', { type: 'image/jpeg' });

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                photoInput.files = dataTransfer.files;

                const url = URL.createObjectURL(blob);
                imagePreview.src = url;
                imagePreview.style.display = 'block';

                alert('📸 Foto berhasil diambil!');
            }, 'image/jpeg');
        });

        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                imagePreview.src = url;
                imagePreview.style.display = 'block';
            } else {
                imagePreview.style.display = 'none';
            }
        });

        // Submit Form
        const form = document.querySelector('#new-story-form');
        const message = document.querySelector('#form-message');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const description = document.querySelector('#description').value.trim();
            const photoFile = photoInput.files[0];

            if (!description || !photoFile) {
                message.textContent = 'Isi semua field dan pilih gambar.';
                message.style.color = 'red';
                return;
            }

            if (!selectedLat || !selectedLon) {
                message.textContent = 'Pilih lokasi di peta dulu.';
                message.style.color = 'red';
                return;
            }

            const formData = new FormData();
            formData.append('description', description);
            formData.append('photo', photoFile);
            formData.append('lat', selectedLat);
            formData.append('lon', selectedLon);

            try {
                const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                const result = await response.json();

                if (!result.error) {
                    message.textContent = 'Cerita berhasil dikirim!';
                    message.style.color = 'green';
                    form.reset();
                    imagePreview.style.display = 'none';
                    document.querySelector('#location-display').textContent = 'Klik peta untuk memilih lokasi.';
                    if (marker) map.removeLayer(marker);

                    setTimeout(() => {
                        window.location.hash = '#/';
                    }, 1500);
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error(error);
                message.textContent = 'Gagal mengirim cerita. Coba lagi.';
                message.style.color = 'red';
            }
        });

        // Camera Close
        window.addEventListener('beforeunload', () => {
            if (mediaStream) {
                const tracks = mediaStream.getTracks();
                tracks.forEach((t) => t.stop());
            }
        });
    }
}
