# SITTA UT — Tugas Praktik 2 Pemrograman Berbasis Web (MSIM4309)

Aplikasi front-end pemesanan dan monitoring bahan ajar Universitas Terbuka, dibangun dengan Vue.js 3 — halaman stok bahan ajar (filter, sort, tambah, ubah, hapus) dan tracking delivery order. Data dummy dari `js/dataBahanAjar.js`, tanpa backend, tanpa template component.

## Informasi Akademik

| | |
|---|---|
| **Nama** | Pujan Daniar |
| **NIM** | 053074671 |
| **Prodi / Fakultas** | Sistem Informasi — FST |
| **Mata Kuliah** | Pemrograman Berbasis Web (MSIM4309) |
| **UPBJJ UT** | 24 — UPBJJ Bandung |
| **Video** | https:// |

Universitas Terbuka — 2026

## Akses Aplikasi

Aplikasi sudah online dan bisa diakses di: **https://tugas-web.daniar.dev**

## Data Dummy untuk Mencoba

**Nomor DO untuk tracking:** `DO2025-0001` — status "Dalam Perjalanan" dengan riwayat perjalanan.

**Mencoba fitur stok:** filter UT-Daerah → pilih kategori → centang "Hampir habis dan sudah kosong" untuk melihat daftar re-order, atau urutkan berdasarkan judul/stok/harga. Form di bawah tabel untuk menambah dan mengubah data.

**Mencoba fitur tracking:** buat DO baru lewat form — nomor DO dan total harga terisi otomatis, detail isi paket muncul saat paket dipilih. Nomor DO yang baru dibuat langsung bisa dicari.

## Struktur

```
index.html · stok.html · tracking.html
css/style.css
js/ → vue.global.js (Vue 3) · dataBahanAjar.js (dummy data) · stok-app.js · tracking-app.js
font/inter.ttf
```
