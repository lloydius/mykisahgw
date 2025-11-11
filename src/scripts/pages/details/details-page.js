import CONFIG from '../../config';
import Database from '../../data/database';

export default class DetailPage {
  async render() {
    return `
      <section class="container detail-page">
        <div id="detail-container" class="detail-container"></div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    const url = window.location.hash.split('/');
    const storyId = url[url.length - 1];
    const container = document.querySelector('#detail-container');

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.error) throw new Error(result.message);
      const story = result.story;

      let isBookmarked = await Database.isBookmarked(story.id);

      // Render konten
      container.innerHTML = `
        <article class="story-detail" role="article" aria-labelledby="story-title">
          <h1 id="story-title" class="detail-title" tabindex="0">Cerita punya ${story.name}</h1>

          <img 
            src="${story.photoUrl}" 
            alt="Foto cerita milik ${story.name}" 
            class="detail-image"
            tabindex="0"
          />

          <div class="detail-info">
            <p><strong>Nama Pembuat:</strong> ${story.name}</p>
            <p><strong>Tanggal Dibuat:</strong> 
              ${new Date(story.createdAt).toLocaleString('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
      })}
            </p>

            <p><strong>Deskripsi:</strong></p>
            <p class="detail-desc">${story.description}</p>
          </div>

          <div class="button-group">
            <button id="bookmarkButton" class="btn-bookmark" aria-label="Simpan cerita ini">
              ${isBookmarked ? 'Hapus Cerita' : 'Simpan Cerita'}
            </button>

            <button id="backButton" class="btn-back" aria-label="Kembali ke halaman peta">
              Kembali ke Peta
            </button>
          </div>
        </article>
      `;

      // Back Button
      document.querySelector('#backButton').addEventListener('click', () => {
        window.location.hash = '#/';
      });

      // Bookmark Button
      const bookmarkButton = document.querySelector('#bookmarkButton');
      bookmarkButton.addEventListener('click', async () => {
        isBookmarked = await Database.isBookmarked(story.id);

        if (isBookmarked) {
          await Database.deleteStory(story.id);
          bookmarkButton.textContent = 'Simpan Cerita';
          alert('Cerita dihapus dari bookmark.');
        } else {
          await Database.putStory(story);
          bookmarkButton.textContent = 'Hapus Cerita';
          alert('Cerita disimpan ke bookmark!');
        }

        isBookmarked = !isBookmarked;
      });
    } catch (err) {
      console.error('Gagal memuat detail story:', err);
      container.innerHTML = `<p style="color:red;" role="alert">Gagal memuat detail cerita.</p>`;
    }
  }
}
