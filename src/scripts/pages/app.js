import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { subscribe, unsubscribe, isCurrentPushSubscriptionAvailable } from '../utils/notification-helper';


class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupLogout();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _setupLogout() {
    const logoutLink = document.getElementById('nav-logout');
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.logoutUser();
    });
  }

  logoutUser() {
    localStorage.removeItem('token');

    // Optional: bersihkan data lain kalau ada
    // localStorage.removeItem('user');

    alert('Anda telah logout.');

    // Arahkan user ke halaman login
    window.location.hash = '#/login';

    // Refresh navbar agar tombol login/logout berubah
    this.updateNavbar();
  }

  async renderPage() {
    const url = getActiveRoute();
    const routeKey = Object.keys(routes).find((path) => {
      if (path.includes(':')) {
        const base = path.split('/:')[0];
        return url.startsWith(base);
      }
      return path === url;
    });

    const PageClass = routes[routeKey];
    if (!PageClass) {
      this.#content.innerHTML = '<h2>Halaman tidak ditemukan</h2>';
      return;
    }

    const page = new PageClass();

    if (document.startViewTransition) {
      const transition = document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      });

      transition.finished.then(() => {
        console.log('View transition selesai.');
      });

    } else {
      this.#content.classList.remove('page-active');
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      void this.#content.offsetWidth;
      this.#content.classList.add('page-active');
    }

    this.updateNavbar();
  }

  // Update Navbar
  async updateNavbar() {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('nav-login');
    const logoutLink = document.getElementById('nav-logout');
    const addStoryLink = document.getElementById('nav-add-story');
    const notifSubBtn = document.getElementById('nav-notif-subscribe');
    const notifUnsubBtn = document.getElementById('nav-notif-unsubscribe');

    // Sembunyikan dulu
    notifSubBtn.style.display = 'none';
    notifUnsubBtn.style.display = 'none';

    // Kalau belum login
    if (!token) {
      loginLink.style.display = 'inline-block';
      addStoryLink.style.display = 'none';
      logoutLink.style.display = 'none';
      return;
    }

    // Kalau sudah login
    loginLink.style.display = 'none';
    addStoryLink.style.display = 'inline-block';
    logoutLink.style.display = 'inline-block';

    try {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();

      if (isSubscribed) {
        // Sudah berlangganan → tampilkan tombol Unsubscribe
        notifUnsubBtn.style.display = 'inline-block';
        notifUnsubBtn.style.opacity = '1';
      } else {
        // Belum berlangganan → tampilkan tombol Subscribe
        notifSubBtn.style.display = 'inline-block';
        notifSubBtn.style.opacity = '1';
      }
    } catch (error) {
      console.error('Gagal cek subscription:', error);
      notifSubBtn.style.display = 'none';
      notifUnsubBtn.style.display = 'none';
    }

    // Event Subscribe
    notifSubBtn.onclick = async () => {
      notifSubBtn.disabled = true;
      try {
        await subscribe();
        notifSubBtn.style.display = 'none';
        notifUnsubBtn.style.display = 'inline-block';
        notifUnsubBtn.style.opacity = '1';
      } catch (error) {
        console.error('Gagal berlangganan:', error);
        alert('Terjadi kesalahan saat berlangganan notifikasi.');
      } finally {
        notifSubBtn.disabled = false;
      }
    };

    // Event Unsubscribe
    notifUnsubBtn.onclick = async () => {
      notifUnsubBtn.disabled = true;
      try {
        await unsubscribe();
        notifUnsubBtn.style.display = 'none';
        notifSubBtn.style.display = 'inline-block';
        notifSubBtn.style.opacity = '1';
      } catch (error) {
        console.error('Gagal berhenti langganan:', error);
        alert('Terjadi kesalahan saat berhenti langganan notifikasi.');
      } finally {
        notifUnsubBtn.disabled = false;
      }
    };
  }

}

export default App;
