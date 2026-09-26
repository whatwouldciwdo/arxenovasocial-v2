# Phase 1 Sign-off - Project Process

**Tanggal:** 2026-09-26
**Target:** `#process.process_home_wrap`
**Keputusan:** Disetujui, Fase 1 selesai 43/43

## Keputusan

Stakeholder menyatakan seluruh verifikasi manual sudah disetujui dan meminta proses sign-off dilanjutkan. Persetujuan tersebut mencakup visual, responsive behavior, crop/frame/loop video, playback, cursor dan CTA, scroll/index transition, timing/easing animasi, touch, serta behavior navigasi.

Candidate React `ProjectProcess` diterima sebagai implementation aktif pada Home. Runtime legacy tetap menjadi satu-satunya owner behavior pada pilot ini; tidak ada handler Process yang dipindahkan ke React. Markup legacy tetap tersedia melalui `PROCESS_USE_LEGACY=1` setelah restart dan `data/home.html` tidak dihapus.

## Bukti Otomatis

- Build production: lulus compile, lint/type validation, static generation 12/12, optimization, dan trace collection. Bukti: `artifacts/home-shell/phase1-final-build.log`.
- Candidate production: 8/8 integration, scoped ownership, dan hydration/all-route; 0 skipped, unexpected, atau flaky. Bukti: `artifacts/home-shell/phase1-final-candidate.json`.
- Fallback production: 8/8 dengan cakupan yang sama; 0 skipped, unexpected, atau flaky. Bukti: `artifacts/home-shell/phase1-final-fallback.json`.
- Process parity: 7/7 untuk DOM, layout/wrapping, media contract/playback, link/CTA, cursor, pointer, dan touch. Bukti: `artifacts/home-shell/phase1-final-parity.json`.
- Visual fallback versus candidate: 5/5 viewport lulus pada threshold 0,5%; rasio maksimum 0,233236%. Bukti: `artifacts/home-shell/phase1-final-visual/comparison.json`.
- Route dan aset candidate/fallback: masing-masing 9 route, 12 aset lokal, dan 0 kegagalan. Bukti: `artifacts/baseline-phase1-final-candidate/manifest.json` dan `artifacts/baseline-phase1-final-fallback/manifest.json`.
- Runtime lifecycle: 6/6 unit regression lulus. TypeScript, syntax runtime/tooling, generated-tree freshness, dan whitespace validation lulus.

## Acceptance Manual

Stakeholder menerima seluruh item manual yang sebelumnya terbuka:

- tidak ada perbedaan visual terlihat yang menghalangi acceptance;
- ukuran, crop, frame, preload, loop, mute, dan playback tiga video diterima;
- scroll/index transition serta timing/easing animasi diterima;
- visual dan behavior pada viewport serta input yang diuji diterima;
- hasil pilot secara keseluruhan disetujui.

## Rollback

1. Set `PROCESS_USE_LEGACY=1` pada environment proses Next.js.
2. Restart proses production.
3. Jalankan smoke test Home dan route utama bila rollback digunakan.
4. Hapus flag dan restart untuk mengaktifkan candidate kembali.

Rollback tidak memerlukan rekonstruksi markup karena raw legacy tetap berada di `data/home.html`.

## Batasan Yang Diterima

- Browser automation menggunakan Chromium dan touch emulation, bukan seluruh perangkat fisik.
- Ownership test merupakan attribution terarah untuk resource runtime yang relevan, bukan heap-reachability proof universal semua library pihak ketiga.
- Screenshot otomatis menyembunyikan media dinamis tertentu; acceptance visual dinamis ditutup oleh review manual stakeholder.

## Hasil Akhir

- Checklist Fase 1: **43/43**.
- Gate Fase 1: **5/5**.
- Candidate: aktif.
- Fallback legacy: tersedia dan tervalidasi.
- Source legacy: dipertahankan.
- Fase berikutnya dapat dimulai tanpa menghapus mekanisme rollback Fase 1.
