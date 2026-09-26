# Phase 4 Sign-off - CTA

**Tanggal:** 2026-09-26
**Target:** `section.cta_home_wrap` pada Home
**Keputusan:** Disetujui, Fase 4 selesai 5/5

## Status

Stakeholder menyatakan review manual accepted pada 2026-09-26. Persetujuan mencakup heading typography/wrapping, tiga award SVG, testimonial, remote image crop, overlay, responsive layout, clip-path, heading translation, parallax, button hover/focus, pointer/touch, serta timing/easing.

`CtaSection` diterima sebagai implementation aktif default. Runtime legacy tetap menjadi satu-satunya owner clip-path scrub, heading translation, dan remote image parallax; React hanya memiliki markup. CTA legacy tetap tersedia melalui `CTA_USE_LEGACY=1` setelah restart.

Checklist Fase 4 ditutup **5/5**.

## Kontrak Yang Dipertahankan

- Root tanpa ID atau data attribute: `section.cta_home_wrap`.
- Heading screen-reader dan empat baris display, termasuk arrow serta trailing space pada `People `.
- Booking CTA `https://cal.com/byhuy/project-intro-call`, `target="_blank"`, tanpa `rel` sesuai baseline.
- Tiga SVG award inline dengan seluruh path, mask, clipPath ID, viewBox, dan urutan identik.
- Testimonial `“A passionate team who listens deeply, collaborates openly, and always delivers with care. ”` dan testimonee `- University of Sydney`.
- Remote AVIF, lazy loading, alt text, overlay, `data-scroll-container`, `data-target-translate="150"`, dan `data-translate-hero="true"`.
- CTA Home tidak memiliki canvas atau video. Shader canvas yang berdekatan dimiliki Footer dan bukan bagian candidate CTA.

## Bukti Otomatis

- Exact extraction: `artifacts/cta/extraction/{contract.json,readable.html,section.html}`, **226 elemen**.
- Readable runtime ownership: `artifacts/cta/extraction/runtime.txt`.
- Baseline lima viewport: `artifacts/cta/baseline/audit.json` dan PNG.
- DOM lengkap dan selection opt-in: `artifacts/cta/dom-v1.json`, **1/1**.
- Visual/image layout parity: `artifacts/cta/visual-final.json`, **5/5**, tanpa skipped/unexpected/flaky. Pixel difference **0%** pada 375x812, 768x1024, 1024x768, 1440x900, dan 1920x1080; threshold tetap **0,5%**.
- Behavior/lifecycle legacy dan candidate pointer/touch: `artifacts/cta/behavior-v3.json`, **4/4**, tanpa skipped/unexpected/flaky.
- Coverage behavior: CTA popup destination, focus/Enter, tap, tiga award SVG, tidak ada canvas/video, resize 767/768/991/992, heading transform scrub, jumlah trigger per breakpoint, dan tiga siklus Home/Work/history.
- Root hydration seluruh sembilan route/reload/navigation: candidate **2/2** dan legacy **2/2**. Bukti: `artifacts/cta/root-hydration-{candidate,legacy}.json`.
- HTTP kedua mode: masing-masing **9 route / 12 aset lokal / 0 kegagalan**. Bukti: `artifacts/cta/http-{candidate,legacy}/manifest.json`.
- Regression Project Process dengan candidate CTA: `artifacts/cta/process-regression.json`, **4/4**.
- Production build: `artifacts/cta/candidate-build.log`, lulus compile, lint/type validation, static generation 12/12, optimization, dan traces.
- TypeScript, generated-tree freshness, dan whitespace validation lulus.

## Bukti Setelah Aktivasi

- Build production: `artifacts/cta/signoff-build.log`, lulus compile, lint/type validation, static generation 12/12, optimization, dan traces.
- Acceptance default candidate versus rollback legacy: `artifacts/cta/signoff-final.json`, **10/10**, tanpa skipped/unexpected/flaky.
- Pixel sign-off pasca-aktivasi: **0%** pada kelima viewport wajib dengan threshold tetap **0,5%**.
- Root hydration seluruh sembilan route/reload/navigation: candidate/default **2/2** dan rollback **2/2**. Bukti: `artifacts/cta/signoff-routes-{candidate,legacy}.json`.
- HTTP kedua mode: masing-masing **9 route / 12 aset lokal / 0 kegagalan**. Bukti: `artifacts/cta/signoff-http-{candidate,legacy}/manifest.json`.
- Regression Project Process setelah aktivasi CTA: `artifacts/cta/signoff-process-regression.json`, **4/4**.

## Ownership Dan Cleanup

Initializer legacy `Ae()` membuat dua timeline scrub CTA: clip-path root dan horizontal translation `.cta_heading_inner`. Pada viewport minimal 992 px, shared `gsap.matchMedia` menambahkan parallax gambar berdasarkan `data-scroll-container`. Barba leave menjalankan cleanup functions, merevert matchMedia, membunuh seluruh ScrollTrigger, lalu menghapus container lama.

Tes tiga siklus menyimpan identity trigger CTA Home sebelum leave dan membuktikan trigger tersebut tidak aktif atau terhubung ke parent animation setelah masuk Work. Setelah kembali ke Home tidak ada detached trigger dan jumlah trigger CTA kembali stabil: dua di bawah 992 px dan tiga mulai 992 px. Karena ownership existing lulus, tidak ada patch runtime CTA atau handler React baru.

Instrumentasi ini adalah scoped Chromium evidence, bukan heap/garbage-collection proof universal.

## Riwayat Diagnosis

- Visual v1 gagal sekali di 1024x768 sebesar 82,998730% saat dua endpoint menangkap fase scrub berbeda; empat viewport lain 0%. Isolated repeat 1024x768 dan full visual repeat menghasilkan 0%, dengan image state identik. Threshold tidak dinaikkan dan CTA tidak dimask.
- Behavior v1 mencoba membandingkan transform setelah scroll dari posisi yang sudah sama. Behavior v2 mencapai navigation cycle tetapi salah menganggap route Work tidak memiliki CTA. Final harness menggerakkan scroll dari top ke CTA dan menscope selector ke container Home; assertion cleanup tetap memakai identity trigger yang keluar.
- Full sign-off pertama kembali menangkap fase scrub control yang berbeda hanya pada 1024x768. Final static capture mematok ketiga animation progress CTA pada 50% di kedua endpoint. Behavior tetap diuji melalui scroll nyata, threshold tidak dinaikkan, dan tidak ada bagian CTA yang dimask.

## Baseline Debt Yang Dipertahankan

- Link `_blank` tidak memiliki `rel`.
- SVG award dekoratif tidak memiliki explicit accessible name atau `aria-hidden`.
- Remote image tidak memiliki width/height attributes.

Perbaikan aksesibilitas tersebut harus menjadi task terpisah agar tidak mengubah kontrak parity.

## Acceptance Manual

Review manual visual dan behavior disetujui stakeholder pada 2026-09-26. Approval menutup heading typography/wrapping, award SVGs, testimonial, remote image crop, overlay, responsive layout, clip-path, heading translation, parallax, button hover/focus, pointer/touch, dan timing/easing.

## Aktivasi Dan Rollback

1. Set `CTA_USE_LEGACY=1`.
2. Restart proses Next.js.
3. Jalankan smoke test Home dan route utama.
4. Hapus flag dan restart untuk kembali ke CTA React default.

`PROCESS_USE_LEGACY=1` tetap mengembalikan seluruh Home legacy dan mengungguli switch section lainnya.

## Hasil Akhir

- Checklist Fase 4: **5/5**.
- CTA React: aktif secara default.
- Fallback CTA legacy: tersedia dan tervalidasi.
- Source legacy: dipertahankan.
- Fase berikutnya dapat dimulai tanpa menghapus rollback Fase 1-Fase 4.
