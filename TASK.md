# TASK — Migrasi Bertahap HTML Legacy ke Next.js

**Acuan:** `PRD.md`  
**Prinsip:** visual dan behavior parity lebih penting daripada kecepatan  
**Status umum:** Persiapan

## Aturan Eksekusi Wajib

- [ ] Baca `PRD.md` sebelum memulai setiap fase.
- [ ] Kerjakan maksimal satu section atau satu behavior owner dalam satu tahap.
- [ ] Jangan redesign, mengganti copy, atau mengganti aset dalam task migrasi.
- [ ] Jangan rename class atau menghapus atribut `data-*` selama masih dipakai CSS/runtime.
- [ ] Jangan menghapus `data/home.html`, `data/html-work.ts`, `data/html-projects.ts`, stylesheet legacy, atau runtime legacy sebelum sign-off final.
- [ ] Jangan mengaktifkan candidate sebelum seluruh acceptance gate unit lulus.
- [ ] Pastikan tersedia jalur rollback ke implementation legacy.
- [ ] Jangan menjalankan `npm run build` saat `npm run dev` masih aktif.
- [ ] Setelah edit, periksa file, jalankan validasi, dan catat hasilnya di bagian Log.

---

## Fase 0 — Safety, Baseline, dan Regression Harness

### 0.1 Versioning dan recovery

- [ ] Pastikan repository menggunakan Git atau buat mekanisme snapshot yang disepakati.
- [ ] Catat commit/snapshot baseline sebelum migrasi pertama.
- [ ] Pastikan file lokal/aset yang tidak dapat direkonstruksi ikut dibackup.
- [ ] Dokumentasikan prosedur rollback maksimal satu perubahan.

### 0.2 Route dan content inventory

- [ ] Inventarisasi `/` beserta lima section utama.
- [ ] Inventarisasi `/work`.
- [ ] Inventarisasi seluruh `/projects/[slug]` dan cocokkan dengan `data/projects.ts`.
- [ ] Catat metadata, canonical behavior, internal link, external link, dan anchor setiap rute.
- [ ] Catat semua image, video, audio, SVG, canvas, iframe, dan remote asset.

### 0.3 Runtime dependency inventory

- [ ] Petakan selector/function runtime untuk Hero.
- [ ] Petakan selector/function runtime untuk Problems/clients.
- [ ] Petakan selector/function runtime untuk Project Process.
- [ ] Petakan selector/function runtime untuk FAQ.
- [ ] Petakan selector/function runtime untuk CTA.
- [ ] Petakan menu, About modal, cursor, sound, smooth scroll, page transition, dan route cleanup.
- [ ] Identifikasi ownership Barba versus Next.js App Router.
- [ ] Identifikasi semua state pada `<html>`, `<body>`, dan container `data-barba`.

### 0.4 Baseline capture

- [ ] Ambil screenshot `/` pada 375×812.
- [ ] Ambil screenshot `/` pada 768×1024.
- [ ] Ambil screenshot `/` pada 1024×768.
- [ ] Ambil screenshot `/` pada 1440×900.
- [ ] Ambil screenshot `/` pada 1920×1080.
- [ ] Ulangi baseline viewport untuk `/work`.
- [ ] Ulangi baseline viewport untuk setiap project detail.
- [ ] Rekam video semua animasi dan interaction state penting.
- [ ] Simpan console log dan network status baseline.
- [ ] Catat dimensi section dan wrapping teks penting.

### 0.5 Test harness

- [ ] Tentukan cara menjalankan legacy dan candidate berdampingan tanpa mengubah public route.
- [ ] Tambahkan prosedur screenshot comparison yang repeatable.
- [ ] Tetapkan threshold pixel difference maksimum 0,5% plus manual review.
- [ ] Tambahkan pemeriksaan status seluruh aset lokal yang direferensikan HTML.
- [ ] Tambahkan smoke-test route dan deep-link.
- [ ] Tambahkan navigation-cycle test minimal tiga siklus.
- [ ] Dokumentasikan cara menunggu font, media, dan animasi sebelum screenshot.

### Gate Fase 0

- [ ] Baseline dapat direproduksi.
- [ ] Semua dependency penting sudah dipetakan.
- [ ] Rollback telah diuji.
- [ ] Tidak ada perubahan pada komponen aktif.
- [ ] Persetujuan untuk memulai pilot diterima.

---

## Fase 1 — Pilot Project Process / Project Journey

Target legacy: `#process.process_home_wrap` di `data/home.html`.

### 1.1 Analisis pilot

- [ ] Ekstrak snapshot markup section `#process` tanpa mengubah source aktif.
- [ ] Inventarisasi seluruh node, class, atribut, SVG, inline style, dan urutan DOM.
- [ ] Catat tiga step: judul, deskripsi, video, YouTube URL, CTA, dan nomor step.
- [ ] Temukan seluruh selector CSS yang menyentuh `.process_*` dan `.overview_home_video`.
- [ ] Temukan seluruh kode runtime yang menyentuh process index, sticky/scroll behavior, dan `data-video="playpause"`.
- [ ] Rekam behavior desktop, tablet, mobile, hover, touch, entry, scroll, dan resize.

### 1.2 Data model

- [ ] Buat interface TypeScript untuk process step.
- [ ] Buat data process dengan urutan dan konten identik baseline.
- [ ] Pertahankan URL video dan link baseline pada fase parity.
- [ ] Pastikan escaping karakter menghasilkan teks DOM yang identik.

### 1.3 Komponen candidate

- [ ] Buat `components/home/ProjectProcess.tsx`.
- [ ] Salin DOM, class, role, atribut `data-*`, aria, SVG, dan wrapper secara identik.
- [ ] Gunakan `.map()` hanya jika DOM output tetap identik.
- [ ] Jangan gunakan `next/image` pada pilot kecuali parity sudah dibuktikan.
- [ ] Jangan memindahkan CSS atau menghapus inline style pada pilot.
- [ ] Tambahkan client boundary hanya jika benar-benar diperlukan.

### 1.4 Behavior ownership

- [ ] Uji candidate terlebih dahulu dengan runtime legacy sebagai owner.
- [ ] Pastikan runtime hanya menginisialisasi candidate satu kali.
- [ ] Jika behavior harus dipindahkan ke React, pindahkan satu behavior pada satu waktu.
- [ ] Tambahkan cleanup untuk listener, GSAP timeline, ScrollTrigger, observer, dan video handler.
- [ ] Pastikan tidak ada legacy dan React handler aktif untuk behavior yang sama.

### 1.5 Validasi pilot

- [ ] Compare screenshot pada lima viewport wajib.
- [ ] Verifikasi wrapping setiap judul/deskripsi.
- [ ] Verifikasi ukuran, crop, preload, loop, mute, dan playback tiga video.
- [ ] Verifikasi hover cursor dan CTA setiap step.
- [ ] Verifikasi seluruh YouTube URL dan `target`.
- [ ] Verifikasi scroll/index transition dan timing animasi.
- [ ] Verifikasi resize melewati breakpoint 767 px dan 991 px.
- [ ] Verifikasi touch/coarse pointer.
- [ ] Verifikasi tidak ada console error atau hydration warning.
- [ ] Verifikasi tidak ada aset 404.
- [ ] Verifikasi navigation-cycle tiga kali tanpa duplicate trigger/listener.
- [ ] Hentikan dev server, lalu jalankan `npm run build`.

### 1.6 Aktivasi dan rollback

- [ ] Aktifkan candidate hanya setelah semua validasi pilot lulus.
- [ ] Pertahankan markup legacy sebagai fallback yang dapat dipulihkan.
- [ ] Smoke-test seluruh halaman, bukan hanya section process.
- [ ] Dapatkan sign-off visual dan behavior manual.
- [ ] Tandai pilot selesai; jangan hapus source legacy.

### Gate Fase 1

- [ ] Pixel difference memenuhi target dan review manual tidak menemukan perbedaan terlihat.
- [ ] Seluruh behavior identik.
- [ ] Build lulus.
- [ ] Rollback lulus.
- [ ] Stakeholder menyetujui hasil pilot.

---

## Fase 2 — FAQ

- [ ] Audit markup, inline CSS, accordion state, foto Fadel, CTA, link, dan cursor behavior.
- [ ] Buat typed FAQ data tanpa mengubah copy atau urutan.
- [ ] Buat `components/home/FaqSection.tsx` dengan DOM/class/data attribute identik.
- [ ] Pertahankan `/images/teams/fadel-febrian.jpeg` dan dimensi/crop baseline.
- [ ] Uji open/close, keyboard, focus, multiple click, resize, dan navigation-cycle.
- [ ] Jalankan seluruh acceptance gate per unit.
- [ ] Aktifkan hanya setelah sign-off; pertahankan fallback.

---

## Fase 3 — Problems, Testimonial, dan Client Logos

- [ ] Pisahkan inventory problems, founder testimonial, stats, dan client cards.
- [ ] Cocokkan data client lokal dan remote dengan baseline.
- [ ] Buat typed data tanpa mengubah urutan.
- [ ] Buat komponen dengan DOM/class/data attribute identik.
- [ ] Uji slider/stat behavior, hover, logo crop, lazy loading, dan responsive grid.
- [ ] Verifikasi foto profil Fadel tetap menggunakan aset yang disetujui.
- [ ] Jalankan seluruh acceptance gate per unit.
- [ ] Aktifkan hanya setelah sign-off; pertahankan fallback.

---

## Fase 4 — CTA

- [ ] Audit image/video, canvas/decorative behavior, copy, button, dan scroll trigger.
- [ ] Buat komponen CTA tanpa mengganti aset atau layout.
- [ ] Uji animation entry, responsive crop, cursor, link, dan cleanup.
- [ ] Jalankan seluruh acceptance gate per unit.
- [ ] Aktifkan hanya setelah sign-off; pertahankan fallback.

---

## Fase 5 — Hero

- [ ] Audit preloader, split text, media, scroll behavior, CTA, dan transition dependency.
- [ ] Rekam timing baseline secara detail sebelum implementasi.
- [ ] Buat komponen Hero dengan DOM/class/data attribute identik.
- [ ] Uji first load, cache load, refresh, reduced network speed, mobile, dan resize.
- [ ] Uji tidak ada flash of unstyled/unsplit content yang baru.
- [ ] Jalankan seluruh acceptance gate per unit.
- [ ] Aktifkan hanya setelah sign-off; pertahankan fallback.

---

## Fase 6 — Shared Shell dan Global Behaviors

Kerjakan satu behavior per task/PR kecil.

- [ ] Tentukan source of truth navbar yang benar; jangan aktifkan dua navbar.
- [ ] Migrasikan menu overlay dengan state dan animasi identik.
- [ ] Migrasikan About modal dengan state, focus, scroll lock, dan animasi identik.
- [ ] Audit dan konsolidasikan custom cursor tanpa mengubah visual.
- [ ] Audit dan konsolidasikan sound provider tanpa audio ganda.
- [ ] Audit Lenis; pastikan hanya satu instance aktif.
- [ ] Audit ScrollTrigger lifecycle dan refresh behavior.
- [ ] Audit Three.js canvas, resize, DPR, RAF, dan disposal.
- [ ] Putuskan transisi Barba versus App Router berdasarkan spike terisolasi.
- [ ] Migrasikan page transition tanpa mengubah timing/easing.
- [ ] Uji direct load, Link navigation, browser back/forward, refresh, dan external return.
- [ ] Jalankan seluruh acceptance gate per behavior.

---

## Fase 7 — Halaman Work

- [ ] Inventarisasi seluruh section dan interaction `/work`.
- [ ] Ambil baseline lengkap pada lima viewport.
- [ ] Identifikasi shared component yang sudah terbukti di Home.
- [ ] Migrasikan satu section per tahap.
- [ ] Pertahankan `WORK_HTML` sebagai fallback.
- [ ] Uji filter/list/grid/hover/media/transition sesuai baseline.
- [ ] Uji navigasi dari Work ke setiap project dan kembali.
- [ ] Jalankan acceptance gate per section dan seluruh route.

---

## Fase 8 — Project Detail

### 8.1 Pilot satu project

- [ ] Pilih satu slug representatif dengan variasi media/interaksi paling lengkap.
- [ ] Inventarisasi struktur dan data project pilot.
- [ ] Pisahkan schema project detail dari presentation.
- [ ] Buat komponen section satu per satu.
- [ ] Pertahankan entry `PROJECTS_HTML` sebagai fallback.
- [ ] Luluskan seluruh acceptance gate pilot.

### 8.2 Rollout seluruh project

- [ ] Cocokkan seluruh slug di data dan HTML legacy.
- [ ] Migrasikan project satu per satu.
- [ ] Uji metadata, not-found, deep link, next/previous project, dan media.
- [ ] Uji seluruh route pada mobile, tablet, dan desktop.
- [ ] Pastikan tidak ada konten/project yang hilang.
- [ ] Dapatkan sign-off setiap project atau batch yang disepakati.

---

## Fase 9 — Decomposition dan Cleanup Legacy

Fase ini hanya dimulai setelah Home, Work, dan seluruh Project Detail telah disetujui.

- [ ] Buat coverage map fungsi `monolog-runtime.js` versus replacement React.
- [ ] Hapus satu subsistem runtime yang sudah tidak dipakai pada satu waktu.
- [ ] Uji seluruh route setelah setiap penghapusan.
- [ ] Hapus selector CSS yang terbukti tidak terpakai secara bertahap.
- [ ] Jangan menghapus class hanya karena terlihat seperti class Webflow.
- [ ] Hapus `dangerouslySetInnerHTML` setelah tidak ada route yang membutuhkannya.
- [ ] Hapus loader HTML legacy setelah rollback window berakhir dan ada persetujuan.
- [ ] Hapus file legacy hanya setelah backup/version history terjamin.
- [ ] Jalankan audit aset orphan setelah seluruh migrasi selesai.

---

## Fase 10 — Final Acceptance

- [ ] Jalankan screenshot regression seluruh route pada lima viewport.
- [ ] Jalankan manual interaction matrix seluruh route.
- [ ] Jalankan navigation-cycle dan cleanup test.
- [ ] Verifikasi tidak ada console error/hydration warning.
- [ ] Verifikasi tidak ada request aset aplikasi yang 404.
- [ ] Verifikasi metadata dan route output.
- [ ] Hentikan dev server dan hapus `.next` untuk clean build.
- [ ] Jalankan `npm run build` dari cache bersih.
- [ ] Jalankan production smoke test dengan `npm run start`.
- [ ] Dokumentasikan cara mengedit konten, media, dan project.
- [ ] Dapatkan persetujuan final sebelum menghapus fallback.

---

## Checklist Wajib untuk Setiap Unit Migrasi

Salin checklist ini ke catatan unit yang sedang dikerjakan:

- [ ] Scope unit jelas dan tidak mencakup redesign.
- [ ] Baseline screenshot/video tersedia.
- [ ] Selector CSS dan runtime sudah diaudit.
- [ ] DOM order identik.
- [ ] Class identik.
- [ ] Atribut `data-*`, role, aria, dan link identik.
- [ ] Copy dan aset identik.
- [ ] Visual mobile identik.
- [ ] Visual tablet identik.
- [ ] Visual desktop identik.
- [ ] Hover/focus/touch identik.
- [ ] Scroll dan animasi identik.
- [ ] Media behavior identik.
- [ ] Tidak ada duplicate initialization.
- [ ] Tidak ada console/hydration error baru.
- [ ] Tidak ada aset 404.
- [ ] Build lulus.
- [ ] Rollback lulus.
- [ ] Sign-off diterima.

---

## Log Pelaksanaan

Tambahkan entri baru tanpa menghapus histori.

### 2026-09-23 — Dokumen migrasi dibuat

- Status: selesai.
- Perubahan: menambahkan `PRD.md` dan `TASK.md`.
- Kode aplikasi aktif yang diubah: tidak ada.
- Baseline tercatat: Next.js 14, tiga sumber HTML legacy, lima section Home, empat video, 20 gambar, 15 inline style, dan runtime legacy global.
- Validasi berikutnya: mulai Fase 0; belum mengaktifkan komponen hasil migrasi.