# PRD — CatatanBarokah Telur

## Problem Statement (Original)
"buatkan aku web keuangan yang berjudul catatanBarokah telur yang multi fungsi: dashboard, uang masuk dan keluar, nota. Desain 3D. Landing page ada antigrafity"

Pilihan default yang disepakati (user menjawab "ok"): tanpa login (single-user langsung akses), tema warm organic amber/emas, mata uang Rupiah, UI Bahasa Indonesia, nota bisa dicetak.

## User Personas
1. **Pemilik usaha telur kecil-menengah** (grosir/warung/retail): ingin mencatat penjualan per peti/rak/kg/butir tanpa ribet.
2. **Pengelola keuangan keluarga usaha**: perlu laporan cepat — saldo bersih, pengeluaran kategori, dan nota piutang pelanggan.

## Arsitektur
- **Frontend**: React 19 (CRA + craco), Tailwind, shadcn/ui, React Query, Recharts, Framer Motion, React Three Fiber + Drei (3D egg anti-gravity), react-router-dom v7. Port 3000.
- **Backend**: FastAPI + Motor (MongoDB async), BaseModel BaseDocument (PyObjectId → str). Port 8001, prefix /api. Hot reload.
- **DB**: MongoDB, DB_NAME dari env (test_database). Koleksi: transactions, nota.

## Core Requirements (Statis)
1. Landing page dengan hero 3D telur emas melayang (anti-gravity) + floating chips + fitur cards + CTA.
2. Dashboard: Pemasukan, Pengeluaran, Saldo Bersih, Peti Terjual; grafik aliran kas 7 hari; pie pengeluaran per kategori; transaksi terbaru; banner nota belum lunas.
3. Uang Masuk & Keluar: form (tipe, nominal, kategori, qty+satuan, keterangan, tanggal), daftar dengan pencarian + filter, hapus, ringkasan total.
4. Nota: form pelanggan + item dinamis (nama, qty, satuan, harga), status lunas/belum, pratinjau struk thermal live, simpan, simpan & cetak (window.print + print-area), tandai lunas, hapus, daftar nota.
5. Semua elemen interaktif memiliki data-testid.

## implemented (dated)
- 2026-09-17: Backend penuh (transactions CRUD, nota CRUD + status, dashboard agregat), seed data contoh.
- 2026-09-17: Landing page 3D anti-gravity (R3F Float, orbit coins, sparkles), fitur tilt-cards, CTA band.
- 2026-09-17: Dashboard (4 stat cards, area chart 7 hari, pie kategori, recent, banner piutang).
- 2026-09-17: Transaksi (form masuk/keluar, kategori telur, qty+satuan, cari, filter, hapus).
- 2026-09-17: Nota (struk thermal live preview, print CSS @media print, lifecycle lunas).
- 2026-09-17: Perbaikan: API kini mengembalikan `id` (bukan `_id`); import Pie; bootstrap posthog index.html diganti versi valid (dev server perlu restart untuk serving HTML baru); overflow mobile header diperbaiki.
- 2026-09-17: Testing agent iteration 1 + verifikasi manual browser: semua alur lolos (save/lunas/print nota sebelumnya false-negative otomasi).

## Backlog Prioritas
- **P0**: — (core selesai)
- **P1**: Filter periode dashboard (bulan ini/bulan lalu/7/30 hari); ekspor laporan Excel/PDF.
- **P2**: Stok telur harian (retur, butir pecah); multi-bisnis/profil toko; pengingat nota via WhatsApp; backup data.
- **Spark**: Pengingat otomatis nota belum lunas via WhatsApp (Twilio) — sangat pas untuk pelanggan warung/grosir.

## Next Tasks
1. Filter periode pada dashboard (P1).
2. Ekspor laporan bulanan Excel/PDF (P1).
3. Integrasi WhatsApp reminder untuk nota belum lunas (Spark, perlu integrasi_expert Twilio).

## Catatan Operasional
- Tidak ada autentikasi; /app/memory/test_credentials.md berisi info seed data.
- PERLU DIINGAT: perubahan `/app/frontend/public/index.html` hanya aktif setelah `sudo supervisorctl restart frontend` (dev server meng-cache HTML yang disajikan).
- Jangan instal paket dengan `--ignore-engines` kecuali diperlukan (three/drei terinstal dengan flag ini, node 20 vs engine >=22 camera-controls).
