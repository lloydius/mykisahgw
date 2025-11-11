import CONFIG from '../../../config.js';
import '../../../../styles/login.css';

export default class LoginPage {
  async render() {
    return `
      <section class="login-page">
        <h1>MASUK KE MY KISAH CERITA GW</h1>
        <form id="loginForm" class="login-form" aria-describedby="loginMessage">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Masukkan email">
          </div>
          <div class="form-group">
            <label for="password">Kata Sandi</label>
            <input type="password" id="password" name="password" required placeholder="Masukkan kata sandi">
          </div>
          <button type="submit" class="btn">Masuk</button>
          <p class="no-account">
            Belum punya akun? <a href="#/register">Daftar di sini</a>
          </p>

          <p 
            id="loginMessage" 
            class="login-message" 
            role="status" 
            aria-live="assertive" 
            aria-atomic="true"
            style="min-height: 1.5em;"
          ></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');
    const messageElement = document.getElementById('loginMessage');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      messageElement.textContent = 'Sedang memproses...';
      messageElement.style.color = 'black';

      try {
        const response = await fetch(`${CONFIG.BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!result.error) {
          localStorage.setItem('token', result.loginResult.token);
          localStorage.setItem('userName', result.loginResult.name);

          messageElement.textContent = 'Login berhasil! Mengarahkan ke halaman utama...';
          messageElement.style.color = 'green';

          setTimeout(() => {
            window.location.hash = '#/';
          }, 1500);
        } else {
          messageElement.textContent = result.message || 'Login gagal. Periksa kembali email dan kata sandi.';
          messageElement.style.color = 'red';
        }
      } catch (error) {
        messageElement.textContent = 'Terjadi kesalahan jaringan. Silakan coba lagi nanti.';
        messageElement.style.color = 'red';
      }
    });
  }
}
