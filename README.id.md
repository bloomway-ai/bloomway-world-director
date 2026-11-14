# Bloomway World Director

[English](README.en.md) · [中文](README.zh-CN.md) · [Melayu](README.ms.md) · [Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [**Semua bahasa**](README.md)

**Your words. Your world. Your camera.**

Bangun dunia 3D dan arahkan gerak kamera untuk **pravisualisasi** sinematik (blockout poli rendah)—bukan model pembuatan video AI umum. Menjadi footage akhir adalah alur opsional di [Bloomway](https://bloomway.ai).

> **Eksperimen terbuka Bloomway:** bangun dunia dari satu kalimat, blok adegan dalam pravis 3D, lalu bawa ke layar. Toolkit terbuka untuk kreator dan peneliti.  
> **Pembaruan berkelanjutan:** repositori ini aktif dirawat; perkembangan akan berlanjut.

**Penggunaan komersial MIT** tanpa registrasi atau bagi hasil. **info@bloomway.ai** hanya untuk kerja sama sukarela—bukan syarat lisensi. Lihat [docs/commercial-use.md](docs/commercial-use.md).

---

## Tiga jalur

| Jalur | Ringkasan |
| ----- | --------- |
| **Jalur 1 — Sumber terbuka (lokal)** | Jalankan contoh di mesin Anda; pahami teks → pravis 3D. Untuk belajar, mengajar, riset. |
| **Jalur 2 — Bloomway MCP (opsional)** | Deskripsi yang sama dapat terhubung ke pravis/generasi terkelola—**opsional**. |
| **Jalur 3 — Tim & pengiriman** | Kolaborasi dan dukungan di [platform Bloomway](https://bloomway.ai). |

---

## Mulai cepat

```bash
git clone https://github.com/bloomway-ai/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run verify:example
npm run dev
```

Contoh: [`examples/edo-rainy-night`](examples/edo-rainy-night/). Lihat [docs/implementation-audit.md](docs/implementation-audit.md).

---

## Demo

| Demo | Prompt satu baris | File |
| ---- | ----------------- | ---- |
| Tur kota | `Snowy daytime Tokyo urban city` | [demo-city-tour.mp4](media/demo-city-tour.mp4) |
| Drama jalanan | `Rainy night — two rivals meet in the street` | [demo-drama.mp4](media/demo-drama.mp4) |

UI Studio **hanya Inggris** v0.1; batasan NL lokal — audit §6.

MIT · [LICENSE](LICENSE) · media [CC BY 4.0](media/README.md)

*Beri ⭐ jika proyek ini membantu eksplorasi syot Anda.*