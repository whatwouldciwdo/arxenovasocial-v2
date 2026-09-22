# PRD — Migrasi HTML Legacy ke Komponen Next.js dengan 100% Parity

**Produk:** ARXENOVA Website  
**Repository:** `D:\arxenovasocial.com-v2`  
**Status:** Draft baseline / kontrak migrasi  
**Prioritas utama:** Tidak merusak tampilan atau perilaku website yang sedang aktif

## 1. Ringkasan

Website saat ini sudah berjalan di Next.js 14 App Router, tetapi isi utama halaman masih dirender dari HTML legacy melalui `dangerouslySetInnerHTML`. Migrasi akan memindahkan markup dan perilaku secara bertahap ke komponen React/Next.js yang terstruktur dan mudah dikelola.

Migrasi menggunakan pendekatan **strangler migration**: implementasi lama tetap menjadi sumber kebenaran dan fallback, sedangkan komponen baru dibuat berdampingan. Komponen baru hanya boleh menggantikan bagian lama setelah lolos pemeriksaan visual, responsive, interaksi, animasi, konten, aksesibilitas, dan build.

> **Aturan mutlak:** refactor tidak boleh menghasilkan redesign. Hasil akhir harus tampak dan berperilaku sama dengan baseline saat ini.

## 2. Kondisi Baseline Saat Ini

### 2.1 Rendering

- `/` membaca `data/home.html` melalui `data/html-home.ts`.
- `/work` membaca string HTML dari `data/html-work.ts`.
- `/projects/[slug]` membaca string HTML dari `data/html-projects.ts`.
- Ketiga rute menggunakan `dangerouslySetInnerHTML`.
- Terdapat tujuh project slug di `data/projects.ts`.

### 2.2 Beranda

Beranda memiliki lima section utama:

1. `.hero_home_wrap`
2. `.problems_home_wrap`
3. `#process.process_home_wrap`
4. `#faqs.faq_home_wrap`
5. `.cta_home_wrap`

Baseline beranda yang terukur:

- 4 elemen video;
- 20 elemen gambar;
- 15 blok style inline;
- struktur Webflow dan atribut `data-*` yang dipakai runtime animasi.

### 2.3 Styling dan runtime

- `public/css/webflow.shared.css` adalah stylesheet Webflow utama.
- `public/css/monolog-custom.css` berisi styling tambahan.
- `public/js/monolog-runtime.js` adalah runtime legacy sekitar 1,09 MB.
- Runtime mencakup atau mengendalikan jQuery, Webflow, GSAP, ScrollTrigger, SplitText, Three.js, Lenis, Howler, Barba, cursor, video, page transition, dan cleanup.
- `app/layout.tsx` memuat stylesheet legacy dan runtime tersebut secara global.
- Nama class, urutan DOM, atribut `data-*`, dan body state adalah bagian dari kontrak perilaku; semuanya tidak boleh diubah tanpa bukti parity.

## 3. Masalah yang Ingin Diselesaikan

1. Konten sulit diedit karena banyak markup berada dalam satu string HTML panjang.
2. Tidak ada batas komponen yang jelas antarsektion.
3. Data berulang belum dikelola dengan struktur TypeScript.
4. Runtime monolitik sulit diuji dan dibersihkan berdasarkan lifecycle React.
5. Perubahan kecil rawan menyentuh elemen yang salah.
6. Navigasi Barba dan Next.js berpotensi memiliki tanggung jawab yang tumpang tindih.
7. Build production dan dev server memakai `.next` yang sama dan tidak boleh dijalankan bersamaan.

## 4. Tujuan

### 4.1 Tujuan utama

- Memigrasikan HTML legacy menjadi komponen React/Next.js secara bertahap.
- Mempertahankan visual dan perilaku baseline secara praktis 100%.
- Membuat konten berulang dapat diedit melalui data TypeScript yang bertipe.
- Memberikan lifecycle dan cleanup yang benar untuk setiap interaksi/animasi.
- Mempertahankan rute, metadata, URL aset, SEO, dan pengalaman pengguna.
- Menyediakan rollback cepat untuk setiap unit migrasi.

### 4.2 Indikator keberhasilan

- Tidak ada regression visual yang terlihat pada viewport pengujian.
- Tidak ada interaksi, animasi, audio, video, cursor, modal, atau navigasi yang hilang.
- Tidak ada hydration error atau error runtime baru.
- Tidak ada request aset aplikasi yang 404.
- `npm run build` lulus.
- HTML lama tetap tersedia sebagai fallback sampai seluruh migrasi diterima.

## 5. Non-goals Selama Migrasi Parity

Hal-hal berikut **tidak termasuk** dalam fase parity dan tidak boleh disisipkan ke pekerjaan migrasi:

- redesign visual;
- perubahan copy, urutan section, spacing, breakpoint, font, warna, atau aset;
- optimasi kreatif yang mengubah timing/easing animasi;
- penggantian library tanpa kebutuhan parity yang terbukti;
- penghapusan CSS Webflow secara massal;
- penghapusan runtime legacy secara massal;
- perubahan URL/rute atau struktur SEO;
- konversi semua halaman sekaligus;
- penggunaan `next/image` jika mengubah ukuran, crop, loading, atau layout gambar baseline.

Optimasi hanya dilakukan setelah parity seluruh target terkait telah diterima dan dikerjakan sebagai fase terpisah.

## 6. Definisi “100% Mirip”

“100% mirip” adalah target penerimaan berikut, bukan klaim bahwa dua renderer menghasilkan piksel matematis identik di seluruh perangkat.

### 6.1 Visual parity

- Layout, ukuran, posisi, spacing, alignment, overflow, stacking, dan crop sama.
- Font family, weight, size, line-height, letter-spacing, wrapping, dan casing sama.
- Warna, border, radius, shadow, blend, opacity, dan background sama.
- Gambar, video, SVG, canvas, dan poster sama.
- Tidak ada layout shift baru.
- Perbandingan screenshot dilakukan pada halaman yang sudah stabil setelah font/media siap.
- Target automated pixel difference: maksimum **0,5% per viewport**, dengan setiap perbedaan yang terlihat tetap harus direview manual.

### 6.2 Responsive parity

Minimal diuji pada:

- 375 × 812 — mobile;
- 768 × 1024 — tablet;
- 1024 × 768 — small desktop/tablet landscape;
- 1440 × 900 — desktop;
- 1920 × 1080 — large desktop.

Breakpoint tambahan wajib digunakan jika baseline berubah perilaku di sekitar 767 px atau 991 px.

### 6.3 Behavioral parity

- Hover, focus, pointer, cursor text, dan pressed state sama.
- Scroll direction, smooth scroll, pinning, reveal, scrub, dan trigger position sama.
- Durasi, delay, stagger, easing, dan urutan animasi sama.
- Video play/pause, mute, loop, inline playback, lazy/preload, dan link sama.
- Menu, About modal, FAQ, slider, CTA, anchor scroll, audio, dan transition sama.
- Navigasi direct-load, internal navigation, back/forward, refresh, dan deep link tetap bekerja.
- Cleanup tidak meninggalkan duplicate listener, ScrollTrigger, RAF, canvas, audio, atau Lenis instance.

### 6.4 Content dan DOM contract parity

- Copy, link, `target`, label, alt text, dan urutan konten sama.
- Class legacy dan atribut `data-*` dipertahankan selama masih dibaca CSS/runtime.
- Struktur DOM dipertahankan jika selector CSS/JavaScript bergantung padanya.
- Semantik dan aksesibilitas tidak boleh menurun.

### 6.5 Technical parity

- Tidak ada error console baru.
- Tidak ada hydration mismatch.
- Tidak ada aset lokal `404`.
- Tidak ada duplikasi ID.
- Build, lint/type checking yang tersedia, dan route generation lulus.

## 7. Prinsip dan Guardrail Implementasi

1. **Baseline first.** Ambil bukti baseline sebelum menyentuh unit yang dimigrasikan.
2. **Satu unit kecil per perubahan.** Maksimal satu section atau satu shared primitive per tahap.
3. **Markup first, behavior later.** JSX awal harus menyalin DOM tanpa redesign.
4. **Pertahankan class dan `data-*`.** Jangan rename saat fase parity.
5. **Legacy tetap tersedia.** Jangan hapus source lama sebelum sign-off seluruh rute.
6. **Tidak ada big-bang rewrite.** Home, Work, dan Project Detail dimigrasikan terpisah.
7. **Tidak mencampur refactor dan content update.** Perubahan copy/aset dilakukan terpisah.
8. **Tidak mencampur runtime lama dan baru untuk behavior yang sama.** Setiap behavior harus memiliki satu owner aktif agar tidak terjadi listener/animasi ganda.
9. **Cleanup wajib.** Hook client harus membersihkan listener, timeline, ScrollTrigger, observer, RAF, canvas, dan instance library.
10. **Rollback satu langkah.** Aktivasi komponen baru harus dapat dibalik tanpa merekonstruksi HTML lama.
11. **Jangan jalankan `next build` bersama `next dev`.** Hentikan dev server, build, lalu mulai lagi; keduanya menulis ke `.next`.
12. **Tidak menambah dependency tanpa persetujuan dan alasan parity.** Gunakan library yang sudah ada bila memungkinkan.

## 8. Strategi Migrasi

### 8.1 Pola strangler

Untuk setiap unit:

1. ekstrak snapshot markup legacy;
2. buat data/type bila konten berulang;
3. buat komponen React dengan DOM, class, atribut, dan konten identik;
4. render komponen dalam harness/rute pembanding yang tidak mengubah production path;
5. bandingkan baseline dan candidate;
6. perbaiki sampai seluruh acceptance gate lulus;
7. aktifkan unit baru secara terkontrol;
8. simpan fallback legacy;
9. pantau regression sebelum berpindah ke unit berikutnya.

### 8.2 Urutan migrasi yang disarankan

1. Tooling baseline dan regression harness.
2. `ProjectProcess` (`#process`) sebagai pilot.
3. FAQ (`#faqs`).
4. Problems/clients.
5. CTA.
6. Hero.
7. Shared overlays, menu, cursor, sound, dan page transition.
8. Halaman Work.
9. Project Detail satu slug pilot, lalu seluruh slug.
10. Runtime decomposition dan penghapusan legacy setelah sign-off penuh.

Urutan dapat berubah hanya jika dependency audit menunjukkan risiko yang lebih rendah.

## 9. Arsitektur Target

Struktur target indikatif:

```text
app/
  page.tsx
  work/page.tsx
  projects/[slug]/page.tsx
components/
  home/
    HeroSection.tsx
    ProblemsSection.tsx
    ProjectProcess.tsx
    FaqSection.tsx
    CtaSection.tsx
  shared/
data/
  home/
    process.ts
    faq.ts
  projects.ts
public/
  images/
  videos/
```

Ini adalah arah, bukan izin untuk memindahkan seluruh file sekaligus. Server Component menjadi default; `'use client'` hanya digunakan pada boundary yang benar-benar membutuhkan browser API atau lifecycle interaktif.

## 10. Acceptance Gate per Unit

Sebuah unit hanya boleh dinyatakan selesai jika:

- [ ] baseline screenshot dan interaction inventory tersedia;
- [ ] markup, class, data attribute, copy, link, dan aset telah dicocokkan;
- [ ] desktop, tablet, dan mobile lulus visual review;
- [ ] animasi serta interaction checklist lulus;
- [ ] direct load dan navigasi antarrute lulus;
- [ ] tidak ada error console/hydration;
- [ ] tidak ada request aset aplikasi yang 404;
- [ ] tidak ada duplicate listener/animation setelah navigasi berulang;
- [ ] `npm run build` lulus saat dev server dihentikan;
- [ ] fallback/rollback telah diuji;
- [ ] persetujuan manual diberikan sebelum unit lama dinonaktifkan.

Jika satu item gagal, unit tetap dianggap **belum selesai** dan baseline lama tetap aktif.

## 11. Testing Strategy

### 11.1 Sebelum migrasi

- Rekam screenshot seluruh halaman pada viewport target.
- Rekam video interaksi/animasi penting.
- Simpan daftar URL, status aset, dan console output.
- Inventarisasi selector CSS/JS yang menyentuh unit.
- Catat tinggi/lebar section dan breakpoint behavior.

### 11.2 Selama migrasi

- Bandingkan DOM penting dan computed style.
- Bandingkan screenshot baseline/candidate.
- Uji keyboard, pointer fine, dan touch/coarse.
- Uji reduced motion bila baseline mendukungnya.
- Uji jaringan lambat untuk image/video lazy loading.

### 11.3 Setelah aktivasi

- Smoke test `/`, `/work`, dan seluruh `/projects/[slug]`.
- Navigasi bolak-balik minimal tiga siklus untuk menemukan duplicate initialization.
- Uji refresh pada setiap rute.
- Periksa console, network, memory/listener behavior, dan layout shift.

## 12. Rollout dan Rollback

- Aktivasi dilakukan per section/rute, bukan sekaligus.
- Source legacy tidak dihapus saat candidate pertama diaktifkan.
- Jika ada regression visual atau behavior, candidate segera dinonaktifkan dan legacy diaktifkan kembali.
- Penghapusan source legacy hanya boleh dilakukan setelah semua route lulus dan telah disetujui secara eksplisit.
- Sebelum perubahan berisiko, simpan salinan baseline yang dapat dibandingkan atau gunakan version control saat tersedia.

## 13. Risiko Utama dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Struktur DOM berubah | CSS/animasi rusak | Salin struktur dan urutan node terlebih dahulu |
| Runtime legacy inisialisasi dua kali | Animasi/listener ganda | Satu owner per behavior dan cleanup test |
| Barba bertabrakan dengan App Router | Navigasi tidak konsisten | Pertahankan behavior lama sampai replacement diuji terisolasi |
| GSAP/SplitText mengubah DOM | Hydration mismatch | Jalankan hanya setelah mount pada boundary client yang tepat |
| Lenis/RAF tidak dibersihkan | scroll/memory bermasalah | Cleanup eksplisit dan navigation-cycle test |
| CSS global sangat luas | style leakage | Pertahankan class; jangan rename/menghapus CSS prematur |
| Media mengubah layout/crop | visual tidak identik | Pertahankan atribut, ratio, object-fit, preload, dan sumber |
| Build berjalan bersama dev | `.next` korup/chunk 404 | Jangan jalankan keduanya bersamaan; bersihkan `.next` jika tercampur |
| Tidak ada baseline objektif | “mirip” menjadi subjektif | Screenshot, rekaman, inventory, dan acceptance gate wajib |

## 14. Definition of Done Program

Program migrasi selesai hanya ketika:

1. Home, Work, dan semua Project Detail dirender sebagai komponen Next.js terstruktur.
2. Semua acceptance gate visual dan behavioral lulus.
3. Tidak ada kebutuhan runtime terhadap HTML string legacy.
4. Tidak ada regression pada rute, SEO, aset, animasi, interaksi, atau responsive behavior.
5. Runtime legacy yang tidak lagi dibutuhkan telah dihapus secara terukur, bukan sekaligus.
6. Build production lulus dari cache bersih.
7. Dokumentasi arsitektur dan cara mengedit konten telah diperbarui.
8. Penghapusan fallback legacy mendapat persetujuan eksplisit.

## 15. Keputusan Awal

- Pilot pertama: section `#process` / Project Process (disebut Project Journey oleh stakeholder).
- HTML lama tetap aktif sampai pilot lolos seluruh gate.
- CSS Webflow dan `monolog-runtime.js` tidak dihapus pada pilot.
- Tidak ada perubahan desain atau copy selama migrasi pilot.
- Seluruh pekerjaan eksekusi dilacak di `TASK.md`.