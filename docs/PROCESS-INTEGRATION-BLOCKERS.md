## Sign-off Fase 1 — 2026-09-26: seluruh gate ditutup

Stakeholder menyatakan seluruh verifikasi manual sudah disetujui dan meminta sign-off dilanjutkan. Dengan persetujuan tersebut, review visual/media, crop dan loop video, scroll-index, timing/easing, serta behavior diterima. Dikombinasikan dengan bukti otomatis final, Fase 1 ditutup **43/43**.

- Candidate `ProjectProcess` tetap aktif pada aplikasi utama.
- `PROCESS_USE_LEGACY=1` tetap menjadi rollback setelah restart; `data/home.html` tidak dihapus.
- Batasan instrumentasi Chromium/ownership tetap dicatat sebagai karakteristik bukti, bukan blocker yang tersisa setelah acceptance stakeholder.
- Paket keputusan final: `docs/PHASE-1-SIGNOFF.md`.

---

## Update final otomatis — 2026-09-26: aplikasi utama tervalidasi, gate manual tetap terbuka

Candidate React sekarang dirender oleh aplikasi utama. `PROCESS_USE_LEGACY=1` memilih markup fallback dari source `data/home.html` yang tetap dipertahankan; switch memerlukan restart. Aktivasi source ini tidak dianggap memenuhi prosedur “aktifkan setelah seluruh validasi” karena review manual dan stakeholder sign-off belum diberikan.

- `node scripts/generate-home-tree.mjs --check`, enam unit lifecycle runtime, syntax runtime/tooling, TypeScript no-emit, dan `git diff --check` lulus. Generator mengunci tree terhadap SHA-256 output loader dan gagal bila source/tree drift.
- `npm run build` setelah server dihentikan lulus compile, lint/type validation, generation **12/12**, optimization, dan traces. Bukti: `artifacts/home-shell/phase1-final-build.log`.
- Candidate `:3200` dan fallback `:3100` dari build yang sama masing-masing lulus **8/8**, tanpa skipped/unexpected/flaky: empat integration profile, dua ownership profile, dan dua hydration/all-route profile. Bukti: `phase1-final-{candidate,fallback}.json`.
- Perbandingan Process final terhadap endpoint fallback nyata lulus **7/7**, tanpa skipped/unexpected/flaky, mencakup DOM, layout/wrapping, media contract/playback, link/CTA, cursor, pointer, dan touch. Bukti: `phase1-final-parity.json`.
- Root hydration sekarang memeriksa direct load dan reload untuk `/`, `/work`, dan seluruh tujuh project, kemudian Home→Work→Back, pada pointer dan touch. Audit HTTP terpisah untuk kedua mode menghasilkan **9 route / 12 aset lokal / 0 kegagalan**: `artifacts/baseline-phase1-final-{candidate,fallback}/manifest.json`.
- Fallback↔candidate full-page comparison lulus lima viewport pada threshold **0,5%**. Rasio: **0,233235%**, **0,009566%**, **0,114088%**, **0,005075%**, dan **0,004362%**. Capture menyembunyikan video/canvas/cursor dan menonaktifkan animasi CSS, sehingga bukan review manual. Bukti: `artifacts/home-shell/phase1-final-visual/comparison.json`.
- Ownership mengatribusikan resource runtime terarah, listener element/window, observer target, timer, direct runtime RAF, identitas callback ticker Lenis, ScrollTrigger, dan video lintas tiga siklus. Tidak ada klaim heap-reachability atau attribution universal seluruh third-party global.
- Status checklist konservatif: **34/43**. Masih terbuka: review crop/frame dan loop video, parity timing/easing scroll-index, syarat prosedural aktivasi setelah semua gate, sign-off manual, penutupan pilot, gate gabungan visual+manual, seluruh behavior identik, dan stakeholder approval.

---

## Update v8 — 2026-09-25: parity otomatis, integrasi produksi, dan rollback tervalidasi

Kelanjutan ini menutup bukti otomatis yang sebelumnya terbuka, tetapi **bukan sign-off manual atau izin aktivasi**. Fase 1.4/1.5/1.6 tetap terbuka; route publik tetap memakai legacy.

- Comparator `D:\arxenovasocial.com-v2\scripts\compare-home-shell.mjs` kini menerima filter viewport wajib yang tervalidasi, memakai timeout navigasi 60 detik, dan membatasi navigasi ke dua percobaan. Syntax check exit **0**; threshold tetap **0,5%** dan tidak dilonggarkan.
- Original `:3000` versus candidate fixture pada lima viewport wajib lulus: **0,230060%**, **0,136261%**, **0,118846%**, **0,004448%**, dan **0,004789%** untuk 375×812 sampai 1920×1080. Run awal tetap menyimpan kegagalan timeout 1920; `v8-visual-candidate-composite.json` secara eksplisit menggabungkan empat hasil awal dengan isolated retry 1920 yang exit **0**.
- Perbandingan langsung fallback `:3100` versus candidate sementara `:3200`, dari fixture dan build yang sama, lulus **5/5**, exit **0**, tanpa capture error. Diff: **0,015057%**, **0,244311%**, **0,008554%**, **0,075905%**, dan **0,006347%**. Candidate sementara telah dihentikan.
- Original `:3000` versus fallback `:3100` lulus **5/5**, exit **0**, tanpa capture error. Diff: **0,007172%**, **0,136950%**, **0,007619%**, **0,149922%**, dan **0,096227%**. Semua hasil berada di bawah gate 0,5%.
- Integrasi production candidate dan fallback setelah restart masing-masing **4/4**, exit **0**, dengan 0 unexpected/skipped/flaky. Ownership fallback setelah restart **2/2**, exit **0**, dengan 0 unexpected/skipped/flaky. Node UTF-8 SSR probe membedakan candidate saat `:3200` aktif; probe final membuktikan `:3000` dan `:3100` memuat legacy dan `:3200` menolak koneksi.
- Build aplikasi utama exit **0**. Snapshot rollback sebelum/sesudah mencatat `BUILD_ID` fixture yang sama (`ix2L5YXpOGkSYfSwL7h2K`) dan hash identik untuk page/layout/data/runtime fixture, `.next\\BUILD_ID`, serta `D:\arxenovasocial.com-v2\app\page.tsx`. Keadaan akhir hanya `next start` pada `:3000` dan fallback `:3100`; source public page tetap legacy-only.
- Bukti utama berada di `D:\arxenovasocial.com-v2\artifacts\home-shell\v8-*`, khususnya `v8-visual-candidate-composite.json`, `v8-visual-fallback-vs-candidate\comparison.json`, `v8-visual-fallback\comparison.json`, `v8-production-{candidate,fallback-restart}.json`, `v8-ownership-fallback-restart.json`, `v8-rollback-{before,after}.json`, dan `v8-ssr-mode-probe-final.json`.
- Gate tersisa: review visual/behavior manual, exhaustive element listener/observer/timer/heap attribution, dan stakeholder sign-off. Perbedaan otomatis yang kecil tetap wajib diperiksa secara visual. Jangan mengaktifkan candidate atau menandai pilot selesai sampai gate tersebut disetujui.

---


## Update v7 — 2026-09-25: ownership cursor diperbaiki pada fixture

Status terbaru ini menggantikan blocker cursor v6 di bawah; **fase 1.4 tetap terbuka** dan legacy tetap default. Tidak ada source aplikasi utama atau assertion integrasi diubah pada kelanjutan ini.

- `D:\arxenovasocial.com-v2\scripts\repair-process-runtime.mjs`: initializer cursor kini melepas empat handler window dengan identitas yang sama, membatalkan seluruh RAF hit-test yang masih antre, dan membunuh hanya tween quickTo/scale miliknya. Cleanup idempotent dan melepas registrasinya sendiri. Guard exact-match tetap fail-closed. Repair hanya disalin ke generated fixture dengan kedua flag repair aktif.
- Regresi VM tiga siklus menguji listener, RAF tertunda/callback stale, tween, posisi pointer, hover text/status edge, klik kiri/kanan, passive scroll, serta early return touch/cursor tidak ada. Tooling **6/6**. Ini bukan pengganti manual interaction acceptance browser.
- Build fixture v7 exit **0**. Production candidate **4/4**, repeat **4/4**, restart candidate→fallback **4/4**; setiap JSON melaporkan 0 unexpected/skipped/flaky. TypeScript noEmit dan syntax audit/runtime lulus.
- Audit v7 candidate dan fallback masing-masing selesai pada pointer/touch, tiga Home→Work→Back. Empat handler cursor masing-masing **1** pada setiap snapshot pointer (sebelumnya masing-masing tumbuh +6), **0** pada touch. Font Home/Work **5/0**; document pointer **171/170**, touch **173/172**, stabil per halaman. Detached triggers **0**, Process **3/0**, ticker **3/2**, cleanup pointer **27/14**, touch **26/13**. Snapshot RAF berkisar **2–3**, tanpa tren pertumbuhan; bukan bukti seluruh RAF selalu bersih.
- Audit kini menyimpan script ID/URL selain line/column. Raw window pointer **32→45**, touch **30→43**: tambahan 13 muncul sekali dari satu script anonim yang juga memiliki `__playwright_global_listeners_check__`, bukan empat handler cursor runtime. Listener tersebut tetap tercatat, tidak dihapus dari bukti. Belum ada exhaustive attribution/heap reachability.
- Bukti di `D:\arxenovasocial.com-v2\artifacts\home-shell`: `runtime-repaired-v7-production-{candidate,candidate-repeat,fallback}.json` beserta log terpisah; `ownership-v7-production-{candidate,fallback}.json` beserta log; `runtime-repaired-v7-build.log` dan `runtime-repaired-v7-build-exit.txt`. Server terakhir: **fallback**, port **3100**, PID disimpan di `v7-fallback-server-pid.txt` (PID saat run: 11028).
- Gate tersisa: exhaustive element listener/observer/timer/heap audit, browser cursor interaction saat navigasi, parity visual shell/runtime lima viewport, manual acceptance, validasi/build aplikasi utama. Jangan mempromosikan repair atau menutup 1.4 berdasarkan census ini. Catatan v4–v6 berikut adalah riwayat.

---


## Update v4–v6 — 2026-09-25: production integration lulus; 1.4 tetap terbuka

Status ini menggantikan hasil eksperimen lama di bawah, bukan acceptance atau izin aktivasi. Semua repair hanya pada fixture dengan `PROCESS_INTEGRATION_REPAIR_SHELL=1` dan `PROCESS_INTEGRATION_REPAIR_RUNTIME=1`; source aplikasi utama tidak diubah pada kelanjutan ini dan legacy tetap default.

- **v4:** `St/onSplit` kini mengembalikan timeline, bukan `gsap.context`. SplitText 3.15 hanya mengadopsi animation yang memiliki `totalTime`; resplit sebelumnya menumpuk trigger Problems. Diagnostik forced resplit kini menunjukkan 1 trigger dan tidak ada trigger lama yang bertahan. Production v4 tetap 0/4 karena perbedaan eyebrow/posisi scroll.
- **v5:** fixture memasang `history.scrollRestoration="manual"` pada history bridge awal, sebelum inisialisasi runtime. Candidate production **4/4**, repeat **4/4**, restart candidate→fallback **4/4**; tidak ada assertion equality/readiness yang dilonggarkan. Hasil mendukung perbaikan timing restoration, bukan bukti universal seluruh penyebab timing.
- **v6:** instance split heading, text, dan eyebrow didaftarkan ke page cleanup beserta penghapusan cached references; listener scroll tema shared dilepas dengan handler yang sama. Tooling regression **5/5**. Build fixture v4/v5/v6 masing-masing memiliki exit **0** yang disimpan eksplisit. Candidate production v6 **4/4**, repeat **4/4**, restart candidate→fallback **4/4** (semua run 0 unexpected/skipped/flaky).

### Bukti dan batasan audit

Direktori bukti: `D:\arxenovasocial.com-v2\artifacts\home-shell`.

- Production JSON/log: `runtime-repaired-v{4,5,6}-production-candidate.*`; run ulang dan fallback memakai suffix `-candidate-repeat` dan `-fallback`. Build: `runtime-repaired-v{4,5,6}-build.log` dan `-build-exit.txt`.
- Diagnostik SplitText: `split-before.json`, `split-after-v4.json`; script `D:\arxenovasocial.com-v2\scripts\diagnose-process-split.mjs`.
- Audit CDP: `ownership-v5-production-fallback.json` dan `ownership-v6-production-candidate.json`, dari `D:\arxenovasocial.com-v2\scripts\audit-process-ownership.mjs`. Ini census observasi, bukan assertion leak-free atau heap audit.
- v5: listener font Home 5→17 setelah tiga siklus; listener scroll document bertambah 6. v6 candidate: font Home **5**, Work **0** pada semua siklus; document pointer Home **170**, Work **169**, touch Home **172**, Work **171** stabil. Detached triggers **0**; Process Home **3**, Work **0**. RAF snapshot pointer Home/Work **3/2**, touch **2/2**; ticker **3/2**.
- **Blocker tersisa:** pada pointer v6, empat handler cursor window (`mousemove`, `scroll`, `mousedown`, `mouseup`) masing-masing bertambah **6** sepanjang enam perpindahan halaman. Lokasi callback di generated runtime line 179 mengarah ke initializer cursor; cleanup cursor belum ditambal. Tambahan 13 listener lain muncul sekali juga pada touch dan mencakup `__playwright_global_listeners_check__`, sehingga tidak boleh seluruh kenaikan raw count dianggap leak aplikasi tanpa attribution. Audit saat ini merekam line/column, belum script URL/identity.
- Belum mencakup seluruh element listener, observer, timer, pending cursor RAF setelah event, atau heap reachability. Visual parity shell/runtime pada lima viewport, manual acceptance, validasi/build aplikasi utama dan aktivasi tetap terbuka. **Jangan menutup 1.4.** Berikutnya: ownership cursor dan regresi interaction/navigasi, lalu audit resource lebih lengkap serta gate visual/main-app.

---


## Eksperimen runtime fixture — 2026-09-25 (dev lulus, production tetap BLOCKED)

- Perubahan sesi ini hanya tooling, test diagnostics, fixture, dan dokumentasi. Source aplikasi utama tidak diedit; legacy tetap default. Working tree sudah memiliki perubahan aplikasi dari sesi sebelumnya, yang tidak di-reset.
- `D:\arxenovasocial.com-v2\scripts\repair-process-runtime.mjs` menambal **salinan** runtime melalui `PROCESS_INTEGRATION_REPAIR_RUNTIME=1` pada generator fixture. Guard exact-match menolak boundary tidak dikenal/input sudah ditambal. Flag shell tetap terpisah dan keduanya diperlukan untuk mereproduksi run berikut.
- Eksperimen Lenis mempertahankan scroll saat reinitialisasi breakpoint 767, melepas ticker/scroll/anchor listeners serta timer lama, dan membersihkan resize listener per halaman. Reset satu detik untuk initial load/navigation dipertahankan; test tetap menunggu 500 ms setelah resize, tidak ditambah workaround delay.
- Cleanup instance SplitText highlight (`St`) menghilangkan detached trigger Problems pada navigasi dalam run dev. Run awal mencapai tiga siklus history, lalu menemukan 18 detached trigger ketika melewati 992: **6 hero_home_wrap + 12 cta_home_cover**. Cleanup matchMedia stacking cards/touch saja tidak menyelesaikannya; registry global `ge` juga perlu `revert()` saat leave. Semua cleanup ini masih eksperimen, bukan audit listener/RAF menyeluruh.
- `D:\arxenovasocial.com-v2\tests\browser\project-process-integration.spec.ts` hanya ditambah inventaris trigger per fase (class, connected, once, start/end/progress). **Tidak ada assertion dihapus/dilonggarkan atau readiness delay diubah.**

### Hasil terukur

Semua path bukti berikut relatif terhadap **`D:\arxenovasocial.com-v2\artifacts\home-shell`**:

| Bukti | Hasil | Arti |
| --- | --- | --- |
| `runtime-repaired-legacy.json` | 2 passed / 2 failed | Resize direct lolos; navigasi tiga siklus tercapai, gagal detached trigger pada resize 992 |
| `runtime-repaired-v2-legacy.json` | 2 passed / 2 failed | Cleanup matchMedia lokal belum mengatasi registry global; inventaris menunjukkan hero/CTA |
| `runtime-repaired-v3-candidate.json` | 4 passed / 0 failed | Candidate dev, semua assertion tercapai |
| `runtime-repaired-v3-candidate-repeat.json` | 4 passed / 0 failed | Run ulang candidate dev |
| `runtime-repaired-v3-fallback-rollback.json` | 4 passed / 0 failed | Server candidate dihentikan lalu fixture yang sama di-restart dengan candidate=0; fallback dev lolos |
| `runtime-repaired-v3-production-candidate.json` | 0 passed / 4 failed | `next start`: tiga gagal equality direct/reload, satu gagal equality back-1 |

- Run dev mencakup pointer/touch emulation, SSR/RSC, direct/reload, playback/mute/pause, tiga siklus Barba/history, video outgoing disconnected/paused, resize 767/768/991/992, canvas, duplicate-ID baseline, dan assertion console/hydration/HTTP. Bukan React unmount, perangkat nyata, atau manual visual acceptance.
- Production mengungkap ketidakstabilan yang masih nyata: pointer direct/reload **18 vs 15**, touch **14 vs 12**, touch navigation back **14 vs 13**. Inventaris menunjukkan direct memiliki 2–3 trigger Problems vs 1 setelah reload/back, ditambah perbedaan eyebrow `once:true`. Belum dibuktikan seluruh penyebab timing/font/autoSplit; jangan menganggap semuanya one-shot atau menghapus equality assertion. Nol detached pada snapshot yang tercapai tidak berarti lifecycle production lulus.
- Build **fixture saja** menghasilkan log compile/typecheck, static pages 12/12, route summary dan BUILD_ID. Wrapper terminal melaporkan terminal closed/code 1, sehingga exit code build bersih tidak diklaim. Artefaknya berhasil dilayani `next start` dan dipakai pada run production di atas. Log: `runtime-repaired-v3-build.log`. Build aplikasi utama belum dilakukan.
- Unit tooling `D:\arxenovasocial.com-v2\scripts\repair-process-runtime.test.mjs`: **2/2 lulus** (compile bundle, boundary guard, input already-patched). Syntax generator/patch, TypeScript utama noEmit lulus.

### Reproduksi dan titik lanjut

1. Set `PROCESS_INTEGRATION_REPAIR_SHELL=1` dan `PROCESS_INTEGRATION_REPAIR_RUNTIME=1`, lalu jalankan `node D:\arxenovasocial.com-v2\scripts\prepare-process-integration.mjs`.
2. **Working directory server wajib** `D:\arxenovasocial.com-v2\artifacts\project-process\integration-app`. Gunakan `PROCESS_INTEGRATION_CANDIDATE=1` atau `0`, restart server setiap switch; jalankan Next dev port 3100. Untuk production stop dev fixture, build dari directory ini, lalu Next start port 3100.
3. Dari repository utama, set `PROCESS_INTEGRATION_TEST=1`, flag candidate sesuai server, `BASELINE_URL=http://127.0.0.1:3100`, serta output JSON baru; jalankan hanya integration spec. Jangan menimpa run lama.
4. Berikutnya: isolasi lifecycle `St/onSplit` di cold/warm font production, pastikan animasi/context lama di-revert saat resplit, bedakan trigger persistent dan one-shot berdasarkan fase yang benar-benar setara. Uji candidate **dan fallback production**; run fallback production belum dilakukan.
5. Parity visual shell/runtime original vs repaired pada seluruh viewport wajib masih belum dibuktikan; lanjutkan deterministik + manual. Audit listener/RAF menyeluruh, build utama dan aktivasi tetap terbuka. Rollback yang lulus hanya switch markup fixture dev, **bukan rollback shell/runtime produksi**.

---


## Audit shared shell/resize — kelanjutan berikutnya 2026-09-25 (tetap BLOCKED)

- Source aplikasi utama tidak diubah. Eksperimen hanya menambal salinan fixture melalui `PROCESS_INTEGRATION_REPAIR_SHELL=1` saat menjalankan `D:\arxenovasocial.com-v2\scripts\prepare-process-integration.mjs`.
- `D:\arxenovasocial.com-v2\scripts\audit-home-shell.mjs` menemukan empat `</div>` berlebih sebelum Process (tujuh penutup, seharusnya tiga). Menghapus empat di fixture mengembalikan Process/FAQ/CTA ke `main.page_main` di dalam container Barba. Audit token ini diagnostik terbatas, bukan validator HTML umum.
- **Working directory penting:** loader memakai `process.cwd()`. Mulai server dengan working directory `D:\arxenovasocial.com-v2\artifacts\project-process\integration-app`; memberikan directory sebagai argumen Next saja tidak cukup. `repaired-legacy.json` (1 pass/3 fail) dijalankan dari cwd salah sehingga bukan bukti repaired shell. Bukti valid: `D:\arxenovasocial.com-v2\artifacts\home-shell\repaired-legacy-cwd.json` dan `D:\arxenovasocial.com-v2\artifacts\home-shell\repaired-candidate.json`, masing-masing **0 passed/4 failed**.
- Pada kedua run valid, navigasi mencapai Work tanpa Process atau trigger Process lama, lalu gagal pada satu detached trigger. Diagnostik mengidentifikasi `H2.problems_home_heading.u-text-style-h1.u-weight-bold`; penyebab lifecycle heading belum dibuktikan. Diagnostik fixture legacy juga mengonfirmasi ketiga video outgoing disconnected dan paused. Tiga siklus history belum tercapai.
- Resize terisolasi: `at()` memanggil `oe()` setelah breakpoint 767 berubah; `oe()` membuat Lenis lalu memaksa scroll 0 setiap 16 ms selama 1000 ms. Scroll test setelah 500 ms tertimpa reset; video readyState 4 berada jauh di bawah viewport dan paused. Scroll ulang setelah reset berakhir memutar video pada 767/768 di original dan repaired legacy. Ini percobaan diagnosis, **bukan workaround acceptance**; assertion integration tidak diubah.
- Kandidat pointer direct-resize berhenti lebih awal: jumlah trigger global direct/reload 18 vs 16. Fluktuasi serupa terlihat pada legacy (12 vs 11 di run cwd salah). Perlu membedakan trigger one-shot dan leak dengan ownership/phase yang stabil; jangan sekadar menghapus equality assertion.
- `D:\arxenovasocial.com-v2\scripts\compare-home-shell.mjs` menyimpan full-page screenshot masked video/canvas/cursor dan seluruh subtree section/footer beserta computed layout pada 375/768/1440. Ada perbedaan DOM hasil split/animasi; perbandingan array by-index ikut bergeser saat jumlah node berbeda. **Bukan pass visual/pixel parity** dan belum mencakup seluruh viewport wajib. Jangan mempromosikan patch shell sebelum perbandingan deterministik dan manual.
- Bukti diagnostik: `D:\arxenovasocial.com-v2\artifacts\home-shell\structure-audit.json`, `layout-comparison.json`, `resize-cleanup-diagnostics.json`, `diagnostics-late-retry.log` (tiga nama terakhir berada dalam directory absolut yang sama). Script diagnosis: `D:\arxenovasocial.com-v2\scripts\diagnose-process-lifecycle.mjs`.
- Syntax empat script, TypeScript noEmit, dan diff-check lulus. Runtime produksi tidak disentuh. Build, fixture rollback candidate→fallback, manual, audit listener/RAF, serta aktivasi belum dilakukan. Server fixture dihentikan setelah run; main dev port 3000 tetap hidup.

### Reproduksi eksperimen yang benar

```powershell
$env:PROCESS_INTEGRATION_REPAIR_SHELL='1'
node D:\arxenovasocial.com-v2\scripts\prepare-process-integration.mjs
Set-Location D:\arxenovasocial.com-v2\artifacts\project-process\integration-app
$env:PROCESS_INTEGRATION_CANDIDATE='0' # gunakan 1 untuk candidate; restart server
node D:\arxenovasocial.com-v2\node_modules\next\dist\bin\next dev -p 3100
```

Jalankan test dari repository utama dengan flag/URL yang sesuai. Langkah berikut: eksperimen runtime terpisah untuk mempertahankan posisi scroll saat reinitialisasi breakpoint, cleanup resize listener/ticker dan SplitText/heading; bandingkan original/repaired deterministik sebelum mengubah source utama. Semua gate yang gagal tetap dipertahankan.

---


## Integrasi Next terisolasi — kelanjutan 2026-09-25 (BLOCKED)

Harness baru: `D:\arxenovasocial.com-v2\scripts\prepare-process-integration.mjs` menyalin aplikasi ke `D:\arxenovasocial.com-v2\artifacts\project-process\integration-app`. Hanya page fixture yang merender `ProjectProcess` dalam tree React/Next RSC. Aplikasi utama, source HTML, CSS, runtime, dan default legacy tidak diubah. Tidak ada dependency, route publik, atau flag aktivasi pada aplikasi utama.

Fixture memakai fragment parsing `div.innerHTML`, bukan pembungkus DOMParser document yang terpotong oleh markup legacy. Ancestor Process menjadi elemen React; section lain tetap opaque HTML. Ini spike integrasi, **bukan implementasi shell yang sudah terbukti parity**: browser legacy menempatkan Process langsung di body, sedangkan fixture menempatkannya dalam div root. Jangan mempromosikan fixture ke aplikasi utama tanpa audit shell dan perbandingan seluruh DOM/layout.

### Hasil nyata (bukan acceptance lulus)

- Tes `D:\arxenovasocial.com-v2\tests\browser\project-process-integration.spec.ts` bersifat opt-in. Desktop/touch menguji direct load, reload, playback, resize, serta rencana tiga siklus Home–Work–Back/Forward. Tidak ada interception respons candidate: Next menghasilkan SSR/RSC dari komponen asli.
- `D:\arxenovasocial.com-v2\artifacts\project-process\integration-candidate.json`: **0 passed, 4 failed**, exit 1. Direct load/reload dan playback awal tercapai; kedua tes resize gagal pada playback setelah 767 → 768. Kedua tes navigasi gagal pada perpindahan pertama ke Work karena `#process` tetap ada. Siklus selanjutnya/cleanup tidak tercapai.
- Kontrol aplikasi legacy asli: `D:\arxenovasocial.com-v2\artifacts\project-process\integration-legacy-control.json`: **0 passed, 4 failed**, exit 1, dengan kegagalan yang sama. Ini bukan tes rollback flag fixture dan bukan regression yang hanya muncul pada candidate.
- Bukti DOM kontrol: `processInsideBarba: false`; di `/work` Process lama masih ada dan dua video tetap bermain. Setelah resize gagal, video sudah readyState 4 tetapi pause dan berada jauh di bawah viewport. Penyebab scroll/resize belum diisolasi; jangan menyimpulkan kegagalan media network.
- ID duplikat global telah ada pada legacy: tujuh pengulangan ID kosong dan dua pengulangan ID Webflow `w-node-_01473dc5-045d-cd95-0817-52d9c52ac3d1-c52ac3cf`. Test mencatat dan mencocokkan daftar Home secara eksplisit, bukan mengklaim halaman bebas duplicate ID.
- Events run candidate/kontrol tidak merekam console error/pageerror/HTTP error; warning Three.js/GPU tetap direkam. Karena tes berhenti sebelum assertion akhir, hasil ini observasi, bukan pass gate console/hydration menyeluruh.
- TypeScript `--noEmit --incremental false`, syntax generator, dan `git --no-pager diff --check` lulus. Production build belum dijalankan; lifecycle, rollback, review manual dan activation tetap terbuka.

### Reproduksi

Jalankan generator dari repository utama, sebelum menjalankan server fixture:

```powershell
node D:\arxenovasocial.com-v2\scripts\prepare-process-integration.mjs
$env:PROCESS_INTEGRATION_CANDIDATE='1'
node D:\arxenovasocial.com-v2\node_modules\next\dist\bin\next dev D:\arxenovasocial.com-v2\artifacts\project-process\integration-app -p 3100
```

Di terminal test dari repository utama, gunakan `PROCESS_INTEGRATION_TEST=1`, `PROCESS_INTEGRATION_CANDIDATE=1`, `BASELINE_URL=http://127.0.0.1:3100`, lalu jalankan Playwright hanya untuk `project-process-integration.spec.ts`. Untuk kontrol legacy gunakan candidate `0` dan URL port 3000. Flag `0` di proses server fixture juga menyediakan fallback, tetapi switch/restart rollback tersebut **belum diuji**. Simpan JSON/output run baru pada nama berbeda; jangan menimpa bukti baseline.

Langkah berikutnya: audit struktur penutup HTML Home dan batas container Barba sebagai unit shared terpisah, lalu diagnosis scroll setelah breakpoint. Jangan menghapus assertion navigation/resize agar test hijau. Dev utama tetap default legacy; candidate tidak boleh diaktifkan.
