# Phase 2 Sign-off - FAQ

**Tanggal:** 2026-09-26
**Target:** `#faqs.faq_home_wrap`
**Keputusan:** Disetujui, Fase 2 selesai 7/7

## Keputusan

Stakeholder menyatakan review manual approved dan menerima hasil FAQ candidate. Persetujuan mencakup visual state tertutup/terbuka, hover, foto dan crop Fadel, responsive behavior, accordion interaction, focus/keyboard/touch, CTA, serta timing/easing.

`FaqSection` diterima sebagai implementation aktif default pada Home. Runtime legacy tetap menjadi owner accordion dan hover behavior; React hanya memiliki markup. FAQ legacy tetap tersedia dari raw `data/home.html` melalui `FAQ_USE_LEGACY=1` setelah restart. `PROCESS_USE_LEGACY=1` tetap menyediakan rollback seluruh Home.

## Bukti Otomatis

- Baseline lima viewport dan seluruh state toggle: `artifacts/faq/baseline/`.
- Kontrak source: `artifacts/faq/extraction/contract.json` dan `readable.html`.
- Build sebelum acceptance: `artifacts/faq/build-v3.log`; build sesudah aktivasi default: `artifacts/faq/signoff-build.log`. Keduanya lulus compile, lint/type validation, static generation 12/12, optimization, dan traces.
- Acceptance final sebelum aktivasi: `artifacts/faq/final.json`, **10/10**, tanpa skipped/unexpected/flaky.
- Acceptance setelah aktivasi default versus rollback `FAQ_USE_LEGACY=1`: `artifacts/faq/signoff.json`, **10/10**, tanpa skipped/unexpected/flaky.
- Pixel sign-off: 375x812 **0%**, 768x1024 **0,009046%**, 1024x768 **0%**, 1440x900 **0,005157%**, 1920x1080 **0,009405%**; threshold **0,5%**.
- Root hydration seluruh sembilan route/reload: candidate/default **2/2** dan rollback **2/2**. Bukti: `artifacts/faq/signoff-routes-{candidate,legacy}.json`.
- HTTP kedua mode: masing-masing **9 route / 12 aset lokal / 0 kegagalan**. Bukti: `artifacts/faq/signoff-http-{candidate,legacy}/manifest.json`.
- Regression Fase 1 Process setelah cleanup FAQ: **4/4**, `artifacts/faq/process-regression.json`.
- Runtime unit regression: FAQ **3/3** dan Process **6/6**; TypeScript, runtime/tool syntax, generated tree freshness, dan whitespace validation lulus.

## Behavior Dan Ownership

- Tujuh item mempertahankan urutan, copy, trailing spaces, `<br>`, NBSP, inline link, CTA, class, data attribute, SVG, dan CSS literal baseline.
- Pointer dan touch menguji single-open, sibling close, close ulang, rapid clicks, Enter, Space, Tab/focus awal, resize 767/768/991/992, reload, CTA popup, dan tiga siklus Home/Work/history.
- Runtime memiliki satu delegated click listener dan 14 hover listeners pada Home pointer; touch tidak memasang hover listeners. Setelah leave, tidak ada listener FAQ aktif atau detached.
- `scripts/repair-faq-runtime.mjs` membuat accordion/hover initialization idempotent dan melepas listener serta tween miliknya pada page cleanup.

## Baseline Debt Yang Dipertahankan

Untuk parity, fase ini tidak menyisipkan perubahan aksesibilitas yang dapat mengubah DOM atau behavior:

- button tidak memiliki explicit `type`, `aria-expanded`, atau `aria-controls`;
- panel tidak memiliki identity/ARIA/inert;
- link pada panel tertutup tetap focusable;
- CTA `_blank` tidak memiliki `rel`.

Perbaikan tersebut harus menjadi task aksesibilitas terpisah dengan baseline dan acceptance baru.

## Rollback

1. Set `FAQ_USE_LEGACY=1`.
2. Restart proses Next.js.
3. Jalankan smoke test Home dan route utama.
4. Hapus flag dan restart untuk kembali ke FAQ React default.

## Hasil Akhir

- Checklist Fase 2: **7/7**.
- FAQ React: aktif secara default.
- Fallback FAQ legacy: tersedia dan tervalidasi.
- Source legacy: dipertahankan.
- Fase 3 dapat dimulai tanpa menghapus rollback Fase 1 atau Fase 2.
