# Fase 0 — Paket keputusan baseline

## Hasil final perbaikan — 2026-09-25

**Penutupan teknis Fase 0 selesai: 23 passed, 0 failed/skipped/flaky**, exit 0, durasi 508,9 detik. Baseline 11/11, menu 8/8, closeout 4/4 dijalankan bersama dengan satu worker pada satu server dev di port 3000. Hasil ini menggantikan status gagal pada riwayat di bawah.

- Focused regression: **3/3 passed**, termasuk assertion dokumen tetap sama selama tiga siklus Home → Work → Back dan Forward.
- Native history ditangkap sebelum hydration untuk Barba; capture `popstate` hanya menangani entry `from: "barba"`. Next tetap memiliki history untuk entry lainnya.
- Cleanup shader mengganti canvas yang masih terhubung setelah `forceContextLoss`, sehingga inisialisasi berikutnya tidak memakai context yang hilang. Debug sebelumnya menunjukkan error `precision` yang memicu fallback reload Barba; assertion `performance.timeOrigin` kini mencegah fallback tersebut lolos test.
- Rejection video `play()` yang diharapkan (`AbortError`/`NotAllowedError`) ditangani tanpa retry; listener sound/global dibersihkan lewat lifecycle registry.
- Test menunggu namespace tujuan dan transisi Barba selesai sebelum input berikutnya. Assertion sound dan timeout tidak dilonggarkan.
- Syntax JS dan TypeScript lulus; HTTP baseline **9 route, 12 aset, 0 kegagalan**. Matriks browser **45 capture**, tanpa pageerror atau kegagalan jaringan lokal. Console warning/error legacy tetap tercatat; kelulusan bukan klaim console sepenuhnya bersih. Lifecycle masih merekam pembatalan request media saat transisi.

### Bukti final

- `D:\arxenovasocial.com-v2\artifacts\browser\repair-full.json`, `D:\arxenovasocial.com-v2\artifacts\browser\repair-full.log`, `D:\arxenovasocial.com-v2\artifacts\browser\repair-full.exit`
- `D:\arxenovasocial.com-v2\artifacts\browser\repair-focused-final.json`, `D:\arxenovasocial.com-v2\artifacts\browser\repair-checks.log`
- `D:\arxenovasocial.com-v2\artifacts\browser\capture-manifest.json`, `D:\arxenovasocial.com-v2\artifacts\browser\lifecycle.json`
- Diagnosis sebelum perbaikan canvas: `D:\arxenovasocial.com-v2\artifacts\browser\barba-debug.json`. Ini bukan laporan regression final.

### Approval dan batasan

Approval review visual/audio pemilik dicatat berdasarkan ringkasan konteks sesi sebelumnya yang diberikan pengguna. Ini bukan review audio oleh automation dan bukan persetujuan baru yang dibuat agen. L01–L04 telah diperbaiki sesuai permintaan pemilik dan seluruh closeout lulus. Coverage browser memakai Chromium dan touch emulation; bukan sertifikasi perangkat nyata, seluruh browser, ketepatan easing, atau ketiadaan memory leak. Production build tidak dijalankan saat server dev aktif.

**Gate Fase 0 ditutup berdasarkan keputusan eksplisit pemilik pada kelanjutan sesi 2026-09-25:** “Setujui keterbatasan coverage (Chromium/touch emulation, bukan perangkat nyata) dan izinkan mulai pilot Project Process”. Persetujuan ini mengizinkan mulai pilot, bukan acceptance hasil pilot atau sertifikasi perangkat nyata. Analisis Fase 1 dimulai; candidate belum dibuat atau diaktifkan dan legacy tetap default sampai acceptance pilot lulus. Production build dan validasi perangkat nyata belum dilakukan.

## Riwayat diagnosis dan validasi (bukan status terbaru)

## Pembaruan setelah izin perbaikan legacy

### Diagnosis A/B navigasi

### Validasi ulang 2026-09-25 — 20 passed, 3 failed; gate tetap terbuka

Terminal kembali menghasilkan output dan exit code. Tujuh perintah pemilik telah dijalankan. Run awal: navigasi terpisah 1 passed; closeout 4 failed; menu 8 failed; baseline browser 1 passed/10 failed; syntax JS, TypeScript, dan HTTP baseline lulus (9 route, 12 aset, 0 kegagalan). Ada dua process tree dev workspace yang sama dan respons 404 untuk chunk/CSS Next. Kelulusan navigasi dalam kondisi ini bukan validasi konflik Next/Barba. Log: `D:\arxenovasocial.com-v2\artifacts\browser\validation-initial.log`.

Setelah kedua process tree dev dihentikan dan port 3000 dipastikan bebas, tiga suite browser diulang bersama pada satu server yang dikelola Playwright. Hasil final: **20 passed, 3 failed**, exit **1**, tanpa skipped/flaky: baseline **9 passed/2 failed**, menu **8 passed**, closeout **3 passed/1 failed**. Capture visual/network matrix lulus, tetapi bukan persetujuan visual manusia. Bukti: `D:\arxenovasocial.com-v2\artifacts\browser\validation-single-server.json`, `D:\arxenovasocial.com-v2\artifacts\browser\validation-single-server.exit`, dan `D:\arxenovasocial.com-v2\artifacts\browser\validation-single-server.log`.

Kegagalan yang masih terbuka:
- Navigasi tiga siklus timeout menunggu `/work` pada `D:\arxenovasocial.com-v2\tests\browser\baseline.spec.ts:306`. Patch capture `popstate` belum menyelesaikan validasi navigasi.
- Touch **animations** menghasilkan pageerror `The play() request was interrupted by a call to pause()` pada `D:\arxenovasocial.com-v2\tests\browser\baseline.spec.ts:498`; bukan kegagalan tes touch sound.
- Closeout sound setelah navigasi dan Space tetap `aria-pressed=true`, diharapkan `false`, pada `D:\arxenovasocial.com-v2\tests\browser\phase-zero-closeout.spec.ts:54`.

Tidak ada perubahan runtime, test, atau timeout dalam sesi validasi ini. Berikutnya: ambil trace event/history/DOM untuk navigasi, diagnosis keyboard sound dan media play/pause, lalu ulangi regression. Review visual/audio dan sign-off eksplisit pemilik tetap diperlukan sebelum fase berikutnya.

### Riwayat patch ownership Back/Forward — sebelum validasi ulang

Source Next.js 14.2.18 dan Barba 2.x yang terbundel mengonfirmasi keduanya memasang listener `popstate`; Next juga membungkus `history.pushState`/`replaceState`, sementara Barba melakukan fetch dan penggantian container. Ini menjelaskan race URL/container pada bukti A/B. `D:\arxenovasocial.com-v2\app\layout.tsx` kini memasang capture listener sebelum hydration: bila runtime dan container Barba aktif, event Back/Forward dihentikan sebelum App Router dan diteruskan satu kali ke `barba.go`; bila Barba belum siap, fallback Next/browser tidak diubah. Timeout dan assertion lama tidak dilonggarkan.

`D:\arxenovasocial.com-v2\tests\browser\baseline.spec.ts` sekarang mengassert namespace `work`/`home` pada setiap siklus dan menambahkan verifikasi Forward ke `work`. Validasi belum boleh dinyatakan lulus: terminal tool gagal mengobservasi bahkan command `echo`, dan reporter `D:\arxenovasocial.com-v2\artifacts\browser\navigation-fix.json` kosong. Setelah runner pulih, jalankan test navigasi, seluruh closeout/menu/interaksi, syntax JS, TypeScript, dan HTTP baseline sebelum meminta sign-off.

Runtime HEAD sebelum patch disajikan melalui intercept Playwright, tanpa mereset working tree. Skenario home → work → Back → work gagal pada siklus kedua pada kedua versi; lihat `D:\arxenovasocial.com-v2\artifacts\browser\navigation-ab.json`. Ini mereproduksi kegagalan tanpa patch sound/menu/About, bukan bukti bahwa semua efek patch sudah bebas regression.

Probe tambahan setelah transisi selesai (`barba.transitions.isRunning === false`) menunjukkan URL home dapat tidak sesuai container aktif (versi sebelum patch masih `work`); versi sesudah patch pada probe itu kembali ke `home`. Bukti `D:\arxenovasocial.com-v2\artifacts\browser\navigation-ab-dom.json`. Hasil tidak konsisten antar run; jangan mengatasi dengan timeout tambahan atau menyatakan root cause sudah final. Konflik lifecycle/history perlu ditelusuri sebelum perubahan runtime navigasi. Tidak ada patch navigasi atau pelonggaran assertion diterapkan pada diagnosis ini. Gate tetap terbuka.

Pemilik meminta perbaikan L01–L04. Runtime aktif `D:\arxenovasocial.com-v2\public\js\monolog-runtime.js` kini diubah secara terbatas: initializer sound mengikuti state enabled untuk ikon/ARIA; menu anchor ditutup pada capture phase sebelum handler anchor legacy; About memindahkan/trap/mengembalikan fokus. Listener menu/About dibersihkan melalui registry lifecycle yang sudah ada. About yang dibuka dari menu mempertahankan lock menu saat modal ditutup.

Validasi terbaru: **12 passed** (8 audit menu + 4 closeout), **9 skenario interaksi passed**, syntax JS/TypeScript lulus, HTTP 9 route/12 aset/0 kegagalan. Bukti di `D:\arxenovasocial.com-v2\artifacts\browser\legacy-fix-run.json` dan `D:\arxenovasocial.com-v2\artifacts\browser\legacy-fix-regression.json`. Test About kini mengassert fokus masuk, Tab/Shift+Tab wrap, dan kembali ke opener setelah Escape/overlay.

**Regression belum seluruhnya hijau:** test lama tiga siklus Barba timeout menunggu `/work`, baik pada run gabungan maupun ulang terpisah. Percobaan click nyata juga timeout; perubahan eksperimen test dikembalikan. Penyebab dan apakah terkait patch belum dipastikan. Bukti: `D:\arxenovasocial.com-v2\artifacts\browser\legacy-fix-lifecycle.json`. Jangan menandai gate selesai atau menyatakan tidak ada regression. Visual 45 screenshot belum diambil ulang; audio aktual/review manusia tetap diperlukan. Bagian di bawah adalah catatan sebelum perbaikan, bukan status runtime terbaru.

Status: paket penutupan teknis diserahkan; **gate belum disetujui**. Instruksi “selesaikan” adalah izin pelaksanaan, bukan bukti review visual/audio atau penerimaan temuan di bawah. Tidak ada runtime, CSS, markup aktif, atau pilot React yang diubah/dibuat.

## Ringkasan bukti

| Pemeriksaan | Hasil / bukti |
| --- | --- |
| HTTP baseline terbaru | 9 route, 12 aset lokal, 0 kegagalan; `D:\arxenovasocial.com-v2\artifacts\baseline\manifest.json` |
| TypeScript | `npx tsc --noEmit --incremental false` lulus |
| Visual baseline sebelumnya | 45 screenshot (9 route × 5 viewport); `D:\arxenovasocial.com-v2\artifacts\browser\screenshots` |
| Rollback sebelumnya | `D:\arxenovasocial.com-v2\artifacts\browser\rollback.json` |
| Audit breakpoint/menu sebelumnya | 8 passed; `D:\arxenovasocial.com-v2\tests\browser\menu-audit.spec.ts` |
| Capture interaksi sebelumnya | 9 passed, 33 snapshot; `D:\arxenovasocial.com-v2\artifacts\browser\interaction-run.json` |
| Pemeriksaan penutupan terbaru | **1 passed, 3 failed**; `D:\arxenovasocial.com-v2\artifacts\browser\closeout-run.json` |

## Temuan untuk keputusan pemilik

| ID | Bukti aktual | Keputusan yang dibutuhkan |
| --- | --- | --- |
| L01 | Sound diaktifkan lewat Enter; setelah reload localStorage tetap `true`, tombol menunjukkan `aria-pressed=false`. Assertion persistence gagal. Tidak menyimpulkan audio aktual mati/menyala dari atribut. | Terima ketidaksinkronan state legacy sebagai baseline atau perbaiki terpisah sebelum pilot. |
| L02 | Setelah sound aktif dan click Work berhasil menuju `/work`, tombol kembali `aria-pressed=false`. Assertion persistence lintas navigasi gagal. Space dan reload-disabled setelah assertion tersebut belum tercapai. | Sama seperti L01; jangan klaim persistence lulus. |
| L03 | Menu overlay close bekerja dan melepas lock. Setelah menu dibuka kembali dan Process (`#process`) diklik, status tetap `is-open` dan body tetap terkunci. Menu Work sebenarnya `#work`, bukan `/work`. | Terima perilaku anchor legacy atau perbaiki terpisah. Close menu lintas route belum dibuktikan oleh skenario anchor ini. |
| L04 | About open/Escape/overlay close serta pelepasan lock lulus. Fokus tetap pada opener saat modal dibuka; sesudah overlay close fokus tercatat pada overlay. Tidak ada bukti focus trap/restoration yang lengkap. | Terima keterbatasan fokus baseline atau tangani aksesibilitas sebagai pekerjaan terpisah. |

Assertion tidak dilonggarkan, tidak di-skip, dan tidak diberi expected-failure. Menjalankan seluruh suite saat ini akan tetap merah karena tiga temuan tersebut. Ini bukan regression candidate: candidate belum ada. Tidak ada klaim seluruh gate teknis hijau.

## Review manusia yang dibatasi

1. Visual: buka screenshot Home/Work/project pada lima viewport di folder screenshots; cek layout, crop, wrapping, dan missing media.
2. Interaksi/animasi: buka `D:\arxenovasocial.com-v2\artifacts\browser\interaction-states` dan video di `D:\arxenovasocial.com-v2\artifacts\browser\interaction-videos`. Manifest `interaction-desktop-*.json` dan `interaction-touch-*.json` mencatat state; capture posisi bukan bukti ketepatan easing/timing. Video lama mungkin masih ada.
3. Temuan akhir: laporan `closeout-run.json` memuat path video masing-masing test di `D:\arxenovasocial.com-v2\artifacts\browser\closeout-output`, attachment fokus, serta error assertion. Ini acuan run terakhir, bukan seluruh isi folder lama.
4. Audio aktual: pada aplikasi aktif toggle sound, hover/click, reload dan navigasi. Dengarkan apakah suara sesuai dan tidak berlapis. Rekaman Playwright bukan bukti audio aktual.
5. Touch nyata: periksa menu/About/scroll pada perangkat nyata atau nyatakan eksplisit menerima batasan emulasi untuk baseline awal.

## Keputusan akhir

- [x] Approval visual/audio pemilik dicatat dalam ringkasan konteks sesi sebelumnya; batasan bukti dijelaskan di atas.
- [x] L01–L04 ditetapkan harus diperbaiki sebelum pilot; perbaikan dan closeout kini lulus.
- [x] Keterbatasan coverage/perangkat nyata diterima secara eksplisit.
- [x] Pemilik mengizinkan mulai pilot Project Process; legacy tetap default sampai acceptance pilot lulus.

Checklist di atas diperbarui berdasarkan jawaban eksplisit pemilik dalam sesi ini. Jangan membuka kembali perbaikan Fase 0 tanpa kegagalan baru; lanjutkan satu unit Project Process sesuai acceptance gate Fase 1.