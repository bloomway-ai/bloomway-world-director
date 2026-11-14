# Bloomway World Director

[English](README.en.md) · [中文](README.zh-CN.md) · [Melayu](README.ms.md) · [Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [**Semua bahasa**](README.md)

**Your words. Your world. Your camera.**

Bangun dunia 3D dan arahkan gerak kamera untuk **pravisualisasi** sinematik (blockout poli rendah)—bukan model pembuatan video AI umum. Mengubah pravis menjadi footage akhir adalah alur kerja opsional di [Bloomway](https://bloomway.ai).

> **Eksperimen terbuka Bloomway:** bangun dunia dari satu kalimat, blok adegan dalam pravis 3D, lalu bawa ke layar. Toolkit terbuka untuk kreator dan peneliti.  
> **Pembaruan berkelanjutan:** repositori ini dirawat secara aktif; perkembangan akan berlanjut.

**Penggunaan komersial MIT** tidak memerlukan registrasi, pemberitahuan, atau bagi hasil. Hubungi **info@bloomway.ai** hanya jika Anda ingin kolaborasi—**bukan** syarat lisensi. Lihat [docs/commercial-use.md](docs/commercial-use.md).

---

## Tiga jalur

| Jalur | Apa itu |
| ----- | ------- |
| **Jalur 1 — Sumber terbuka (lokal)** | Jalankan contoh secara lokal dan pahami teks → pravis 3D. Cocok untuk belajar, mengajar, dan riset. |
| **Jalur 2 — Bloomway MCP (opsional)** | Sambungkan deskripsi yang sama ke pravis dan generasi terkelola—**opsional**, tidak wajib untuk repo ini. |
| **Jalur 3 — Lanjutan & tim** | Kolaborasi, templat komersial, dan dukungan pengiriman di [platform Bloomway](https://bloomway.ai). |

Bagikan contoh shot Anda di Discussions jika tersedia.

---

## Mulai cepat

**Persyaratan:** Node.js ≥ 20, npm ≥ 10. Tidak perlu akun Bloomway atau kunci API untuk contoh bundel.

```bash
git clone https://github.com/bloomway-ai/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run verify:example
npm run dev                  # Studio di http://localhost:5173/
```

Studio default memuat [`examples/edo-rainy-night`](examples/edo-rainy-night/) (JSON di repo, bukan inferensi cloud langsung).

**Sumber kebenaran:** [docs/implementation-audit.md](docs/implementation-audit.md) · [docs/verification-log.md](docs/verification-log.md)

Opsional: `npm run verify:studio-e2e`, `npm run record:demos`, `npm run capture:screenshots`.

---

## Tangkapan layar

| Beranda | Dunia satu baris | Linimasa kamera |
| ------- | ---------------- | --------------- |
| ![Home](media/screenshots/home.png) | ![World](media/screenshots/world.png) | ![Timeline](media/screenshots/camera-timeline.png) |

---

## Lihat demo

Direkam dari Studio OSS **repositori ini**. Pratinjau di bawah (gelung) — **▶ Full MP4** untuk kualitas penuh.

<table>
  <tr>
    <td width="50%">
      <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4">
        <img src="media/demo-city-tour.gif" alt="City tour preview" width="100%">
      </a>
      <br><sub><a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4">▶ Full MP4</a></sub>
    </td>
    <td width="50%">
      <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4">
        <img src="media/demo-drama.gif" alt="Street drama preview" width="100%">
      </a>
      <br><sub><a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4">▶ Full MP4</a></sub>
    </td>
  </tr>
</table>

| Demo | Prompt satu baris | Berkas |
| ---- | ----------------- | ------ |
| Tur kota | `Snowy daytime Tokyo urban city` → jelajahi dengan WASD | [demo-city-tour.mp4](media/demo-city-tour.mp4) |
| Drama jalanan | `Rainy night — two rivals meet in the street` → putar blocking | [demo-drama.mp4](media/demo-drama.mp4) |

Buat ulang: `npm run record:demos`. Legasi: [demo.mp4](media/demo.mp4) · [Catatan media](media/README.md)

Produk lengkap: [bloomway.ai](https://bloomway.ai)

---

## Apa yang berjalan secara lokal

| Status | Kemampuan |
| ------ | --------- |
| **Terverifikasi** | `plan.json` + `world-ref.json`, `validatePrevisPlan`, `generatePrevisWorld`, `samplePrevisCamera` |
| **Terverifikasi** | Viewport Director V2 + timeline (`verify:studio-e2e`); blockout legasi via `?legacy=1` |
| **Eksperimental** | Komposer kata kunci/aturan tanpa LLM cloud |
| **Direncanakan** | Composer cloud penuh, alat MCP Director, lebih banyak contoh |

Asisten bahasa alami «kalimat apa pun → rencana» hanya **dihosting di Bloomway** (tidak ada di repo ini).

---

## Batasan saat ini

1. Narasi pemasaran menjelaskan visi produk; contoh OSS memakai **JSON yang sudah disimpan**.  
2. Kesetiaan visual hanya **blockout**—bukan render akhir Bloomway.  
3. **UI Studio bahasa Inggris saja** di v0.1; lihat [docs/product-parity.md](docs/product-parity.md).  
4. «Satu baris → dunia» lokal memakai **aturan dan preset**, bukan NLU cloud penuh.

Detail: [docs/implementation-audit.md](docs/implementation-audit.md) §6.

---

## Peta jalan

- Contoh tambahan (`modern-city-street`, `mars-base`)
- Dokumentasi dan alat integrasi MCP
- Studio lebih kaya (impor, ekspor UI)
- Terjemahan UI Studio (krom aplikasi; README sudah multibahasa)

---

## Alur kerja Bloomway opsional

*Ingin mengubah pravis menjadi footage? Jelajahi alur terhubung di [Bloomway](https://bloomway.ai).*

---

## Penggunaan komersial & merek

MIT — lihat [LICENSE](LICENSE). Hak cipta (c) 2026 Bloomway AI Inc. Media demo: [CC BY 4.0](media/README.md). Pemberitahuan pihak ketiga: [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md).

Merek dagang: [TRADEMARKS.md](TRADEMARKS.md). Jangan menyiratkan dukungan resmi.

---

## Berkontribusi

[CONTRIBUTING.md](CONTRIBUTING.md) · [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)

*Jika ini membantu Anda menjelajahi sebuah shot—atau ingin mengikuti perkembangan kami—beri proyek ini ⭐.*