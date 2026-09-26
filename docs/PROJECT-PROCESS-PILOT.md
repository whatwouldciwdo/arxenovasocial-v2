# Fase 1 — Pilot Project Process

## Status dan izin

**SIGN-OFF (2026-09-26):** stakeholder menyatakan seluruh verifikasi manual sudah disetujui dan meminta sign-off dilanjutkan. Review media visual, crop/frame/loop, scroll-index, timing/easing, serta behavior diterima bersama seluruh bukti otomatis. Fase 1 ditutup **43/43**; candidate tetap aktif dan fallback `PROCESS_USE_LEGACY=1` serta raw legacy tetap dipertahankan. Paket keputusan: `docs/PHASE-1-SIGNOFF.md`.

**Update final otomatis (2026-09-26):** candidate React telah dipromosikan ke aplikasi utama dengan fallback restart `PROCESS_USE_LEGACY=1`; raw legacy tetap tersedia. Build final lulus. Candidate/fallback masing-masing **8/8** untuk integration, scoped ownership, dan hydration seluruh sembilan route; Process parity lulus **7/7**; HTTP audit masing-masing 9 route/12 aset/0 gagal; pixel fallback↔candidate lulus 5/5 pada threshold 0,5%. Checklist Fase 1 adalah **34/43**. Pilot belum selesai karena crop/frame/loop media, timing/easing scroll-index, review manual, dan stakeholder sign-off belum dibuktikan. Detail: `docs/PROCESS-INTEGRATION-BLOCKERS.md` dan `artifacts/home-shell/phase1-final-*`.

**Update v7 (2026-09-25):** cleanup cursor fixture kini memiliki listener, pending RAF, dan tween sendiri; regresi **6/6**. Production candidate/repeat/fallback masing-masing **4/4**, build fixture exit **0**. Audit tiga siklus pointer/touch menunjukkan empat listener cursor tidak lagi tumbuh; document/font, ticker dan Process stabil per halaman, detached trigger 0. Census bukan audit resource menyeluruh atau acceptance visual/manual. **1.4 tetap terbuka**, legacy default, source aplikasi utama/assertion integrasi tidak diubah pada kelanjutan ini. Rincian dan bukti: `D:\arxenovasocial.com-v2\docs\PROCESS-INTEGRATION-BLOCKERS.md`. Update di bawah adalah riwayat.


**Update v6 (2026-09-25):** production fixture v5 candidate/repeat/fallback masing-masing **4/4**; v6 candidate/repeat/fallback **4/4** masing-masing setelah cleanup split shared dan listener scroll tema. Build fixture v4–v6 exit **0**; tooling **5/5**. Audit v6 membuktikan listener document/font stabil, tetapi menemukan empat handler cursor window bertambah tiap navigasi pointer. Fase 1.4 tetap terbuka: cleanup menyeluruh, visual/manual acceptance, dan validasi aplikasi utama belum selesai. Repair tetap opt-in pada fixture saja, assertion integrasi utuh, legacy default. Hasil lama berikut adalah riwayat; rincian terbaru: `D:\arxenovasocial.com-v2\docs\PROCESS-INTEGRATION-BLOCKERS.md`.


**Update runtime fixture terbaru:** eksperimen cleanup Lenis/SplitText/matchMedia menghasilkan candidate dev **4/4 + repeat 4/4**, dan switch candidate→fallback dev **4/4**. Namun candidate melalui `next start` **0/4**: jumlah trigger Problems/eyebrow direct–reload/back belum stabil. Fixture build menghasilkan artefak runnable (wrapper exit tidak terkonfirmasi bersih). Source aplikasi utama tetap tidak diedit sesi ini; legacy default. Parity visual, production acceptance, dan audit listener/RAF masih terbuka. Detail terbaru dan bukti ada di `D:\arxenovasocial.com-v2\docs\PROCESS-INTEGRATION-BLOCKERS.md`; catatan sebelumnya di bawah adalah riwayat.


**Update integrasi terbaru:** spike Next/RSC sudah dijalankan, tetapi candidate dan kontrol legacy masing-masing **0/4 lulus**: playback gagal setelah resize 767→768 dan Process tertinggal di Work karena berada di luar container Barba. Detail dan reproduksi: `D:\arxenovasocial.com-v2\docs\PROCESS-INTEGRATION-BLOCKERS.md`. Tidak ada aktivasi atau perubahan source aplikasi utama pada tahap integrasi ini; hasil root hydration di bawah tetap merupakan riwayat tes terpisah.

**Audit shared berikutnya:** fixture dengan empat penutup div berlebih dihapus kini menghapus Process saat menuju Work, tetapi repaired legacy/candidate tetap 0/4 lulus (detached trigger heading Problems; reset scroll satu detik setelah reinitialisasi Lenis; satu mismatch jumlah trigger direct/reload candidate). Struktur belum dipromosikan: layout/DOM hasil animasi berbeda dan belum deterministik. Lihat bagian terbaru dokumen blocker untuk working directory fixture yang wajib, bukti, dan diagnosis resize. Source utama tetap tidak berubah pada sesi audit ini.



Data model dan candidate markup dibuat terisolasi; legacy tetap default. Pada kelanjutan 2026-09-25, root hydration diperbaiki sebagai unit shared terpisah di `D:\arxenovasocial.com-v2\app\layout.tsx`: regresi **21/21** dan refresh baseline **8/8** lulus. Source Home, CSS, dan runtime tidak berubah pada tahap ini. Pemilik menerima batasan Chromium/touch emulation dan mengizinkan pilot, bukan aktivasi candidate. Acceptance integrasi hydration/lifecycle candidate, build, rollback, dan manual masih terbuka. Bagian hasil sebelum perbaikan di bawah adalah riwayat; bukti terbaru ada pada bagian root hydration.

Kontrak: `D:\arxenovasocial.com-v2\PRD.md`. Checklist: `D:\arxenovasocial.com-v2\TASK.md` bagian 1.1–1.6. Bukti Fase 0: `D:\arxenovasocial.com-v2\docs\PHASE-0-SIGNOFF.md`.

## Scope dan temuan awal yang diperiksa

- Hanya `#process.process_home_wrap` dalam `D:\arxenovasocial.com-v2\data\home.html`; section lain dan shell Barba tidak ikut dimigrasikan.
- `D:\arxenovasocial.com-v2\app\page.tsx` memakai generated hybrid React tree: `ProjectProcess` adalah node React dan subtree lain tetap opaque. Loader menormalisasi prefix `src="public/` dan memperbaiki boundary shell secara guarded; fallback tetap merender output loader dengan `dangerouslySetInnerHTML`.
- Section memiliki inline style, heading aksesibel “Project Process”, SVG heading, wrapper list/listitem, tiga item, video/link dan CTA. SVG, atribut, urutan node, copy, serta karakter tak terlihat pada span nomor harus dipertahankan.
- Inline CSS memuat `.process_home_content-listlist`, sedangkan wrapper list memakai `.process_home_content-list`. Jangan membetulkan perbedaan ini sebagai refactor parity; ukur hasil baseline lebih dahulu. Source inline style juga memuat literal `\n`; jangan menormalisasinya tanpa pembandingan DOM/CSS browser.
- Video berada di link `[data-video="playpause"]`, memakai `loop`, `muted`, `playsinline`, `preload="none"` dan class `.overview_home_video`. Link YouTube memakai `target="_blank"`, cursor text dan aria-label. Pertahankan URL lengkap termasuk query dan encoding.
- `D:\arxenovasocial.com-v2\public\js\monolog-runtime.js` memiliki handler `lt()` untuk playback: ScrollTrigger masuk/masuk kembali memanggil play, keluar/keluar kembali pause. Cleanup membunuh trigger dan pause video; rejection yang diharapkan ditangani tanpa retry.
- Pencarian literal awal `.process_` dan `.overview_home_video` pada runtime tidak menemukan lookup langsung. Dependensi generik dan hasil pengukuran baseline kini dirangkum di bawah; pencarian literal saja tidak dipakai sebagai bukti kelengkapan.

## Urutan kerja pilot (langkah 1–4 selesai; perbandingan SSR awal pada langkah 5 lulus)

1. Ekstrak snapshot section tanpa mengubah source aktif; simpan hash dan cocokkan kembali byte snapshot dengan source.
2. Inventaris seluruh node/atribut/SVG/style dan data tiga step; audit stylesheet legacy beserta selector generik, breakpoint, dan runtime terkait.
3. Rekam baseline khusus Process pada lima viewport wajib, batas 767/768 dan 991/992, entry/scroll/resize, keyboard/hover/touch, video/cursor/CTA. Bukti lama bukan otomatis coverage lengkap pilot.
4. Setelah analisis lengkap, buat typed data dan candidate markup dengan legacy sebagai satu-satunya behavior owner. Integrasi akhirnya memakai hybrid React tree pada route Home yang sama; tidak ada route pembanding publik.
5. Bandingkan DOM/visual/behavior, navigation-cycle, cleanup, aset dan hydration; lakukan build hanya setelah dev server dihentikan. Uji rollback dan minta acceptance manual sebelum aktivasi.

## Hasil audit baseline dan verifikasi kelanjutan

- Harness: `D:\arxenovasocial.com-v2\tests\browser\project-process-audit.spec.ts`.
- Run browser terakhir: `D:\arxenovasocial.com-v2\artifacts\project-process\audit-continued.json`: **8 passed, 0 unexpected/skipped/flaky**, 185,259 detik. Ini hasil run sebelumnya, bukan rerun pada penutupan dokumentasi.
- Verifikasi baru: `D:\arxenovasocial.com-v2\scripts\project-process-summary.mjs` lulus (exit 0); delapan hash source masih cocok, snapshot cocok byte-for-byte dengan section aktif, seluruh PNG/WebM ada dan tidak kosong. Ringkasan: `D:\arxenovasocial.com-v2\artifacts\project-process\audit-summary.json`.
- Snapshot: 13.655 byte; 86 node / 66 elemen, 1 SVG / 14 path, 3 video. Inventory menyimpan atribut, namespace, text node, class, ancestor, raw CSS dan DOM ternormalisasi.
- Capture: **101 screenshot dan 7 rekaman video**. Lima viewport wajib, satu touch profile dan satu resize profile. Entry, tiga step, playback/time progression, hover/cursor, focus/Tab/Shift+Tab/Enter, tap, exit/pause, re-entry, wheel/touch scroll tercakup. Resize melintasi 992/991 dan 768/767 dua arah; initial dan settled state disimpan karena legacy dapat mereset scroll saat menginisialisasi ulang Lenis.

| Viewport | Tinggi section pada step-1-visible (px) |
|---|---:|
| 375×812 pointer/touch | 1245.359375 |
| 768×1024 | 1009.1875 |
| 1024×768 | 1288.78125 |
| 1440×900 | 1742.109375 |
| 1920×1080 | 2219.21875 |

### CSS dan behavior ownership

- Rule relevan/direct: globals 2/0, Webflow 135/55, custom 15/5, inline Process 5/5, inline Home lain 2/0. Ini hitungan rule yang diseleksi inventory, bukan seluruh stylesheet. Media condition dan raw CSS tersedia di inventory; CSS invalid/typo tidak diperbaiki.
- Runtime tidak memiliki literal `process_` atau `overview_home_video`. Dependensi generik (video, cursor, hover, stacking, lifecycle, resize dan transition) direkam dengan offset/excerpt; pencarian token saja bukan bukti tidak adanya dependensi.
- Semua snapshot merekam **3 trigger Process**, tanpa pin. Posisi elemen terukur mencakup relative/absolute/static; tidak ada sticky pada elemen yang diukur. Jangan menambahkan pin, sticky, atau animasi index baru hanya berdasarkan nama section.
- `lt()` memiliki playback melalui `[data-video="playpause"]`: start `0% 100%`, end `100% 0%`, play pada enter/enterBack, pause pada leave/leaveBack; cleanup kill trigger dan pause. Legacy tetap satu-satunya behavior owner pada candidate pertama.
- Ketiga judul: “We uncover your story”, “We shape your digital presence”, “We send it into the world”. Copy lengkap, dua CTA per item, URL YouTube dengan query asli, video remote, dan span nomor dengan karakter tak terlihat ada di inventory. Pertahankan juga double-space pada deskripsi step 3.
- Video `0×0` pada snapshot step pertama bukan otomatis kegagalan: video berikutnya memakai `preload="none"` dan belum tentu ter-load. Validator baru mengecek masing-masing video pada fase step-n-visible: dimensi positif, readyState ≥2, currentTime >0, tidak pause, tanpa media error.

### Blocker dan batasan acceptance

1. **Hydration warning baseline masih ada di semua profile**: script head pada `D:\arxenovasocial.com-v2\app\layout.tsx` menambah `w-mod-js` yang sudah dirender server; touch menambahkan `w-mod-touch` sebelum hydration. Audit merekam console error ini tetapi hanya menggagalkan pageerror dan HTTP error lokal. Maka 8/8 bukan klaim console bersih; tangani sebagai perubahan shared behavior terpisah sebelum acceptance.
2. Warning deprecation Three.js ada di semua profile; WebGL ReadPixels performance warning ada pada 375 pointer. Tidak ada pageerror/requestfailed/HTTP error pada events hasil ini. Warning tidak dihapus dari bukti.
3. Link `_blank` dan tujuan ketiga YouTube diuji dengan destination stub; konten eksternal live tidak divalidasi.
4. Candidate dan perbandingan DOM/layout/pixel statis awal sudah tersedia (lihat hasil di bawah), tetapi belum ada integrasi hydration React candidate, navigation-cycle candidate, resize lintas breakpoint candidate, production build, rollback candidate, atau sign-off manual pilot. Screenshot/video tersedia bukan berarti visual acceptance selesai.
5. Chromium dan touch emulation, bukan perangkat nyata; batasan ini diterima pemilik untuk memulai pilot.

### Reproduksi ringkasan tanpa paste multiline PowerShell

```powershell
node D:\arxenovasocial.com-v2\scripts\project-process-summary.mjs
```

Script memverifikasi integritas bukti, tidak menjalankan browser atau mengubah source aplikasi. Argumen opsional adalah path laporan JSON relatif terhadap direktori artefak (atau path absolut). Gagal bila source berubah, bukti hilang/kosong, profile gagal, atau kontrak playback/link tidak sesuai. Jangan gunakan setelah mengubah source lalu menganggap hash mismatch sebagai regression; ambil baseline baru secara eksplisit.

Riwayat penutupan analisis sebelum implementasi candidate: syntax script, eksekusi validator, dan TypeScript `--noEmit --incremental false` lulus. Dev server masih aktif; build sengaja tidak dijalankan bersamaan. Hasil tahap candidate berikutnya dicatat di bawah; default tetap legacy sampai seluruh acceptance lulus.

## Candidate terisolasi — hasil implementasi 2026-09-25

- Data/type: `D:\arxenovasocial.com-v2\data\home\process.ts`; komponen markup: `D:\arxenovasocial.com-v2\components\home\ProjectProcess.tsx`. SVG/CSS statis: `D:\arxenovasocial.com-v2\components\home\process-artwork.ts`, diekstrak dari source melalui `D:\arxenovasocial.com-v2\scripts\extract-process-artwork.mjs`. CSS tetap muncul sebagai style inline, tanpa koreksi typo/literal backslash-n.
- `D:\arxenovasocial.com-v2\scripts\render-process-candidate.mjs` mengompilasi JSX memakai TypeScript terpasang dan merender dengan ReactDOMServer. Output sementara berada di artefak, bukan source route. Ini menghindari transform JSX component-testing Playwright yang bukan React element.
- Harness `D:\arxenovasocial.com-v2\tests\browser\project-process-candidate.spec.tsx` memakai switch **lokal browser test**: legacy default; candidate mengganti section pada respons document Home saja. Tidak ada route pembanding publik, perubahan app route, client boundary, atau handler React baru. Runtime legacy tetap satu-satunya owner.
- DOM dibandingkan penuh termasuk namespace, urutan child/text, whitespace/invisible characters, SVG path, CSS, class, media/link/copy. Pengecualian serialisasi eksplisit: urutan atribut, nilai atribut boolean video, dan missing video style setara `style=""`. Ini bukan byte-identical HTML dan bukan izin normalisasi lain.
- Run final `D:\arxenovasocial.com-v2\artifacts\project-process\candidate-final.json`: **7 passed, 0 unexpected/skipped/flaky**, 115,723 detik, exit 0. Satu test DOM/default dan enam profile (lima viewport wajib + 375 touch). Layout terukur sama; **0% pixel difference statis** semua profile, 12 screenshot.
- Playback masing-masing video saat terlihat, muted, pause setelah meninggalkan Process, re-entry step pertama, tiga trigger, hover CTA/cursor, fokus + Enter, tap touch, URL/target popup teruji. YouTube destination di-stub. Ini belum membuktikan Tab traversal, loop penuh, pin/cleanup lintas navigasi, atau seluruh timing animasi.
- Screenshot statis mengecualikan video dan cursor dengan CSS `visibility: hidden` khusus capture, bukan perubahan aplikasi. Frame/crop visual video masih perlu review terpisah. Run awal gagal karena izin loopback HMR Chromium pada respons terintersep; izin hanya diberikan pada origin lokal. Run berikutnya 6/7 karena video touch tidak termask; capture CSS memperbaikinya tanpa menaikkan threshold 0,5%. Laporan run gagal tetap tersedia, artefak per-profile mengacu run final.
- **Bukan acceptance hydration:** RSC payload tetap legacy; substitusi SSR tidak membuktikan hydration candidate React maupun navigasi Barba/RSC. Satu warning root class yang sudah diketahui tetap direkam per implementation/profile dan dikecualikan secara spesifik dari assertion eksplorasi; pageerror/HTTP error/console error lain menggagalkan test. Tidak boleh mengklaim console bersih.
- TypeScript, syntax kedua script, dan validator baseline delapan hash lulus. Source baseline tetap utuh; tanpa dependency baru. Dev server tetap aktif; build belum dijalankan.

Reproduksi dari root workspace:

```powershell
$env:BASELINE_URL='http://127.0.0.1:3000'
$env:PLAYWRIGHT_JSON_OUTPUT_NAME='D:\arxenovasocial.com-v2\artifacts\project-process\candidate-final.json'
& D:\arxenovasocial.com-v2\node_modules\.bin\playwright.cmd test project-process-candidate.spec.tsx --reporter=line,json --output D:\arxenovasocial.com-v2\artifacts\project-process\candidate-output
```

## Root hydration shared — kelanjutan 2026-09-25

Perbaikan root dipisahkan dari aktivasi candidate. `D:\arxenovasocial.com-v2\app\layout.tsx` sebelumnya menambahkan class root sebelum hydration (duplikat `w-mod-js`, tambahan `w-mod-touch`). Capability script kini memakai Next Script `afterInteractive` dan `classList.add`, tanpa suppression warning baru. History bridge tetap utuh. Class touch baru tersedia setelah hydration; parity first-paint sebelum hydration belum direview manual.

### Bukti terkonfirmasi

- Sebelum edit: `D:\arxenovasocial.com-v2\artifacts\project-process\hydration-before.json` mereproduksi warning pada kedua profile.
- Regresi: `D:\arxenovasocial.com-v2\artifacts\project-process\hydration-regression.json`, **21 expected, 0 unexpected/skipped/flaky**, exit 0. Root hydration 2 + candidate SSR 7 + menu 8 + closeout 4.
- Tes root baru `D:\arxenovasocial.com-v2\tests\browser\root-hydration.spec.ts` memeriksa direct Home/Work/Mammoth Murals, reload, Barba Home–Work–Back, pointer/touch, class capability tunggal, console/page/HTTP errors, dan warning hydration. Three.js deprecation/GPU performance warnings tetap direkam; tidak diklaim seluruh warning hilang. Ini bukan smoke semua tujuh project atau navigation-cycle candidate tiga kali.
- Candidate SSR kembali lolos enam profile: layout identik, pixel difference statis 0%, video/cursor tetap dikecualikan khusus capture. Pengecualian warning root pada assertion candidate dihapus. Bukti terbaru per-profile berada di `D:\arxenovasocial.com-v2\artifacts\project-process\candidate`; bukti sebelumnya disalin ke `D:\arxenovasocial.com-v2\artifacts\project-process\pre-hydration-fix\candidate`.
- Baseline baru: `D:\arxenovasocial.com-v2\artifacts\project-process\post-hydration\audit.json`, **8/8**, exit 0. Validator `D:\arxenovasocial.com-v2\artifacts\project-process\post-hydration\audit-summary.json` memverifikasi delapan hash, snapshot, 101 screenshot dan tujuh video. Dibanding inventory lama, hanya hash layout berubah; snapshot section tetap byte-identik. Audit menyimpan events, bukan assertion console bersih.
- TypeScript `--noEmit --incremental false`, syntax validator, dan `git diff --check` lulus. Tanpa dependency baru. Build belum dijalankan, dev tetap aktif.

### Baseline dan rollback

Baseline lama tetap tersimpan dan mencerminkan source sebelum perbaikan; validator lama terhadap source saat ini memang akan gagal pada hash layout. Jangan mengubah hash lama untuk meloloskan validasi. Harness audit dan validator sekarang menerima `PROJECT_PROCESS_BASELINE_DIR` untuk direktori bukti terpisah.

```powershell
$env:PROJECT_PROCESS_BASELINE_DIR='D:\arxenovasocial.com-v2\artifacts\project-process\post-hydration'
node D:\arxenovasocial.com-v2\scripts\project-process-summary.mjs audit.json
```

Snapshot layout sebelum perbaikan: `D:\arxenovasocial.com-v2\artifacts\project-process\pre-hydration-fix\layout.tsx`. Rollback unit ini cukup mengembalikan capability script ke snapshot tersebut, tanpa menghapus history bridge atau perubahan lain yang sudah ada sebelum sesi. Prosedur ini belum dieksekusi sebagai tes rollback.

Berikutnya: harness integrasi React candidate yang tidak mengubah default/public route, validasi hydration/lifecycle/navigation tiga siklus/resize/rollback, build setelah dev dihentikan, serta review manual visual/video (termasuk first-paint touch). Root hydration yang lulus tidak menutup gate integrasi candidate. Legacy tetap default.
