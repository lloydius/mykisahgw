// CSS imports
import '../styles/details.css';
import '../styles/list.css';
import '../styles/login.css';
import '../styles/register.css';
import '../styles/styles.css';
import { registerServiceWorker } from './utils';
import { subscribe, unsubscribe, showTestNotification } from './utils/notification-helper';



import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();
  await registerServiceWorker();

  console.log('Berhasil mendaftarkan service worker.');

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

});
