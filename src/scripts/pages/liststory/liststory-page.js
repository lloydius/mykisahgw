import CONFIG from '../../config';

export default class ListPage {
  async render() {
    return `
      <section class="list-page">
        <h1 class="list-title">Daftar Cerita Terbaru</h1>
        <div id="story-list" class="story-list" aria-live="polite">
        </div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, { headers });
      const result = await response.json();

      if (result.error) throw new Error(result.message);

      //Sort
      const sortedStories = result.listStory.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const storyContainer = document.querySelector('#story-list');
      storyContainer.innerHTML = '';

      sortedStories.forEach((story) => {
        // Story Card
        const storyCard = document.createElement('div');
        storyCard.classList.add('story-card');
        storyCard.setAttribute('tabindex', '0');
        storyCard.setAttribute(
          'aria-label',
          `Cerita milik ${story.name}. Pergi ke detail.`
        );

        storyCard.innerHTML = `
          <img 
            src="${story.photoUrl}" 
            alt="Foto cerita milik ${story.name}" 
            class="story-image" 
          />
          <div class="story-info">
            <h3>${story.name}</h3>
            <p>${story.description || '(Tanpa deskripsi)'}</p>
            <p class="story-date">${new Date(story.createdAt).toLocaleString()}</p>
            <button 
              class="detail-button" 
              aria-label="Cerita milik ${story.name}, pergi ke detail"
              data-id="${story.id}"
            >
              Lihat Detail
            </button>
          </div>
        `;

        storyContainer.appendChild(storyCard);
      });

      storyContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('detail-button')) {
          const storyId = e.target.getAttribute('data-id');
          window.location.hash = `#/details/${storyId}`;
        }
      });
    } catch (err) {
      console.error('Gagal memuat story:', err);
      document.querySelector('#story-list').innerHTML =
        `<p style="color:red;">Gagal memuat daftar cerita.</p>`;
    }
  }
}
