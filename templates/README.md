# Linktree Builder

**Linktree Builder** adalah library sederhana berbasis **HTML, CSS, dan JavaScript** untuk membuat halaman link-in-bio ala Linktree dengan **gaya pixel art modern**, animasi halus, dan tampilan yang responsif.  
Cocok untuk **developer, content creator, atau personal brand** yang ingin tampil beda.

---

## 📦 Persyaratan

Sebelum menggunakan library ini, pastikan kamu sudah mengimpor:

**Google Fonts**
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Press+Start+2P&display=swap" rel="stylesheet">
```

**Font Awesome**
```html
<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
```
---
## 📥 Import Library via CDN (jsDelivr)
**CSS**
```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/hanzcode1/LinktreeBuilder@main/style.css">
```

**JavaScript**
```html
<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/hanzcode1/LinktreeBuilder@main/script.js"></script>
```
---
## 🧱 Struktur HTML Dasar
```html
<body>
  <!-- Loading Overlay -->
  <div class="loading-overlay" id="loading">
    <div class="loading-pixels">
      <div class="loading-pixel"></div>
      <div class="loading-pixel"></div>
      <div class="loading-pixel"></div>
    </div>
  </div>

   <!-- Main App Container -->
  <div id="app"></div>

  <script>
    Linktree.init({
      // konfigurasi di sini
    });
  </script>
</body>
```
---
## ⚙️ Cara Penggunaan
```html
<script>
  Linktree.init({
    img: "img/profile.png",
    nama: "Hanzcode",
    deskripsi: "Web Developer | UI Engineer",
    medsos: [
      {platform: "github", url: "#"},
      {platform: "instagram", url: "#"},
      {platform: "linkedin", url: "#"}
    ],
    links: [
      { text: "Portofolio", url: "#" },
      { text: "Blog", url: "#" }
    ],
    footer: "© Hanzcode"
  });
</script>
```
---
## ⚙️ Konfigurasi Opsi
| Properti   | Tipe   | Keterangan        |
|------------|--------|-------------------|
| `img`      | string | URL foto profil   |
| `nama`     | string | Nama pengguna     |
| `deskripsi`| string | Bio / deskripsi   |
| `medsos` | array | Daftar media sosial |
| `links`  | array | Daftar link utama   |
| `footer` | string| Teks footer         |
---
## 📱 Media Sosial yang Tersedia
| Platform | ID | Deskripsi |
|---------|----|-----------|
| GitHub | `github` | Profil GitHub |
| Facebook | `facebook` | Profil Facebook |
| Instagram | `instagram` | Profil Instagram |
| Twitter | `twitter` | Profil Twitter |
| X | `x` | Profil X (Twitter baru) |
| YouTube | `youtube` | Channel YouTube |
| LinkedIn | `linkedin` | Profil LinkedIn |
| TikTok | `tiktok` | Akun TikTok |
| Discord | `discord` | Invite server Discord |
| Twitch | `twitch` | Channel Twitch |
| Spotify | `spotify` | Profil Spotify |
| WhatsApp | `whatsapp` | Chat WhatsApp |
| Telegram | `telegram` | Akun Telegram |
| Dribbble | `dribbble` | Portofolio Dribbble |
| Behance | `behance` | Portofolio Behance |
| Medium | `medium` | Blog Medium |
| Pinterest | `pinterest` | Akun Pinterest |
| Reddit | `reddit` | Profil Reddit |
| Snapchat | `snapchat` | Akun Snapchat |
| Steam | `steam` | Profil Steam |
| PayPal | `paypal` | Donasi PayPal |
| Patreon | `patreon` | Halaman Patreon |
| CodePen | `codepen` | Profil CodePen |
| Stack Overflow | `stackoverflow` | Profil Stack Overflow |
| Email | `email` | Email kontak |
| Website | `website` | Website pribadi |
---
## 📝 Catatan Penting
- Jika menggunakan string, URL akan dibuat otomatis berdasarkan nama
- Jika ingin URL khusus, gunakan object
- Icon akan otomatis menyesuaikan platform
- Semua media sosial sudah terintegrasi dengan Font Awesome

**Contoh Penggunaan String**
```javascript
medsos: ["github", "instagram", "twitter"]
```

**Contoh Penggunaan Object**
```javascript
medsos: [
  { platform: "github", url: "https://github.com/hanzcode" },
  { platform: "instagram", url: "https://instagram.com/hanz.dev" }
]
```
---
## 🔗 Custom Link Button
```javascript
links: [
  { text: "My Portfolio", url: "https://example.com" },
  { text: "Download CV", url: "https://example.com/cv.pdf" }
]
```
> Icon akan terdeteksi otomatis berdasarkan teks atau URL.
---
## 🌓 Dark Mode
> Library ini otomatis mengikuti **dark mode sistem** pengguna.
Tidak perlu setting manual.
---
## 📱 Responsif
- Mobile ✔️
- Tablet ✔️
- Desktop ✔️
> Sudah dioptimalkan untuk layar kecil.
