# Phase 3 Sign-off - Problems, Testimonial, and Client Logos

**Tanggal:** 2026-09-26
**Target:** `section.problems_home_wrap`
**Keputusan:** Disetujui, Fase 3 selesai 8/8

## Status

Stakeholder menyatakan verifikasi manual selesai dan approved pada 2026-09-26. Persetujuan mencakup visual lima viewport, grain dalam konteks halaman, typography, wrapping, testimonial/foto Fadel, logo crop/grid, slider, progress, highlight, stacking, hover/focus, pointer/touch, serta timing/easing.

`ProblemsSection` diterima sebagai implementation aktif default. Runtime legacy tetap menjadi satu-satunya owner slider, SplitText, highlight, stacking cards, dan lifecycle cleanup; React hanya memiliki markup. Problems legacy tetap tersedia melalui `PROBLEMS_USE_LEGACY=1` setelah restart.

Checklist Fase 3 ditutup **8/8**.

## Kontrak Yang Dipertahankan

- Root tanpa ID: `section.problems_home_wrap[data-theme-section="dark"][data-stacking-cards-item][data-slider]`.
- Dua statistik dalam urutan baseline, testimonial founder Fadel Febrian Alexander, dan foto `/images/teams/fadel-febrian.jpeg`.
- Delapan client logo dalam urutan baseline, termasuk URL remote Backhouse dan mismatch alt-label legacy yang disengaja untuk parity.
- Class, role, `data-*`, SVG paths, dimensions, lazy loading, inline border radius, copy, dan whitespace signifikan.
- Slider autoplay 16 detik, prev/next wrap, current/total counters, progress bars bergantian, SplitText, dan pause/resume berdasarkan viewport.

## Bukti Otomatis

- Ekstraksi dan inventory: `artifacts/problems/extraction/contract.json`, `readable.html`, dan `section.html`; inventory browser berisi 70 elemen.
- Baseline sebelum candidate: `artifacts/problems/baseline/` dan `baseline-build.log` pada lima viewport wajib.
- DOM lengkap, source assets, dan pemilihan renderer opt-in: `artifacts/problems/dom-contract.json`, **1/1**, tanpa skipped/unexpected/flaky.
- Visual dan image-layout parity: `artifacts/problems/visual-signoff.json`, **5/5**, tanpa skipped/unexpected/flaky. Difference adalah **0%** pada 375x812, 768x1024, 1024x768, 1440x900, dan 1920x1080; threshold tetap **0,5%**.
- Behavior/lifecycle candidate dan legacy pada pointer/touch: `artifacts/problems/behavior-v1.json`, **4/4**, tanpa skipped/unexpected/flaky. Coverage mencakup keyboard/tap/click, wrap dua arah, autoplay 16 detik, viewport pause/resume, resize 767/768/991/992, reload, dan tiga siklus Home/Work/history tanpa detached ScrollTrigger.
- Runtime ownership transformer: `scripts/repair-problems-runtime.mjs`; unit evidence **10/10** dari `scripts/repair-problems-runtime.test.mjs`.
- Root hydration direct load/reload/navigation untuk sembilan route: candidate **2/2** dan legacy **2/2**, masing-masing tanpa skipped/unexpected/flaky. Bukti: `artifacts/problems/root-hydration-{candidate,legacy}.json`.
- HTTP kedua mode: masing-masing **9 route / 12 aset lokal / 0 kegagalan**. Bukti: `artifacts/problems/http-{candidate,legacy}/manifest.json`.
- Regression Project Process dengan candidate Problems: `artifacts/problems/process-regression.json`, **4/4**, tanpa skipped/unexpected/flaky.
- Production build: `artifacts/problems/candidate-build.log`, lulus compile, lint/type validation, static generation 12/12, optimization, dan traces.
- TypeScript, syntax runtime, generated-tree freshness, dan `git diff --check` lulus.

## Bukti Setelah Aktivasi

- Build production: `artifacts/problems/signoff-build.log`, lulus compile, lint/type validation, static generation 12/12, optimization, dan traces.
- Acceptance default candidate versus rollback legacy: `artifacts/problems/signoff.json`, **10/10**, tanpa skipped/unexpected/flaky.
- Pixel sign-off pasca-aktivasi: **0%** pada kelima viewport wajib dengan threshold tetap **0,5%**.
- Root hydration seluruh sembilan route/reload/navigation: candidate/default **2/2** dan rollback **2/2**. Bukti: `artifacts/problems/signoff-routes-{candidate,legacy}.json`.
- HTTP kedua mode: masing-masing **9 route / 12 aset lokal / 0 kegagalan**. Bukti: `artifacts/problems/signoff-http-{candidate,legacy}/manifest.json`.
- Regression Project Process setelah aktivasi Problems: `artifacts/problems/signoff-process-regression.json`, **4/4**.

## Batas Screenshot

Capture statis memask slider stats yang beranimasi, cursor global, dan `.g_grain_overlay`. Overlay grain berada di luar section, fixed, berukuran lebih besar dari viewport, memakai background texture, dan bergerak dengan animasi steps. Dua context independen pernah menangkap fase grain berbeda pada 1920x1080 dan menghasilkan false difference 90,554419%, sementara seluruh image geometry identik dan isolated repeat menghasilkan 0%. Setelah overlay global dikeluarkan dari section comparison, seluruh lima viewport menghasilkan 0% tanpa menaikkan threshold atau menonaktifkan animasi Problems.

Masking ini tidak membuktikan timing/easing atau penampilan grain dalam konteks halaman. Keduanya tetap menjadi review manual.

## Ownership Dan Cleanup

`scripts/repair-problems-runtime.mjs` mempertahankan badan animasi legacy tetapi menambahkan per-root guard, named prev/next listeners, ownership timeline/tween, cleanup ScrollTrigger, pelepasan resource saat page leave, dan stale-callback guards. React tidak memasang handler slider.

Instrumentasi Chromium dan VM membuktikan resource scoped yang diuji, bukan heap/garbage-collection proof universal.

## Acceptance Manual

Review manual visual dan behavior disetujui stakeholder pada 2026-09-26. Approval ini menutup grain in-context, typography, wrapping, logo crop/grid, slider timing/easing, progress alternation, highlight, stacking, hover/focus, pointer, dan touch.

## Aktivasi Dan Rollback

1. Set `PROBLEMS_USE_LEGACY=1`.
2. Restart proses Next.js.
3. Jalankan smoke test Home dan route utama.
4. Hapus flag dan restart untuk kembali ke Problems React default.

`PROCESS_USE_LEGACY=1` tetap mengembalikan seluruh Home legacy dan mengungguli switch section lainnya.

## Hasil Akhir

- Checklist Fase 3: **8/8**.
- Problems React: aktif secara default.
- Fallback Problems legacy: tersedia dan tervalidasi.
- Source legacy: dipertahankan.
- Fase 4 CTA dapat dimulai tanpa menghapus rollback Fase 1, Fase 2, atau Fase 3.
