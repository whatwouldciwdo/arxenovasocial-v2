# Fase 0 — Runtime Dependency dan Lifecycle Inventory

Dokumen ini memetakan implementasi aktif secara statis. Sumber utama adalah `app/layout.tsx`, entry route di `app/`, markup legacy, dan bagian custom `bundle.js` di `public/js/monolog-runtime.js`. Nama fungsi runtime ter-minify dan dapat berubah jika bundle dibangun ulang; selector/atribut DOM adalah kontrak yang lebih stabil.

## Status bukti

- **Terbukti statis:** selector, initializer, state mutation, dan cleanup yang terlihat di source/bundle.
- **Belum terbukti browser:** urutan aktual event, visual/timing, jumlah listener/instance setelah navigasi, error console, request gagal, dan compatibility pointer/touch.
- Komponen `components/SmoothScroll.tsx`, `CustomCursor.tsx`, `SoundProvider.tsx`, `Footer.tsx`, dan `FooterCanvas.tsx` tidak di-import oleh entry route/layout aktif. Komponen tersebut bukan behavior owner saat ini dan tidak boleh dipasang bersamaan dengan owner legacy tanpa pemindahan ownership serta cleanup yang eksplisit.

## Ownership navigasi dan lifecycle

| Area | Owner aktif | Bukti dan tanggung jawab |
| --- | --- | --- |
| Request awal, route matching, metadata, server render | Next.js App Router | `app/page.tsx`, `app/work/page.tsx`, dan `app/projects/[slug]/page.tsx` menyuntikkan HTML legacy; `app/layout.tsx` menyediakan root dan memuat runtime global. |
| Navigasi link setelah runtime siap | Barba | `barba.init()` membaca `[data-barba="wrapper"]`, `[data-barba="container"]`, dan namespace. Barba melakukan leave/enter dan fetch HTML route Next. |
| Transition dan scroll reset | Legacy/Barba | Leave menutup menu, menjalankan transition, dan menghentikan Lenis; enter mengatur scroll 0, memulai Lenis, refresh ScrollTrigger, lalu menjalankan page animation. |
| Re-init halaman | Legacy/Barba | `beforeEnter` mengubah `data-wf-page`, menyinkronkan `data-page-type`, memanggil `Webflow.destroy()/ready()/ix2.init()`, memperbarui `.w--current`, lalu menjalankan initializer global dan namespace. |
| Cleanup route | Legacy/Barba | `afterLeave` menjalankan `ScrollTrigger.getAll().forEach(kill)` dan menghapus container lama. `window.pageCleanupFunctions` adalah registry cleanup custom yang dijalankan sebelum route berganti. |
| DOM section saat ini | HTML legacy | Semua route aktif memakai `dangerouslySetInnerHTML`; React belum memiliki lifecycle per section. |

### Batas coexistence

Next App Router dan Barba saat ini sama-sama berada di jalur navigasi: Next menyediakan response route, sementara Barba mengintersep link dan mengganti container di browser. Selama parity, jangan menambahkan `next/link`/router navigation sebagai owner kedua untuk link di dalam container Barba. Candidate Process harus mempertahankan container dan namespace di luar section serta membiarkan runtime legacy menjadi owner behavior pertama kali. Pemindahan behavior ke React harus satu per satu dan initializer legacy terkait harus dinonaktifkan untuk candidate tersebut.

## Root dan global state

| Lokasi | State/selector | Producer / consumer |
| --- | --- | --- |
| `<html>` | `class="w-mod-js"`, `data-wf-domain`, `data-wf-site`, `data-wf-page`; Webflow dapat menambah touch classes | Shell Next menetapkan baseline; Barba menyinkronkan `data-wf-page` dari response berikutnya. |
| `<body>` | `data-barba="wrapper"` | Root Barba permanen milik `app/layout.tsx`. |
| `<body>` | `data-navigation-status` (`is-close` awal; runtime juga menulis `is-open`/`is-closed`) | Menu/navigation runtime. Perbedaan `is-close` vs `is-closed` harus dipertahankan sampai diuji karena bundle menormalisasi ke `is-closed`. |
| `<body>` | `data-about-status="is-closed"` | About modal markup/style dan runtime modal. |
| `<body>` | `data-theme-nav="dark"`, elemen `[data-theme-nav]`, `[data-bg-nav]` | Theme watcher mencocokkan section `[data-theme-section]`/`[data-bg-section]` terhadap tinggi nav saat scroll. |
| `<body>` | `data-scroll-time="0"` | Kontrak global markup/runtime; nilai aktual perlu direkam di browser. |
| `<body>` | `data-page-type`, `data-lenis-prevent`, class `overflow-hidden` | Page orientation dan lock modal/menu; Barba cleanup menghapus lock sebelum enter. |
| container | `[data-barba="container"][data-barba-namespace]` | Batas DOM yang diganti Barba dan kunci initializer namespace (`home`, `work`, project). |
| global JS | Lenis instance, GSAP matchMedia, `window.pageCleanupFunctions` | Runtime legacy; cleanup parsial lewat destroy/kill/callback registry. |

## Home section map

### Hero — `.hero_home_wrap`

- Tidak ada lookup literal `.hero_home_wrap` di custom bundle; coupling behavior memakai atribut generik.
- Reveal memakai `[data-split-reveal]`, `[data-fade-reveal]`, `[data-lines-reveal]`, atau kontrak reveal terkait dan GSAP/SplitText.
- Parallax/translation memakai `[data-scroll-container]`, child `[data-translate-hero="true"]`, serta optional `data-target-translate`, `data-inverse-translate`, `data-direction`, `data-start`, dan `data-end`; desktop-only melalui GSAP matchMedia `(min-width: 992px)` dan menghormati reduced motion.
- Overlay memakai `[data-overlay-container]`, `[data-overlay-scroll]`, dan optional `data-target-opacity`.
- Media viewport memakai `[data-video="playpause"]` jika atribut tersebut ada pada wrapper.
- Risiko lifecycle: SplitText, matchMedia context, timelines/ScrollTriggers, serta listener generik harus tetap menjadi satu instance per navigation.

### Problems/clients — `.problems_home_wrap`

- Tidak ada lookup literal `.problems_home_wrap` di custom bundle.
- Cards tetap bergantung pada class Webflow/CSS dan DOM list (`.problems_home_item`, image, label).
- Behavior generik yang dapat menyentuh descendants: reveal attributes, `[data-hover-highlight]`, `[data-cursor-hover]`, media lazy loading, dan theme-section watcher.
- `[data-hover-highlight]` memasang `mouseenter`/`mouseleave` dan menganimasikan background dengan GSAP. Cursor membaca target terdekat `[data-cursor-hover]` dan `data-cursor-text`.
- Urutan, crop/logo URL, responsive grid, dan kemungkinan slider/stat interaction masih perlu bukti browser.

### Project Process — `#process.process_home_wrap`

- Tidak ada lookup literal `.process_home_*` atau `.process_index_*` di custom bundle. Class tetap merupakan kontrak CSS: counter step dan initial opacity/scale index berasal dari inline CSS dan stylesheet legacy.
- Tiga item/process media bergantung pada struktur DOM, class Webflow, URL/atribut video, CTA/link, dan nomor pseudo-element; semuanya harus disalin identik pada pilot.
- Runtime langsung yang terbukti: setiap `[data-video="playpause"]` mendapatkan ScrollTrigger `start: "0% 100%"`, `end: "100% 0%"`; enter/enterBack memanggil `video.play()`, leave/leaveBack memanggil `video.pause()`.
- Runtime generik yang mungkin berlaku sesuai atribut dalam subtree: reveal/SplitText, hover highlight, cursor, theme section, dan scroll container.
- Setelah perbaikan Fase 0, handler `lt()` mendaftarkan cleanup per video pada `window.pageCleanupFunctions`: kill trigger dan pause video, selain cleanup ScrollTrigger global saat navigasi. Promise `video.play()` menangani `AbortError`/`NotAllowedError` tanpa retry; rejection lainnya tidak disembunyikan. Legacy tetap owner playback selama pilot markup.
- **Ownership pilot awal:** React hanya menghasilkan markup; legacy tetap owner video/reveal/cursor. Jangan menambahkan effect Process hingga duplicate-init test tersedia.

### FAQ — `#faqs.faq_home_wrap`

- Accordion root: `[data-accordion-css-init]`; toggle dipilih lewat delegated click pada `[data-accordion-toggle]`; item terdekat memakai `[data-accordion-status]` dengan nilai `active`/`not-active`.
- `data-accordion-close-siblings="true"` menutup sibling aktif. `[data-hover-highlight="accordion"]` mempertahankan background aktif.
- Cursor/CTA FAQ memakai kontrak generik `[data-cursor-hover]`, `data-cursor-text`, dan reveal attributes.
- Listener click accordion ditambahkan per initializer. Bundle mengandalkan penghapusan container lama pada navigasi; duplicate listener pada initial/container reuse belum terbukti tanpa browser.

### CTA — `.cta_home_wrap`

- GSAP timeline pertama memakai `.cta_home_wrap`, scrub dari `bottom center` sampai `90% top`, dan mengubah `clipPath`.
- Timeline kedua memakai trigger CTA dari `top bottom` sampai `bottom top` dan menggeser `.cta_heading_inner` dengan `xPercent: 50`.
- Footer/CTA terkait memakai `[data-footer-parallax]`, `[data-footer-parallax-inner]`, `[data-footer-parallax-dark]`, `[data-canvas-container]`, `[data-canvas-content]` dan ScrollTrigger scrub.
- Theme watcher, cursor, hover, reveal, serta canvas/Three.js custom legacy tetap owner. Cleanup wajib mencakup ScrollTrigger dan disposer canvas yang didaftarkan ke registry.

## Shared behavior map

| Behavior | Selector/state utama | Init dan cleanup statis |
| --- | --- | --- |
| Smooth scroll | `#to-top`, `a[href^="#"]`, `data-page-type`, `data-lenis-prevent` | Runtime menghancurkan Lenis lama sebelum membuat instance baru, menghubungkan scroll ke `ScrollTrigger.update`, dan menambahkan RAF via `gsap.ticker`. Validasi browser tetap diperlukan untuk ticker/listener anchor berulang. |
| Menu/navigation | `[data-navigation-status]`, nav toggles/overlay, body lock | Runtime menulis status open/closed, lock scroll, dan memaksa close saat leave. |
| About modal | `data-about-status`, modal open/close controls, body lock | Runtime legacy owner; status awal berada di body. Close/re-init harus diuji pada route change. |
| Cursor | `[data-cursor]`, `[data-cursor-text-target]`, `[data-cursor-hover]`, `data-cursor-text` | Fine pointer only; listener `mousemove`, `scroll`, `mouseleave`, GSAP quickTo, dan RAF. Listener global perlu pembuktian tidak berlipat. |
| Sound | sound controls/attributes dan Howler objects di bundle | Runtime legacy owner dan mengikuti gesture/browser audio policy. Komponen React `SoundProvider` tidak aktif. |
| Video | `[data-video="playpause"] video` | ScrollTrigger play/pause; dibersihkan melalui global ScrollTrigger kill. |
| Accordion | `[data-accordion-css-init]`, `[data-accordion-toggle]`, `[data-accordion-status]` | Delegated click per root; container removal menjadi cleanup utama. |
| Page transition | `.transition_screen`, Barba wrapper/container/namespace | Barba owns once/leave/enter; timeout 7000 ms, `preventRunning: true`. |
| Webflow | `data-wf-*`, `.w--current` | Destroy/ready/ix2 init pada `beforeEnter`; current link dihitung ulang. |
| Canvas/Three.js | `[data-canvas-container]` dan canvas legacy | Runtime membuat renderer/RAF/listener dan mendaftarkan disposer; harus divalidasi dengan navigation cycles. |

## Acceptance dan risiko yang tetap terbuka

1. Jalankan minimal tiga siklus navigasi browser dan ukur jumlah ScrollTrigger, Lenis/ticker, listener, RAF, canvas, audio, serta handler accordion/video.
2. Pastikan direct load, Barba click, back/forward, refresh, anchor, dan deep-link tidak berkompetisi dengan App Router.
3. Rekam state root sebelum/dalam/setelah menu dan About modal, lalu setelah route transition.
4. Verifikasi Process pada desktop/tablet/mobile: wrapping, index transition, sticky/scroll, video play/pause/autoplay policy, cursor, CTA, dan resize 767/991 px.
5. Jangan menandai Gate Fase 0 lulus hanya dari audit ini; screenshot, console/network, interaction capture, dan rollback aktual masih terbuka.