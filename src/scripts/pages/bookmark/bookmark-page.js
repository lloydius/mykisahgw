import Database from '../../data/database';

export default class BookmarkPage {
    async render() {
        return `
      <section class="list-page">
        <h1 class="list-title">Cerita Tersimpan</h1>
        <div id="bookmark-list" class="story-list" aria-live="polite"></div>
      </section>
    `;
    }

    async afterRender() {
        const stories = await Database.getAllStories();
        const container = document.querySelector('#bookmark-list');

        if (stories.length === 0) {
            container.innerHTML = '<p>Tidak ada cerita yang disimpan.</p>';
            return;
        }
        //Sort
        const sortedStories = stories.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        container.innerHTML = '';

        sortedStories.forEach((story) => {
            const storyCard = document.createElement('div');
            storyCard.classList.add('story-card');
            storyCard.setAttribute('tabindex', '0');
            storyCard.setAttribute('aria-label', `Cerita milik ${story.name}. Pergi ke detail.`);

            storyCard.innerHTML = `
        <img 
          src="${story.photoUrl}" 
          alt="Foto cerita milik ${story.name}" 
          class="story-image"
        />
        <div class="story-info">
          <h3>${story.name}</h3>
          <p>${story.description || '(Tanpa deskripsi)'}</p>
          <p class="story-date">
            ${story.createdAt
                    ? new Date(story.createdAt).toLocaleString('id-ID')
                    : '(Tanggal tidak tersedia)'}
          </p>
          <button 
            class="detail-button" 
            aria-label="Lihat detail cerita milik ${story.name}" 
            data-id="${story.id}"
          >
            Lihat Detail
          </button>
        </div>
      `;

            container.appendChild(storyCard);
        });

        // Navigasi ke detail
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('detail-button')) {
                const storyId = e.target.getAttribute('data-id');
                window.location.hash = `#/details/${storyId}`;
            }
        });
    }
}
