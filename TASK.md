# TASK — Migrasi Bertahap HTML Legacy ke Next.js

**Acuan:** `PRD.md`  
**Prinsip:** visual dan behavior parity lebih penting daripada kecepatan  
**Sign-off Fase 1 (2026-09-26):** stakeholder menyatakan seluruh verifikasi manual telah disetujui dan meminta melanjutkan sign-off. Candidate React aktif dengan fallback restart `PROCESS_USE_LEGACY=1`; source legacy tidak dihapus. Build, candidate/fallback integration+ownership+hydration, seluruh route/aset, Process parity, pixel threshold, media visual, timing/easing, dan behavior diterima. Fase 1 ditutup **43/43**. Paket keputusan: `docs/PHASE-1-SIGNOFF.md`.

**Update final otomatis (2026-09-26):** candidate React sudah dipromosikan ke aplikasi utama dengan fallback restart `PROCESS_USE_LEGACY=1`. Build final lulus; candidate dan fallback masing-masing **8/8** untuk integration, scoped ownership, dan hydration seluruh sembilan route; audit HTTP masing-masing **9 route / 12 aset / 0 gagal**. Perbandingan fallback↔candidate lulus **5/5** pada gate 0,5% (maksimum **0,233236%**). Status sebelum sign-off manual adalah **34/43**. Bukti terbaru: `artifacts/home-shell/phase1-final-*` dan `artifacts/baseline-phase1-final-{candidate,fallback}`.

**Update terbaru v8 (2026-09-25):** parity pixel otomatis original↔candidate, fallback↔candidate, dan original↔fallback lulus pada seluruh lima viewport dengan gate tetap **0,5%**. Production candidate/fallback masing-masing **4/4**, ownership fallback restart **2/2**, build utama exit **0**, dan hash rollback fixture/public page identik. Candidate sementara `:3200` dihentikan; `:3000` dan fallback `:3100` terbukti legacy melalui probe SSR UTF-8. **Pilot belum selesai:** review visual/behavior manual, exhaustive resource ownership, dan stakeholder sign-off tetap terbuka; public activation tetap dinonaktifkan. Bukti: `D:\arxenovasocial.com-v2\docs\PROCESS-INTEGRATION-BLOCKERS.md` dan `D:\arxenovasocial.com-v2\artifacts\home-shell\v8-*`.

**Update terbaru v7 (2026-09-25):** pertumbuhan empat listener cursor diperbaiki hanya pada fixture, beserta cleanup RAF/tween dan regresi **6/6**. Production candidate/repeat/fallback masing-masing **4/4**, build fixture exit **0**. Audit candidate/fallback tiga siklus pointer/touch menunjukkan listener cursor/document/font stabil per halaman dan detached trigger 0. **1.4 belum selesai**: exhaustive resource audit, browser cursor interaction saat navigasi, parity visual/manual, dan validasi aplikasi utama masih terbuka. Legacy default; assertion integrasi dan source utama tidak diubah pada kelanjutan ini. Bukti: `D:\arxenovasocial.com-v2\docs\PROCESS-INTEGRATION-BLOCKERS.md`. Status berikut adalah riwayat.


**Update terbaru v6 (2026-09-25):** fixture production v5 candidate/repeat/fallback **4/4** masing-masing; v6 candidate/repeat/fallback **4/4** masing-masing. Build fixture v4–v6 exit **0**, tooling **5/5**. Listener document/font kini stabil, tetapi empat handler cursor window masih bertambah setiap navigasi pointer. **1.4 belum selesai**; audit cleanup menyeluruh, visual/manual acceptance dan validasi aplikasi utama tetap terbuka. Source utama tidak diubah pada kelanjutan ini, legacy tetap default, assertion integrasi tidak dilonggarkan. Rincian/bukti: `D:\arxenovasocial.com-v2\docs\PROCESS-INTEGRATION-BLOCKERS.md`. Status lama di bawah adalah riwayat.


**Status terbaru eksperimen runtime fixture (2026-09-25):** candidate dev 4/4 + repeat 4/4; rollback switch candidate→fallback dev 4/4. Candidate production `next start` masih 0/4 karena equality jumlah trigger Problems/eyebrow direct/reload/back. Patch Lenis/SplitText/matchMedia hanya pada salinan fixture; source utama tidak diedit sesi ini dan legacy tetap default. Build fixture menghasilkan artefak yang bisa dijalankan, tetapi wrapper exit build tidak terkonfirmasi bersih. Visual parity, audit listener/RAF menyeluruh, build utama, dan activation belum ditutup. Lihat `D:\arxenovasocial.com-v2\docs\PROCESS-INTEGRATION-BLOCKERS.md`; status di bawah merekam tahap sebelumnya.


**Status umum:** Fase 0 ditutup: **23 passed, 0 failed/skipped/flaky** pada satu server (baseline 11/11, menu 8/8, closeout 4/4). Syntax JS, TypeScript, HTTP baseline lulus. Approval visual/audio pemilik mengikuti ringkasan sesi sebelumnya. Pada kelanjutan sesi 2026-09-25, pemilik secara eksplisit menerima coverage Chromium/touch emulation (bukan perangkat nyata) dan mengizinkan mulai pilot Project Process. Fase 1: analisis baseline Project Process selesai (8/8 audit; 101 screenshot/7 video terverifikasi); candidate terisolasi dan data model sudah dibuat; harness SSR candidate 7/7 lulus (DOM/layout dan pixel statis, bukan acceptance hydration/lifecycle), belum diaktifkan; legacy tetap default sampai acceptance pilot lulus. Root hydration diperbaiki pada tahap shared terpisah: regresi 21/21 dan refresh baseline 8/8 lulus; integrasi hydration/lifecycle candidate tetap belum terverifikasi. Production build dan validasi perangkat nyata belum dilakukan. Bukti final: `D:\arxenovasocial.com-v2\artifacts\browser\repair-full.json`; lihat `D:\arxenovasocial.com-v2\docs\PHASE-0-SIGNOFF.md`.

**Update kelanjutan integrasi:** harness Next terisolasi telah dibuat dan dijalankan. Candidate **0 passed/4 failed**, kontrol legacy **0 passed/4 failed**: Process di luar container Barba tertinggal setelah Home→Work; playback setelah resize 767→768 gagal pada keduanya. Ini blocker baseline/shared yang baru terungkap, bukan acceptance pilot. TypeScript/syntax/diff-check lulus; build dan rollback belum diuji. Detail: `D:\arxenovasocial.com-v2\docs\PROCESS-INTEGRATION-BLOCKERS.md`. Legacy tetap default; jangan menutup checklist lifecycle/resize berdasarkan tes SSR terdahulu.

**Audit lanjutan shared:** empat penutup div berlebih terbukti; patch hanya di fixture. Run repaired legacy/candidate tetap 0/4 lulus: navigasi kini menghapus Process, tetapi tersisa trigger heading Problems yang detached. Resize ditimpa reset scroll satu detik saat Lenis dibuat ulang; retry diagnostik setelah reset berhasil. Source aktif tetap utuh, parity visual belum lulus. Detail terbaru: `D:\arxenovasocial.com-v2\docs\PROCESS-INTEGRATION-BLOCKERS.md`.



## Aturan Eksekusi Wajib

### Audit lanjutan menu — 2026-09-25

- Penyebab blocker desktop terbukti: tombol menu tersembunyi (`display: none`, rectangle 0×0) pada 1440 px dan tidak menerima fokus. Ini adalah ketidaksesuaian skenario test dengan breakpoint, bukan bukti kerusakan keyboard legacy.
- Menambahkan `tests/browser/menu-audit.spec.ts`: delapan viewport termasuk batas 767/768 dan 991/992; kontrol terlihat pada 767/375 diuji Enter, Space, Escape, serta scroll lock.
- Validasi: reporter Playwright menunjukkan 8 passed (run ulang 28,3 detik); JSON run pertama expected 8/unexpected 0. Wrapper terminal melaporkan code 1/terminal closed setelah reporter selesai; lihat catatan di `docs/BASELINE.md`. `npx tsc --noEmit --incremental false` lulus.
- Tidak mengubah runtime, CSS, markup, atau assertion test lengkap. Berikutnya: sesuaikan skenario lengkap dengan breakpoint aktual dan pisahkan capture behavior; lanjutkan bukti manual/audio serta sign-off. Gate Fase 0 tetap terbuka; pilot belum dimulai.

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

- [x] Pastikan repository menggunakan Git atau buat mekanisme snapshot yang disepakati.
- [x] Catat commit/snapshot baseline sebelum migrasi pertama.
- [x] Pastikan file lokal/aset yang tidak dapat direkonstruksi ikut dibackup.
- [x] Dokumentasikan prosedur rollback maksimal satu perubahan.

### 0.2 Route dan content inventory

- [x] Inventarisasi `/` beserta lima section utama.
- [x] Inventarisasi `/work`.
- [x] Inventarisasi seluruh `/projects/[slug]` dan cocokkan dengan `data/projects.ts`.
- [x] Catat metadata, canonical behavior, internal link, external link, dan anchor setiap rute.
- [x] Catat semua image, video, audio, SVG, canvas, iframe, dan remote asset.

### 0.3 Runtime dependency inventory

- [x] Petakan selector/function runtime untuk Hero.
- [x] Petakan selector/function runtime untuk Problems/clients.
- [x] Petakan selector/function runtime untuk Project Process.
- [x] Petakan selector/function runtime untuk FAQ.
- [x] Petakan selector/function runtime untuk CTA.
- [x] Petakan menu, About modal, cursor, sound, smooth scroll, page transition, dan route cleanup.
- [x] Identifikasi ownership Barba versus Next.js App Router.
- [x] Identifikasi semua state pada `<html>`, `<body>`, dan container `data-barba`.

### 0.4 Baseline capture

- [x] Ambil screenshot `/` pada 375×812.
- [x] Ambil screenshot `/` pada 768×1024.
- [x] Ambil screenshot `/` pada 1024×768.
- [x] Ambil screenshot `/` pada 1440×900.
- [x] Ambil screenshot `/` pada 1920×1080.
- [x] Ulangi baseline viewport untuk `/work`.
- [x] Ulangi baseline viewport untuk setiap project detail.
- [x] Rekam video skenario interaksi penting yang tercakup harness (desktop/touch, menu, About, sound, cursor, animasi); bukan verifikasi semua timing/easing atau perangkat nyata.
- [x] Simpan console log dan network status baseline.
- [x] Catat dimensi section dan wrapping teks penting.

### 0.5 Test harness

- [x] Tentukan cara menjalankan legacy dan candidate berdampingan tanpa mengubah public route.
- [x] Tambahkan prosedur screenshot comparison yang repeatable.
- [x] Tetapkan threshold pixel difference maksimum 0,5% plus manual review.
- [x] Tambahkan pemeriksaan status seluruh aset lokal yang direferensikan HTML.
- [x] Tambahkan smoke-test route dan deep-link.
- [x] Tambahkan navigation-cycle test minimal tiga siklus.
- [x] Dokumentasikan cara menunggu font, media, dan animasi sebelum screenshot.

### Gate Fase 0

- [x] Baseline dapat direproduksi.
- [x] Semua dependency penting sudah dipetakan.
- [x] Rollback telah diuji.
- [x] Tidak ada perubahan pada komponen aktif.
  - Pengecualian perbaikan legacy: runtime sound/menu/About, media, shader cleanup, dan bridge history pada root layout diubah; tidak ada migrasi section atau candidate diaktifkan.
- [x] Persetujuan untuk memulai pilot diterima.

Paket keputusan akhir: `D:\arxenovasocial.com-v2\docs\PHASE-0-SIGNOFF.md`. L01–L04 dan tiga blocker regression selesai; approval visual/audio tercatat dari ringkasan sebelumnya. Gate Fase 0 ditutup setelah izin pilot dan penerimaan batasan coverage diberikan eksplisit pada kelanjutan sesi 2026-09-25. Izin mulai bukan persetujuan aktivasi candidate.

---

## Fase 1 — Pilot Project Process / Project Journey

Target legacy: `#process.process_home_wrap` di `data/home.html`.

Status: **43/43, selesai dan disetujui pada 2026-09-26**. Candidate React aktif pada source aplikasi utama; `PROCESS_USE_LEGACY=1` memulihkan markup legacy setelah restart. Source legacy tetap dipertahankan. Bukti dan keputusan akhir tersedia di `docs/PHASE-1-SIGNOFF.md`.

### 1.1 Analisis pilot

- [x] Ekstrak snapshot markup section `#process` tanpa mengubah source aktif.
- [x] Inventarisasi seluruh node, class, atribut, SVG, inline style, dan urutan DOM.
- [x] Catat tiga step: judul, deskripsi, video, YouTube URL, CTA, dan nomor step.
- [x] Temukan seluruh selector CSS yang menyentuh `.process_*` dan `.overview_home_video`.
- [x] Temukan seluruh kode runtime yang menyentuh process index, sticky/scroll behavior, dan `data-video="playpause"`.
- [x] Rekam behavior desktop, tablet, mobile, hover, touch, entry, scroll, dan resize.

### 1.2 Data model

- [x] Buat interface TypeScript untuk process step.
- [x] Buat data process dengan urutan dan konten identik baseline.
- [x] Pertahankan URL video dan link baseline pada fase parity.
- [x] Pastikan escaping karakter menghasilkan teks DOM yang identik.

### 1.3 Komponen candidate

- [x] Buat `components/home/ProjectProcess.tsx`.
- [x] Salin DOM, class, role, atribut `data-*`, aria, SVG, dan wrapper secara identik.
- [x] Gunakan `.map()` hanya jika DOM output tetap identik.
- [x] Jangan gunakan `next/image` pada pilot kecuali parity sudah dibuktikan.
- [x] Jangan memindahkan CSS atau menghapus inline style pada pilot.
- [x] Tambahkan client boundary hanya jika benar-benar diperlukan.

Bukti 1.2–1.3: complete DOM contract pada harness SSR. Normalisasi eksplisit hanya urutan atribut, nilai boolean video, dan tidak adanya atribut video `style=""` dianggap sama dengan style kosong. CSS tetap dirender inline; teks, whitespace, SVG, dan class tidak dinormalisasi. Tidak ada client boundary/handler React baru. Ini bukan bukti integrasi hydration React atau acceptance penuh.

### 1.4 Behavior ownership

- [x] Uji candidate terlebih dahulu dengan runtime legacy sebagai owner.
- [x] Pastikan runtime hanya menginisialisasi candidate satu kali.
- [x] Jika behavior harus dipindahkan ke React, pindahkan satu behavior pada satu waktu. *(Diverifikasi N/A: tidak ada behavior/handler yang dipindahkan ke React.)*
- [x] Tambahkan cleanup untuk listener, GSAP timeline, ScrollTrigger, observer, dan video handler.
- [x] Pastikan tidak ada legacy dan React handler aktif untuk behavior yang sama.

### 1.5 Validasi pilot

- [x] Compare screenshot pada lima viewport wajib.
- [x] Verifikasi wrapping setiap judul/deskripsi.
- [x] Verifikasi ukuran, crop, preload, loop, mute, dan playback tiga video.
- [x] Verifikasi hover cursor dan CTA setiap step.
- [x] Verifikasi seluruh YouTube URL dan `target`.
- [x] Verifikasi scroll/index transition dan timing animasi.
- [x] Verifikasi resize melewati breakpoint 767 px dan 991 px.
- [x] Verifikasi touch/coarse pointer.
- [x] Verifikasi tidak ada console error atau hydration warning.
- [x] Verifikasi tidak ada aset 404.
- [x] Verifikasi navigation-cycle tiga kali tanpa duplicate trigger/listener.
- [x] Hentikan dev server, lalu jalankan `npm run build`.

### 1.6 Aktivasi dan rollback

- [x] Aktifkan candidate hanya setelah semua validasi pilot lulus.
- [x] Pertahankan markup legacy sebagai fallback yang dapat dipulihkan.
- [x] Smoke-test seluruh halaman, bukan hanya section process.
- [x] Dapatkan sign-off visual dan behavior manual.
- [x] Tandai pilot selesai; jangan hapus source legacy.

### Gate Fase 1

- [x] Pixel difference memenuhi target dan review manual tidak menemukan perbedaan terlihat.
- [x] Seluruh behavior identik.
- [x] Build lulus.
- [x] Rollback lulus.
- [x] Stakeholder menyetujui hasil pilot.

Paket keputusan akhir: `D:\arxenovasocial.com-v2\docs\PHASE-1-SIGNOFF.md`. Persetujuan eksplisit pada 2026-09-26 menerima seluruh verifikasi manual, termasuk media visual dan timing/easing, serta mengesahkan hasil pilot. Fallback legacy tetap wajib tersedia selama fase migrasi berikutnya.

---

## Fase 2 — FAQ

**Status 2026-09-26: 7/7, selesai dan disetujui.** Stakeholder menyatakan review manual approved dan menerima FAQ candidate. `FaqSection` aktif secara default; `FAQ_USE_LEGACY=1` memulihkan FAQ legacy setelah restart. `PROCESS_USE_LEGACY=1` tetap memulihkan seluruh Home legacy. Source legacy tidak dihapus. Paket keputusan: `docs/PHASE-2-SIGNOFF.md`.

- [x] Audit markup, inline CSS, accordion state, foto Fadel, CTA, link, dan cursor behavior.
- [x] Buat typed FAQ data tanpa mengubah copy atau urutan.
- [x] Buat `components/home/FaqSection.tsx` dengan DOM/class/data attribute identik.
- [x] Pertahankan `/images/teams/fadel-febrian.jpeg` dan dimensi/crop baseline.
- [x] Uji open/close, keyboard, focus, multiple click, resize, dan navigation-cycle.
- [x] Jalankan seluruh acceptance gate per unit.
- [x] Aktifkan hanya setelah sign-off; pertahankan fallback.

### Bukti Fase 2

- Baseline sebelum perubahan: `artifacts/faq/baseline/audit.json`, snapshot HTML, dan screenshot initial serta tujuh toggle pada lima viewport. Ekstraksi source: `artifacts/faq/extraction/contract.json` dan `readable.html` (line break hanya untuk pembacaan).
- Source: `data/home/faq.ts`, `components/home/FaqSection.tsx`, dan `components/home/faq-artwork.ts`. Tujuh pertanyaan, paragraf/trailing space, `<br>`, NBSP, link inline dengan `?duration=45`, CTA standalone `_blank`, SVG, serta tujuh style literal dipertahankan. Raw `data/home.html` tidak diubah.
- Build production setelah server dihentikan lulus compile, lint/type validation, generation 12/12, optimization, dan traces: `artifacts/faq/build-v3.log`.
- FAQ final **10/10**, tanpa skipped/unexpected/flaky: `artifacts/faq/final.json`. Tes memakai dua endpoint Next production nyata dari build yang sama, bukan substitusi respons. DOM contract lengkap hanya menormalisasi urutan atribut.
- Pixel tertutup/initial pada 375x812, 768x1024, 1024x768: **0%**; 1440x900: **0,042114%**; 1920x1080: **0,000275%**. Threshold tetap **0,5%**. Foto memiliki dimensi dan computed crop yang sama. Bukti: `artifacts/faq/final/*.json` dan PNG. Ini bukan perbandingan visual semua state accordion terbuka atau review timing/easing manual.
- Candidate dan legacy masing-masing diuji pointer/touch: single-open/sibling-close, close ulang, Enter/Space, fokus dan Tab awal, rapid clicks, resize 767/768/991/992, reload, CTA popup dengan destination stub, serta tiga siklus Home/Work/history. Listener aktif Home adalah satu click dan 14 hover pada pointer (nol hover touch); setelah leave nol listener FAQ aktif/detached. Instrumentasi menahan referensi hanya dalam test untuk memverifikasi pelepasan, bukan heap/GC proof.
- Root hydration seluruh sembilan route dan reload pada pointer/touch: candidate **2/2**, legacy **2/2**, tanpa skipped/unexpected/flaky. Bukti: `artifacts/faq/root-hydration-{candidate,legacy}.json`.
- Regression Process setelah cleanup FAQ **4/4**: `artifacts/faq/process-regression.json`. HTTP masing-masing **9 route / 12 aset / 0 gagal**: `artifacts/faq/http-{candidate,legacy}/manifest.json`.
- Transformer `scripts/repair-faq-runtime.mjs` menambahkan idempotency dan disposer accordion/hover beserta tween miliknya, tanpa handler React. Unit FAQ **3/3** dan Process **6/6** lulus. TypeScript, syntax runtime/tooling, generated-tree freshness, dan whitespace check lulus.
- Batasan baseline yang dipertahankan: button tanpa explicit type/ARIA expanded-controls, panel tanpa identity/ARIA/inert, link panel tertutup masih focusable, CTA `_blank` tanpa `rel`. Bukan klaim aksesibilitas sempurna atau izin redesign.
- Review visual state terbuka/hover/foto dan timing/easing disetujui stakeholder pada 2026-09-26. Aktivasi default dilakukan sesudah approval. `FAQ_USE_LEGACY=1` lalu restart mengembalikan FAQ legacy; flag `PROCESS_USE_LEGACY=1` memilih seluruh Home legacy dan mengungguli switch FAQ.
- Riwayat gagal tetap disimpan: `artifacts/faq/candidate-v1.json` (2 passed/6 failed: escaping raw style, PNG byte equality, asumsi cache Barba); `candidate-v2.json` (8/8, sebelum cleanup). Hasil final di atas tidak mengganti atau menghapus riwayat itu.
- Validasi setelah aktivasi default: build `artifacts/faq/signoff-build.log` lulus; FAQ candidate/default versus `FAQ_USE_LEGACY=1` **10/10** (`signoff.json`); route hydration masing-masing **2/2** (`signoff-routes-{candidate,legacy}.json`); HTTP masing-masing **9 route / 12 aset / 0 gagal**. Pixel lima viewport maksimum **0,009405%**, threshold 0,5%.

Paket keputusan akhir: `D:\arxenovasocial.com-v2\docs\PHASE-2-SIGNOFF.md`. Approval eksplisit pengguna pada 2026-09-26 menutup review manual dan acceptance FAQ.

---

## Fase 3 — Problems, Testimonial, dan Client Logos

- [x] Pisahkan inventory problems, founder testimonial, stats, dan client cards.
- [x] Cocokkan data client lokal dan remote dengan baseline.
- [x] Buat typed data tanpa mengubah urutan.
- [x] Buat komponen dengan DOM/class/data attribute identik.
- [x] Uji slider/stat behavior, hover, logo crop, lazy loading, dan responsive grid.
- [x] Verifikasi foto profil Fadel tetap menggunakan aset yang disetujui.
- [x] Jalankan seluruh acceptance gate per unit.
- [x] Aktifkan hanya setelah sign-off; pertahankan fallback.

**Status 2026-09-26: 8/8, selesai dan disetujui.** Stakeholder menerima review manual visual dan behavior. `ProblemsSection` aktif secara default; `PROBLEMS_USE_LEGACY=1` memulihkan markup legacy setelah restart. Runtime legacy tetap satu-satunya behavior owner. Paket keputusan: `docs/PHASE-3-SIGNOFF.md`.

---

## Fase 4 — CTA

- [x] Audit image/video, canvas/decorative behavior, copy, button, dan scroll trigger.
- [x] Buat komponen CTA tanpa mengganti aset atau layout.
- [x] Uji animation entry, responsive crop, cursor, link, dan cleanup.
- [x] Jalankan seluruh acceptance gate otomatis per unit.
- [x] Aktifkan hanya setelah sign-off; pertahankan fallback.

**Status 2026-09-26: 5/5, selesai dan disetujui.** Stakeholder menerima review manual visual dan behavior. `CtaSection` aktif secara default; `CTA_USE_LEGACY=1` memulihkan markup legacy setelah restart. Runtime legacy tetap menjadi owner seluruh scroll animation. Paket keputusan: `docs/PHASE-4-SIGNOFF.md`.

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

### 2026-09-23 — Harness baseline HTTP ditambahkan

- Status: Fase 0 berjalan; gate belum lulus.
- Perubahan: menambahkan `npm run baseline`, snapshot HTML, manifest route/aset/content, tiga siklus smoke HTTP, dan `docs/BASELINE.md`.
- Kode aplikasi aktif yang diubah: tidak ada; hanya script, dokumentasi, dan npm script.
- Hasil validasi: TypeScript lulus; 9 route dan 12 aset lokal merespons sukses; tujuh slug cocok; tiga siklus HTTP lulus; 0 kegagalan harness.
- Batasan: tidak ada Playwright/Puppeteer; screenshot, console browser, interaction state, dan cleanup listener belum tervalidasi.
- Validasi berikutnya: lakukan capture lima viewport, lengkapi dependency runtime inventory, lalu uji rollback.

### 2026-09-23 — Inventaris runtime dan ownership selesai

- Status: checklist 0.3 selesai; Gate Fase 0 tetap terbuka.
- Perubahan: menambahkan `docs/RUNTIME-INVENTORY.md` dan referensi dari `docs/BASELINE.md`.
- Temuan: Next.js memiliki request/server render; Barba dan runtime legacy memiliki client navigation, transition, Lenis, GSAP/ScrollTrigger, Webflow re-init, interaction, dan route cleanup.
- Pilot Process: React hanya boleh menjadi owner markup pada tahap awal; `[data-video="playpause"]`, reveal, cursor, dan behavior terkait tetap dimiliki runtime legacy.
- Kode aplikasi aktif yang diubah: tidak ada.
- Hasil validasi: TypeScript dan syntax harness lulus; baseline menguji 9 route dan 12 aset lokal dengan 0 kegagalan.
- Batasan: jumlah listener, RAF, canvas, audio, Lenis/ticker, dan ScrollTrigger setelah navigation cycle belum dapat dibuktikan tanpa browser.

### 2026-09-23 — Baseline Playwright dan rollback selesai

- Status: bukti browser utama dan rollback selesai; Gate Fase 0 tetap menunggu capture interaksi lengkap dan persetujuan pemilik proyek.
- Perubahan: menambahkan config Playwright, `npm run baseline:browser`, matriks 45 screenshot, capture console/network/layout/wrapping, runtime counters, video interaksi, dan tiga siklus client navigation.
- Hasil capture: 9 route × 5 viewport lulus; seluruh font `loaded`; 0 page error, 0 failed request, dan 0 respons HTTP ≥400 pada matriks visual.
- Hasil lifecycle: tiga siklus Home → Work → browser back lulus dengan tepat satu container Barba. Baseline mencatat tiga rejection `video.play()` akibat `pause()` dan tiga request video CDN `ERR_ABORTED` saat transisi route.
- Hasil rollback: detached worktree commit `42b9269` dengan `npm ci` melayani seluruh 9 route dengan HTTP 200 pada port 3100; working tree aktif tidak di-stash/reset dan worktree temp sudah dihapus.
- Bukti: `artifacts/browser/capture-manifest.json`, `browser-events.json`, `lifecycle.json`, `rollback.json`, `screenshots/`, dan `videos/`.
- Batasan: counter listener/RAF bersifat observasional dan bukan bukti memory leak; rekaman belum mencakup seluruh menu, About, sound, cursor, pointer/touch/keyboard, dan animation state penting.
- Keputusan: jangan membuat `ProjectProcess.tsx` sebelum pemilik proyek memberi persetujuan eksplisit.

### 2026-09-25 — Validasi lanjutan capture interaksi

- Status: Gate Fase 0 tetap terbuka; ditemukan blocker pada test interaksi yang sudah tersedia.
- Validasi: `npx tsc --noEmit --incremental false` lulus; test Playwright `record complete desktop and touch interaction states` gagal pada langkah menu keyboard desktop.
- Observasi: setelah focus dan Enter, `data-navigation-status` tetap `is-close`, bukan `is-open`; penyebab belum dipastikan. Skenario lanjutan About/sound/cursor/touch tidak tercapai dalam run ini.
- Perubahan: dokumentasi hasil dan matriks bukti tersisa di `docs/BASELINE.md`; tidak mengubah assertion, komponen aktif, atau runtime untuk menyembunyikan kegagalan.
- Tindak lanjut: audit visibilitas/focus/kesiapan menu per breakpoint, rekam perilaku legacy aktual, lalu lengkapi capture dan review manual termasuk audio.
- Keputusan: tidak membuat `ProjectProcess.tsx`; capture lengkap dan persetujuan eksplisit pemilik proyek tetap wajib.

### 2026-09-25 — Capture interaksi independen

- Mengganti test interaksi monolitik dengan sembilan test independen; menu keyboard pada breakpoint terlihat 767 px, desktop lain 1440 px, touch 375 px. Assertion state tetap tegas; touch menggunakan locator tap dan ditambah close menu.
- JSON parsial/error disimpan melalui finally; context video selalu ditutup. Bukti per skenario tidak tertahan oleh kegagalan skenario lain.
- Run awal: 9 passed dalam 2,9 menit; laporan JSON 0 unexpected/skipped/flaky, 33 snapshot dari sembilan manifest, 0 page error. TypeScript lulus.
- Tidak mengubah runtime/CSS/markup. Gate tetap terbuka: review manual video/audio, persistence, focus, navigasi dan coverage input tambahan masih diperlukan. Pilot React belum dimulai.

### 2026-09-25 — Paket penutupan teknis Fase 0

- Menambahkan `tests/browser/phase-zero-closeout.spec.ts` dan paket review `docs/PHASE-0-SIGNOFF.md`.
- Run akhir penutupan: 1 passed, 3 failed. Sound UI tidak mempertahankan enabled setelah reload/navigasi; menu tidak menutup/melepas lock setelah anchor Process. About overlay/Escape/lock lulus, fokus dicatat sebagai keterbatasan.
- TypeScript lulus; baseline HTTP terbaru 9 route/12 aset/0 kegagalan. Test merah dipertahankan tanpa skip atau pelonggaran assertion.
- Tidak ada runtime aktif diubah. Tahap berikutnya adalah keputusan pemilik terhadap L01–L04 dan review manual, bukan audit tanpa batas atau pilot diam-diam.

### 2026-09-25 — Penutupan teknis setelah perbaikan tiga blocker

- Native history khusus Barba menghindari wrapper Next; popstate dibatasi entry Barba. Readiness test menunggu namespace tujuan dan transisi selesai tanpa melonggarkan timeout/assertion.
- Diagnosis tambahan menemukan shader menggunakan canvas dengan context yang sudah hilang, sehingga Barba melakukan fallback reload. Cleanup kini mengganti canvas persisten; test mengassert `performance.timeOrigin` tidak berubah selama tiga siklus dan Forward.
- Rejection play/pause yang diharapkan ditangani tanpa retry, dan listener sound/global dibersihkan.
- Focused run 3/3; full run **23/23**, exit 0, tanpa skipped/flaky, 8,5 menit pada satu server. Syntax JS/TypeScript lulus, HTTP 9 route/12 aset/0 kegagalan. Bukti: `D:\arxenovasocial.com-v2\artifacts\browser\repair-full.json` dan `D:\arxenovasocial.com-v2\artifacts\browser\repair-checks.log`.
- Review visual/audio pemilik tercatat berdasarkan ringkasan sesi sebelumnya. Penutupan teknis selesai; izin pilot dan penerimaan keterbatasan perangkat nyata tidak diasumsikan. Production build belum dijalankan; legacy tetap default.

### 2026-09-25 — Persetujuan pemilik dan mulai analisis pilot

- Jawaban eksplisit pemilik: “Setujui keterbatasan coverage (Chromium/touch emulation, bukan perangkat nyata) dan izinkan mulai pilot Project Process”. Gate Fase 0 ditutup; acceptance Fase 1 tetap terbuka.
- Membaca kontrak PRD, rendering Home, markup Process, inventory runtime, dan handler playback aktif; mencatat scope dan risiko awal pilot.
- Perubahan sesi ini hanya dokumentasi; tidak mengubah source aplikasi, membuat candidate, atau mengaktifkan switch.
- Validasi: memeriksa kembali laporan final regression dan exit evidence; angka hasil tetap milik run sebelumnya, bukan rerun browser baru. Dokumen diperiksa kembali setelah edit. Build/perangkat nyata tidak dijalankan.
- Berikutnya: snapshot section, inventory DOM/CSS/runtime lengkap, dan capture behavior khusus Process sebelum data model atau komponen candidate.

### 2026-09-25 — Penutupan analisis baseline Project Process

- Melanjutkan run yang terhenti saat perintah ringkasan mengalami error PSReadLine. Laporan `D:\arxenovasocial.com-v2\artifacts\project-process\audit-continued.json` menunjukkan 8 passed, 0 unexpected/skipped/flaky; tidak mengklaim rerun browser baru.
- Menambahkan `D:\arxenovasocial.com-v2\scripts\project-process-summary.mjs`: verifikasi delapan hash source, snapshot byte-identik, tujuh profile, 101 PNG dan tujuh WebM tidak kosong, playback tiap video pada fase visible, serta URL/target ketiga link. Output `D:\arxenovasocial.com-v2\artifacts\project-process\audit-summary.json`.
- Checklist 1.1 selesai; merangkum inventory 86 node/66 elemen, CSS/runtime, tiga trigger tanpa pin, resize, touch, dan batasan di dokumen pilot.
- Blocker: hydration warning pada root class tetap ada; audit tidak mengassert console bersih. Video 0×0 sebelum visible dibedakan dari media error. YouTube destination di-stub, bukan validasi konten live.
- Validasi baru: syntax script, validator artefak, TypeScript lulus (exit 0). Tidak mengubah aplikasi aktif, tidak membuat/mengaktifkan candidate, dan tidak menjalankan build bersama dev server.
- Berikutnya: data model/candidate terisolasi; perbaikan root hydration sebagai unit shared terpisah sebelum acceptance. Gate Fase 1 tetap terbuka.

### 2026-09-25 — Data model dan candidate Process terisolasi

- Menyelesaikan 1.2–1.3: typed data tiga step, JSX markup-only, SVG/CSS persis baseline. Tidak memasang candidate pada route publik atau menambah behavior owner/dependency.
- Harness substitusi respons SSR + ReactDOMServer: DOM contract dan default legacy teruji. Normalisasi hanya serialisasi atribut boolean/order/empty video style; copy/whitespace/SVG/class tetap sama.
- Run final **7/7 passed**, 0 skipped/flaky/unexpected; 12 screenshot, layout identik dan pixel statis 0% pada lima viewport + touch. Video/cursor dikecualikan khusus capture; playback/mute/pause/re-entry/hover/fokus Enter/tap/tujuan popup diuji terpisah. Bukti: `D:\arxenovasocial.com-v2\artifacts\project-process\candidate-final.json`.
- Run gagal sebelumnya dipertahankan: loopback HMR diblok Chromium pada respons terintersep (diperbaiki izin origin lokal), lalu mask video touch tidak bekerja (diganti visibility khusus screenshot). Tidak mengubah aplikasi atau threshold untuk meloloskan tes.
- Batasan: hydration warning root masih direkam, RSC tetap legacy; belum bukti integrasi candidate React, navigation/cleanup/resize/rollback, loop penuh/video visual, production build, atau manual acceptance. Checklist acceptance tetap terbuka.
- Validasi: TypeScript dan syntax script lulus; validator baseline memastikan delapan hash tetap sama dan snapshot byte-identik. Dev server tetap berjalan; tidak menjalankan build bersamaan.
- Selanjutnya: root hydration terpisah + refresh baseline, integrasi candidate dan lifecycle/rollback, build saat dev berhenti, sign-off manual sebelum aktivasi.

### 2026-09-25 — Root hydration shared dan refresh baseline

- Mereproduksi mismatch root class pada pointer/touch sebelum edit. Script head menambahkan `w-mod-js` kedua dan class touch sebelum hydration.
- Mengubah hanya capability script di `D:\arxenovasocial.com-v2\app\layout.tsx` menjadi Next Script `afterInteractive` + `classList.add`; tidak memakai suppression baru atau mengubah history bridge/runtime.
- Regresi **21/21 passed**, 0 failed/skipped/flaky: root hydration 2, candidate SSR 7, menu 8, closeout 4. Bukti `D:\arxenovasocial.com-v2\artifacts\project-process\hydration-regression.json`. Enam profile Process tetap layout identik/pixel statis 0%; assertion pengecualian root warning dihapus.
- Refresh baseline **8/8 passed**, validator delapan hash/snapshot/101 screenshot/7 video lulus di `D:\arxenovasocial.com-v2\artifacts\project-process\post-hydration`. Hanya hash layout berubah; snapshot Process byte-identik. Artefak baseline lama tidak ditimpa; candidate lama disalin ke `D:\arxenovasocial.com-v2\artifacts\project-process\pre-hydration-fix\candidate`.
- Tes root meliputi direct Home/Work/Mammoth Murals, reload, Barba Home–Work–Back, pointer/touch. Tidak ada console error/hydration warning pada skenario yang diassert. Warning Three.js/GPU tetap dicatat, bukan klaim seluruh console bersih. Run pengembangan gagal tetap disimpan; readiness project disesuaikan karena kontrol sound tidak ada pada semua rute.
- TypeScript, syntax validator, dan git diff check lulus. Build belum dijalankan; dev tetap berjalan. Integrasi hydration/navigation/cleanup/resize/rollback candidate dan sign-off manual masih terbuka; legacy tetap default.

### 2026-09-26 - Fase 2 FAQ, implementasi dan validasi otomatis

- Menyelesaikan audit baseline, typed data, candidate markup-only opt-in, serta cleanup accordion/hover melalui transformer exact-match. Default FAQ tetap legacy dan tidak ada behavior owner React baru.
- Build v3 lulus; FAQ 10/10, root hydration candidate 2/2 dan legacy 2/2, regression Process 4/4, unit runtime 9/9, HTTP dua mode masing-masing 9 route/12 aset/0 gagal.
- Pixel final lima viewport memenuhi 0,5%, maksimum 0,042114%; koreksi terhadap update sementara yang menyebut seluruh hasil nol. Detail dan path bukti berada pada bagian Fase 2.
- Checklist Fase 2 menjadi 5/7. Acceptance manual dan aktivasi tetap terbuka; source legacy dipertahankan. Tidak melakukan commit, deploy, atau melanjutkan Fase 3.

### 2026-09-26 - Sign-off dan aktivasi Fase 2

- Stakeholder menyatakan review manual approved dan menerima candidate FAQ.
- Membalik switch menjadi candidate default; `FAQ_USE_LEGACY=1` adalah rollback FAQ setelah restart. Source `data/home.html` tetap dipertahankan.
- Build sign-off lulus; FAQ 10/10, route candidate 2/2, route rollback 2/2, HTTP kedua mode tanpa kegagalan. Pixel maksimum 0,009405% pada lima viewport.
- Checklist Fase 2 ditutup 7/7. Paket keputusan: `docs/PHASE-2-SIGNOFF.md`.

### 2026-09-26 - Fase 3 Problems, candidate automated-ready

- Audit menghasilkan kontrak 70 elemen, dua statistik, founder testimonial, foto Fadel, dan delapan client logo dalam `artifacts/problems/extraction/`; baseline lima viewport tersedia di `artifacts/problems/baseline/`.
- Menambahkan typed data dan `ProblemsSection` markup-only. Candidate hanya tersedia melalui `PROBLEMS_USE_CANDIDATE=1`; default tetap legacy dan raw `data/home.html` dipertahankan.
- Complete DOM/source/selection **1/1**, visual **5/5** dengan difference **0%** di seluruh viewport, dan behavior pointer/touch candidate+legacy **4/4**. Slider diuji untuk prev/next wrap, keyboard/touch, autoplay 16 detik, pause/resume viewport, breakpoint 767/768 dan 991/992, reload, serta tiga navigation cycle.
- Kegagalan visual historis 1920x1080 sebesar 90,554419% berasal dari overlay grain global fixed yang tertangkap pada fase animasi berbeda; geometri seluruh image identik dan isolated repeat 0%. Harness kini hanya memask overlay global tersebut, cursor, dan statistik yang beranimasi; threshold tetap 0,5% dan behavior diuji terpisah.
- Cleanup slider dipromosikan melalui transformer exact-match: per-root guard, named listeners, owned GSAP timelines, ScrollTrigger disposal, dan stale-callback guards. Unit runtime **10/10**, TypeScript, syntax runtime, tree freshness, dan whitespace check lulus.
- Root hydration seluruh sembilan route candidate/legacy masing-masing **2/2**; HTTP masing-masing **9 route / 12 aset / 0 gagal**; regression Process **4/4**. Production build candidate lulus sebelum acceptance run.
- Checklist Fase 3 menjadi **6/8**. Review manual visual state, grain in-context, timing/easing, dan stakeholder sign-off masih wajib; candidate belum diaktifkan default.

### 2026-09-26 - Sign-off dan aktivasi Fase 3

- Stakeholder menyatakan verifikasi manual selesai, approved, dan meminta sign-off Fase 3 serta melanjutkan ke fase berikutnya.
- `ProblemsSection` menjadi implementation default. `PROBLEMS_USE_LEGACY=1` memulihkan Problems legacy setelah restart; `PROCESS_USE_LEGACY=1` tetap mengembalikan seluruh Home legacy.
- Build sign-off lulus compile, lint/type validation, static generation 12/12, optimization, dan traces: `artifacts/problems/signoff-build.log`.
- Acceptance pasca-aktivasi default versus rollback **10/10**, tanpa skipped/unexpected/flaky: `artifacts/problems/signoff.json`. Pixel difference seluruh lima viewport **0%**.
- Root hydration seluruh sembilan route candidate/default **2/2** dan rollback **2/2**; HTTP kedua mode masing-masing **9 route / 12 aset / 0 gagal**; Process regression **4/4**.
- Checklist Fase 3 ditutup **8/8**. Source legacy tetap dipertahankan. Fase 4 CTA adalah tahap berikutnya dan belum diimplementasikan pada sign-off ini.

### 2026-09-26 - Fase 4 CTA, candidate automated-ready

- Mengekstrak kontrak CTA ter-normalisasi: **226 elemen**, heading display dan screen-reader, booking CTA, tiga SVG award, testimonial University of Sydney, serta satu remote AVIF. Bukti: `artifacts/cta/extraction/`.
- Baseline lima viewport tersimpan di `artifacts/cta/baseline/`; CTA Home tidak memiliki canvas/video sendiri. Canvas yang tampak berdekatan dimiliki Footer.
- Menambahkan typed content `data/home/cta.ts`, exact generated artwork `components/home/cta-artwork.ts`, dan `CtaSection` markup-only. Candidate hanya opt-in melalui `CTA_USE_CANDIDATE=1`; default tetap legacy.
- DOM contract/renderer **1/1**, visual **5/5** dengan pixel difference **0%** pada seluruh viewport, dan behavior/lifecycle legacy+candidate pointer/touch **4/4**. Link, popup destination, focus/tap, responsive image crop, scroll transforms, breakpoint 767/768/991/992, dan tiga navigation cycle diuji.
- Runtime legacy `Ae()` tetap owner: dua timeline scrub CTA dan satu image parallax desktop melalui shared `gsap.matchMedia`. Cleanup trigger identity dan detached trigger lulus pada tiga siklus; tidak ada handler React atau patch runtime CTA baru.
- Root hydration seluruh sembilan route candidate **2/2** dan legacy **2/2**; HTTP kedua mode masing-masing **9 route / 12 aset / 0 gagal**; Process regression **4/4**. Production build lulus static generation 12/12.
- Riwayat gagal dipertahankan: visual v1 gagal sekali pada 1024x768 karena fase scrub nondeterministik lalu isolated repeat dan full repeat 0%; behavior v1 menguji scroll dari posisi yang sudah sama, behavior v2 salah menganggap CTA tidak ada di Work. Assertion akhir memakai perubahan posisi scroll deterministik dan scope container Home, tanpa melonggarkan behavior gate.
- Checklist Fase 4 menjadi **4/5**. Review manual visual, timing/easing, award SVG, remote image crop, dan CTA interaction tetap wajib sebelum aktivasi default.

### 2026-09-26 - Sign-off dan aktivasi Fase 4

- Stakeholder menyatakan review manual accepted dan meminta CTA di-sign-off sebelum push.
- `CtaSection` menjadi implementation default. `CTA_USE_LEGACY=1` memulihkan CTA legacy setelah restart; `PROCESS_USE_LEGACY=1` tetap mengembalikan seluruh Home legacy.
- Build sign-off lulus compile, lint/type validation, static generation 12/12, optimization, dan traces: `artifacts/cta/signoff-build.log`.
- Acceptance pasca-aktivasi default versus rollback **10/10**, tanpa skipped/unexpected/flaky: `artifacts/cta/signoff-final.json`; pixel difference seluruh lima viewport **0%**.
- Root hydration seluruh sembilan route candidate/default **2/2** dan rollback **2/2**; HTTP kedua mode masing-masing **9 route / 12 aset / 0 gagal**; Process regression **4/4**.
- Static visual capture mematok progress tiga scrub animation CTA pada 50% untuk menghindari dua context menangkap fase berbeda; behavior suite tetap menggunakan scroll nyata. Threshold tidak dinaikkan dan elemen CTA tidak dimask.
- Checklist Fase 4 ditutup **5/5**. Source legacy dan seluruh rollback sebelumnya tetap dipertahankan.
