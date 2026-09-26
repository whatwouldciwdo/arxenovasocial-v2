# Fase 0 — Baseline dan Regression Harness

**Pembaruan final:** L01–L04 dan tiga blocker regression telah diperbaiki. Full regression **23/23 passed**, exit 0, tanpa skipped/flaky; focused regression **3/3 passed**. Tiga siklus navigasi dan Forward terbukti tanpa reload dokumen. Bukti final tersedia di `D:\arxenovasocial.com-v2\docs\PHASE-0-SIGNOFF.md`. Catatan “runtime tidak diubah” di riwayat hanya berlaku sebelum izin perbaikan.

**Status terkini:** Fase 0 ditutup setelah pemilik secara eksplisit menerima coverage Chromium/touch emulation (bukan perangkat nyata) dan mengizinkan mulai pilot Project Process pada kelanjutan sesi 2026-09-25. Analisis pilot dimulai; legacy tetap default dan candidate belum diaktifkan. Production build/perangkat nyata belum divalidasi. Bagian bertanggal di bawah adalah riwayat, bukan hasil final terbaru.

Dokumen ini melengkapi kontrak di `PRD.md`. Harness hanya membaca output aplikasi; tidak ada public route atau komponen aktif yang diubah.

Inventaris selector, state, behavior owner, dan lifecycle tersedia di `docs/RUNTIME-INVENTORY.md`.

## Menjalankan baseline

1. Jalankan aplikasi legacy: `npm run dev`.
2. Di terminal lain jalankan `npm run baseline`.
3. Untuk host lain: `$env:BASELINE_URL='http://127.0.0.1:3001'; npm run baseline`.
4. Review `artifacts/baseline/manifest.json` dan snapshot di `artifacts/baseline/html/`.

## Menjalankan baseline browser

1. Pastikan Chromium Playwright tersedia: `npx playwright install chromium`.
2. Jalankan `npm run baseline:browser`. Config akan menjalankan/reuse Next dev server pada `http://127.0.0.1:3000`.
3. Jika server sudah dijalankan sendiri atau memakai port lain: `$env:BASELINE_URL='http://127.0.0.1:3000'; npm run baseline:browser`.
4. Review `artifacts/browser/capture-manifest.json`, `browser-events.json`, `lifecycle.json`, `rollback.json`, screenshot, dan video. `playwright-report/` serta `test-results/` hanya output transient.

Harness Chromium mengambil 45 full-page screenshot (9 route × 5 viewport), menunggu font/media secara bounded, mencatat console/network, computed rectangle section, wrapping heading, root state, serta counter runtime. Test interaksi merekam FAQ, Process, dan tiga siklus client navigation Home → Work → browser back. Instrumentasi listener/RAF dipasang sebelum runtime, tetapi counternya bersifat observasional: ia tidak dapat membuktikan identitas listener atau kebocoran memori dengan sendirinya.

Harness mengambil `/`, `/work`, dan tujuh deep-link project; mencocokkan slug `data/projects.ts` dengan `data/html-projects.ts`; memeriksa aset lokal; mencatat metadata, link, media, section, state root; lalu mengulang seluruh request tiga siklus. Siklus ini adalah smoke test HTTP, **bukan** bukti lifecycle browser atau cleanup listener.

## Coexistence dan rollback

- Public route tetap merender implementation legacy.
- Candidate dibuat sebagai komponen terpisah dan tidak dipasang sebelum acceptance gate lulus.
- Saat pilot siap diuji, pilih implementation melalui satu switch lokal yang default-nya `legacy`; jangan membuat route publik pembanding dan jangan menghapus markup sumber.
- Rollback satu perubahan: nonaktifkan switch candidate atau jalankan `git revert <commit-candidate>`. Verifikasi dengan `npm run baseline`, lalu review bahwa seluruh status 200 dan hash baseline yang relevan kembali sama.
- Baseline source tersimpan di commit `42b92697239e39e0911e49e4f96399f4850eb943` dan remote `origin/main`.

## Capture visual dan review manual

Playwright mengambil full-page screenshot setiap route pada **375×812, 768×1024, 1024×768, 1440×900, dan 1920×1080**. Review manusia tetap wajib untuk memastikan crop, animasi, dan state visual benar.

Sebelum capture:

1. Gunakan browser/versi, DPR, zoom 100%, OS, dan font environment yang sama.
2. Hard refresh; tunggu `document.fonts.ready`.
3. Tunggu semua image selesai (`img.complete`) dan video mencapai minimal `loadeddata`; catat media yang gagal.
4. Tunggu preloader/page transition selesai, scroll ke atas, lalu tunggu minimal dua animation frame dan dua detik tanpa layout shift yang terlihat.
5. Matikan extension dan jangan mengubah reduced-motion/network emulation antarcapture.
6. Simpan console errors, failed network requests, dimensi section, wrapping heading, dan video interaksi penting bersama screenshot.

Nama file: `<route>--<width>x<height>--legacy.png` dan `--candidate.png`. Project route menggunakan slug. Rekam menu, About modal, FAQ, cursor, sound, smooth scroll, process sticky/index/video, transition, dan tiga siklus navigasi sebagai video atau catatan manual.

## Comparison gate

- Bandingkan pasangan dengan dimensi identik menggunakan alat pixel-diff yang konsisten.
- Maksimum automated pixel difference adalah **0,5% per viewport**.
- Threshold bukan auto-approval: setiap perbedaan yang terlihat harus direview manual.
- Masking hanya boleh untuk konten nondeterministik yang didokumentasikan; jangan mask unit yang sedang dimigrasikan.
- Candidate gagal jika ada perbedaan layout/copy/aset, behavior hilang, console/hydration error baru, request aset 404, atau duplicate initialization.

## Bukti browser 2026-09-23

- Matriks 45 capture lulus: font `loaded`, 0 page error, 0 failed request, dan 0 respons HTTP ≥400.
- Tiga siklus browser lulus dan selalu berakhir dengan tepat satu container Barba. Baseline merekam tiga rejection `video.play()` yang diinterupsi `pause()` dan tiga request video CDN `ERR_ABORTED` ketika meninggalkan route; ini adalah perilaku legacy saat transisi dan harus dibandingkan dengan candidate, bukan dianggap error baru candidate.
- Snapshot stabil awal Home mencatat 14 ScrollTrigger, 5 cleanup function, 3 canvas, 0 elemen audio, dan 4 video. Nilai berubah sesuai route dan fase transisi; beberapa global tidak tersedia saat context diganti, sehingga nilai `null` bukan angka nol.
- Counter listener dan RAF hanya menghitung panggilan API sejak document dibuat. Counter tidak menangkap seluruh abstraksi internal library, tidak mengidentifikasi callback duplikat, dan bukan pengganti heap/memory profiling.
- Rekaman otomatis belum mencakup seluruh kombinasi menu, About modal, sound, cursor, pointer/touch/keyboard, dan animasi penting. Item video lengkap tetap memerlukan review/capture tambahan sebelum dinyatakan selesai.

## Bukti rollback

Rollback diuji tanpa menyentuh perubahan lokal: commit `42b92697239e39e0911e49e4f96399f4850eb943` dibuka sebagai detached temporary worktree, dependency dipasang dengan `npm ci`, dan server dijalankan pada port 3100. Kesembilan route merespons HTTP 200; hasil tersimpan di `artifacts/browser/rollback.json`; server dan worktree temp kemudian dihapus.

## Validasi lanjutan 2026-09-25 — capture interaksi terblokir

- Type checking `npx tsc --noEmit --incremental false` lulus.
- Test yang sudah tersedia dijalankan dengan `npx playwright test --grep 'record complete desktop and touch interaction states'`: **1 gagal**.
- Pada desktop 1440×900, setelah `[data-menu-btn]` difokuskan dan Enter ditekan, `body[data-navigation-status]` tetap `is-close`; assertion mengharapkan `is-open` selama 15 detik.
- Bukti kegagalan: `artifacts/browser/run-output/baseline-record-complete-d-6201e-nd-touch-interaction-states/error-context.md`. Output run ini transient dan dapat tertimpa run berikutnya.
- Test berhenti sebelum About, sound, cursor, dan touch. Nama test “complete” bukan bukti coverage lengkap; run ini tidak menghasilkan manifest interaksi lengkap yang sukses.
- Penyebab belum dipastikan: audit berikutnya harus membedakan kemampuan focus/keyboard kontrol legacy, visibilitas kontrol pada breakpoint desktop, dan kesiapan initializer menu. Kesiapan atribut sound saja tidak membuktikan kesiapan menu.
- Jangan mengganti Enter dengan click lalu mengklaim keyboard lulus. Jika baseline memang tidak mendukung keyboard pada kontrol tersebut, catat sebagai keterbatasan legacy dan mintakan keputusan terpisah; jangan memperbaiki runtime aktif diam-diam dalam pekerjaan parity.

### Sisa bukti sebelum sign-off

| Area | Bukti yang masih harus diselesaikan/review |
| --- | --- |
| Menu | Kontrol yang terlihat per breakpoint, pointer/touch open-close, keyboard focus/Enter/Space/Escape sesuai kontrak aktual, overlay, scroll lock, dan close saat navigasi. |
| About | Open/close melalui kontrol dan Escape, perpindahan dari menu, focus sebelum/sesudah, scroll lock, dan state setelah navigasi. |
| Sound | Toggle pointer/touch/keyboard, state tersimpan setelah reload/navigasi, serta review audio aktual. Video Playwright dan `aria-pressed` saja tidak membuktikan suara terdengar atau tidak ganda. |
| Cursor | Default, hover/text, keluar target/viewport, scroll, dan perilaku pada coarse pointer/touch. |
| Animasi | First load, reveal, smooth scroll, Process sticky/index/video di beberapa posisi scroll, FAQ, CTA/footer/canvas, dan transisi route; screenshot sesudah scroll saja tidak membuktikan timing/easing. |
| Responsive/input | Lima viewport baseline dan perubahan sekitar 767/991 px; emulasi touch bukan pengganti review perangkat nyata. |

Gate Fase 0 tetap **terbuka**. Persetujuan pemilik proyek harus eksplisit dan merujuk bukti yang direview; belum ada persetujuan yang dicatat. Tidak ada komponen aktif yang diubah dan pilot React belum dimulai.

## Audit lanjutan menu — 2026-09-25

- Penyebab assertion desktop terbukti: `[data-menu-btn]` adalah native `button`, tetapi pada 1440 px computed `display` adalah `none`, rectangle 0×0, dan `.focus()` tidak membuatnya menjadi `document.activeElement`. Enter tidak mengaktifkan tombol tersembunyi.
- Audit browser pada 1920, 1440, 1024, 992, 991, dan 768 px mengonfirmasi tombol tersembunyi. Pada 767 dan 375 px tombol terlihat dan menerima fokus; Enter serta Space membuka menu, Escape menutupnya, dan atribut/class scroll lock mengikuti state.
- Runtime `ke()` memasang listener click dan Escape. Aktivasi Enter/Space menggunakan perilaku native button. Inline style overlay (`pointer-events: none`, `visibility: hidden`) digunakan audit sebagai bukti initializer menu telah berjalan; bukan atribut sound.
- Harness terpisah: `tests/browser/menu-audit.spec.ts`. Jalankan `npx playwright test menu-audit.spec.ts --output artifacts/browser/menu-audit-output --reporter=line`. Attachment `menu-before-input` mencatat computed display, rectangle, focus, dan initial state. Log run dengan reporter JSON tersedia di `artifacts/browser/menu-audit-run.log`.
- Validasi: Playwright melaporkan **8 passed** pada run ulang; laporan JSON run pertama menunjukkan expected 8, unexpected 0, flaky 0. Tool terminal melaporkan penutupan terminal/code 1 meskipun reporter selesai sukses; anomali wrapper ini dicatat, bukan dianggap assertion gagal. TypeScript lulus.
- Test interaksi lengkap belum diubah atau dijalankan ulang. Langkah berikutnya adalah memindahkan skenario keyboard menu ke breakpoint yang terlihat, memisahkan capture per behavior, dan melanjutkan About/sound/cursor/touch. Jangan mengklaim pointer/touch, hit target, animasi, focus restoration, atau navigasi sudah lulus dari audit keyboard ini.
- Runtime, CSS, dan markup aktif tidak diubah. Gate Fase 0 tetap terbuka.

## Capture interaksi terpisah — 2026-09-25

- Test monolitik diganti sembilan skenario independen di `tests/browser/baseline.spec.ts`: desktop menu-keyboard/About/sound/cursor/animations dan touch menu/About/sound/animations. Menu keyboard menggunakan fine pointer pada 767×900, bukan tombol tersembunyi pada 1440 px. Desktop lainnya tetap 1440×900; touch 375×812.
- Assertion open/closed dipertahankan; menu keyboard memeriksa visible dan focused sebelum Enter. Touch memakai locator `tap()` dengan actionability checks, bukan koordinat mentah. Menu touch juga diuji tutup melalui tombol.
- JSON per skenario disimpan dalam `finally`, beserta error dan rekaman parsial bila gagal; context ditutup untuk menyelesaikan video. Tidak ada lagi klaim manifest tunggal “complete”.
- Perintah: `npx playwright test baseline.spec.ts --grep 'record (desktop|touch) interaction:' --output artifacts/browser/interaction-run-output --reporter=line,json` (set `PLAYWRIGHT_JSON_OUTPUT_NAME` ke `artifacts/browser/interaction-run.json` untuk laporan JSON).
- Run awal: **9 passed**, 0 skipped, 0 unexpected, 0 flaky; sekitar 2,9 menit. Sembilan manifest menghasilkan 33 snapshot dan 0 page error. TypeScript lulus.
- Bukti: `artifacts/browser/interaction-run.json`, `interaction-desktop-*.json`, `interaction-touch-*.json`, `interaction-states/`, dan `interaction-videos/`. Screenshot/video memerlukan review manusia. File dari run lama mungkin tetap ada; gunakan manifest run terbaru sebagai acuan.
- Batasan: sound baru memvalidasi toggle state, bukan audio aktual atau persistence; cursor baru assertion hover aktif dan capture release; animation test adalah capture posisi section, bukan assertion timing/easing. Focus restoration, menu close saat navigasi, overlay close, scroll lock lintas modal, review lima viewport, dan touch perangkat nyata belum lengkap.
- Gate Fase 0 tetap terbuka; tidak mengubah runtime aktif atau memulai pilot React.