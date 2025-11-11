import CONFIG from '../../../config.js';

export default class RegisterPage {
  async render() {
    return `
      <section class="register-page">
        <h1>DAFTAR MY KISAH CERITA GW</h1>
        <form id="registerForm" class="register-form">
          <div class="form-group">
            <label for="name">Nama Lengkap</label>
            <input type="text" id="name" name="name" required placeholder="Masukkan nama lengkap">
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Masukkan email">
          </div>

          <div class="form-group">
            <label for="password">Kata Sandi</label>
            <input type="password" id="password" name="password" minlength="8" required placeholder="Minimal 8 karakter">
          </div>

          <button type="submit" class="btn">Daftar</button>
          <p id="registerMessage" class="register-message"></p>

          <p class="have-account">
            Sudah punya akun? <a href="#/login">Masuk di sini</a>
          </p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('registerForm');
    const messageElement = document.getElementById('registerMessage');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      messageElement.textContent = 'Sedang memproses...';
      messageElement.style.color = 'gray';

      try {
        const response = await fetch(`${CONFIG.BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (!result.error) {
          messageElement.textContent = 'Akun berhasil dibuat! Mengarahkan ke login...';
          messageElement.style.color = 'green';

          setTimeout(() => {
            window.location.hash = '#/login';
          }, 1500);
        } else {
          messageElement.textContent = result.message || 'Gagal mendaftar.';
          messageElement.style.color = 'red';
        }
      } catch (error) {
        messageElement.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
        messageElement.style.color = 'red';
      }
    });
  }
}
