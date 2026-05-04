<div align="center">

# 🧾 SIKASIR
### Modern Point of Sale Application

![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST-092E20?style=for-the-badge&logo=django&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

<p align="center">
  Aplikasi Point of Sale modern yang ringan, cepat, dan mudah digunakan.<br/>
  Dibangun dengan <strong>Python Django REST Framework</strong> dan <strong>React JS Vite</strong>.
</p>

---

[✨ Fitur](#-fitur-utama) • [🚀 Instalasi](#-instalasi) • [📖 Cara Pakai](#-cara-pakai) • [📸 Screenshot](#-screenshot) • [🛠️ Tech Stack](#️-tech-stack) • [🤝 Kontribusi](#-kontribusi)

</div>

---

## ✨ Fitur Utama

<table>
  <tr>
    <td width="50%">

### 🔐 Authentication & Role
- Login aman dengan JWT Token
- **2 Role:** Admin & Kasir
- Session persist setelah refresh
- Protected routes per role

### 🛍️ Manajemen Produk
- CRUD produk lengkap
- Toggle status Aktif / Nonaktif
- Format harga Rupiah otomatis
- Indikator stok habis

### 💳 Transaksi & Checkout
- Keranjang belanja real-time
- Kalkulasi kembalian otomatis
- Multiple metode pembayaran
- Generate struk / receipt

    </td>
    <td width="50%">

### 📦 Import Produk (Excel/CSV)
- Download template Excel siap pakai
- Drag & drop upload file
- Preview data sebelum import
- Validasi baris per baris

### 📊 Dashboard & Laporan
- Total penjualan hari ini
- Grafik transaksi
- Produk terlaris
- Riwayat transaksi lengkap

### ⚙️ Admin Panel
- Manajemen inventori
- Reset database (dengan triple confirmation)
- Log aktivitas sistem
- Pengaturan toko

    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 18, Vite 5, React Router, Axios |
| **UI / Notifikasi** | SweetAlert2, CSS Modules |
| **Backend** | Python 3.10+, Django, Django REST Framework |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Import/Export** | openpyxl, pandas |
| **Auth** | JWT (djangorestframework-simplejwt) |

---

## 📋 Persyaratan Sistem

Sebelum instalasi, pastikan sudah terinstall:

```bash
# Cek versi yang dibutuhkan
node --version    # v18.0.0 atau lebih baru
python --version  # Python 3.10 atau lebih baru
pip --version     # pip 22.0 atau lebih baru
```

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/sikasir.git
cd sikasir
```

---

### 2. Setup Backend (Python Django)

```bash
# Masuk ke folder backend
cd backend

# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install semua dependencies
pip install -r requirements.txt
```

#### Konfigurasi Environment Backend

```bash
# Salin file env contoh
cp .env.example .env
```

Edit file `.env`:

```env
# .env — Backend
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (default: SQLite)
DATABASE_URL=sqlite:///db.sqlite3

# Untuk PostgreSQL (production):
# DATABASE_URL=postgresql://user:password@localhost:5432/sikasir

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60    # menit
JWT_REFRESH_TOKEN_LIFETIME=1440 # menit (1 hari)
```

#### Jalankan Migrasi & Buat Admin

```bash
# Jalankan migrasi database
python manage.py migrate

# Buat akun superuser (admin pertama)
python manage.py createsuperuser
# Masukkan: username, email, password

# (Opsional) Load data contoh
python manage.py loaddata fixtures/sample_data.json

# Jalankan server backend
python manage.py runserver
# Backend berjalan di: http://localhost:8000
```

---

### 3. Setup Frontend (React Vite)

```bash
# Buka terminal baru, masuk ke folder frontend
cd frontend

# Install semua dependencies
npm install

# Salin file env contoh
cp .env.example .env
```

Edit file `.env`:

```env
# .env — Frontend
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=SIKASIR
VITE_APP_VERSION=1.0.0
```

```bash
# Jalankan development server
npm run dev
# Frontend berjalan di: http://localhost:5173
```

---

### 4. Verifikasi Instalasi

Buka browser dan akses:

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:5173 | Harus tampil halaman login |
| Backend API | http://localhost:8000/api | Harus return JSON |
| API Docs | http://localhost:8000/api/docs | Swagger UI |

---

## 📖 Cara Pakai

### 🔐 Login Pertama Kali

```
1. Buka http://localhost:5173
2. Login dengan akun superuser yang dibuat saat instalasi
3. Kamu akan masuk sebagai Admin
```

> **Default credentials (jika menggunakan sample data):**
> - Admin → `admin` / `admin123`
> - Kasir → `kasir` / `kasir123`

---

### 👨‍💼 Panduan Admin

#### Menambah Produk Manual
```
1. Buka menu Inventory (ikon kotak di sidebar)
2. Klik tombol "+ Tambah Produk" (kanan atas)
3. Isi form: SKU, Nama, Harga, Stok, Kategori
4. Klik "Simpan"
```

#### Import Produk via Excel
```
1. Buka menu Inventory
2. Klik tombol "Import" 
3. Klik "Download Template" untuk mendapatkan format yang benar
4. Isi template Excel dengan data produk kamu
5. Upload file kembali (.xlsx atau .csv)
6. Review preview data yang akan diimport
7. Klik "Import X Produk" untuk konfirmasi
```

> 💡 **Tips:** Gunakan selalu template yang disediakan agar format kolom selalu sesuai.

#### Format Template Excel

| Kolom | Keterangan | Wajib |
|-------|------------|-------|
| SKU | Kode unik produk | ✅ |
| Nama Produk | Nama yang ditampilkan | ✅ |
| Harga | Angka saja, tanpa Rp atau titik | ✅ |
| Stok | Jumlah stok awal | ✅ |
| Kategori | Kategori produk | ❌ |
| Deskripsi | Deskripsi singkat | ❌ |

#### Mengaktifkan / Menonaktifkan Produk
```
1. Buka menu Inventory
2. Klik badge "Aktif" atau "Nonaktif" pada baris produk
3. Konfirmasi perubahan status
```

> ⚠️ Produk **Nonaktif** tidak akan muncul di halaman kasir.

#### Reset Database
```
1. Buka menu Settings (ikon gear)
2. Scroll ke bagian "⚠️ Zona Berbahaya"
3. Klik "Reset Database"
4. Ikuti 3 langkah konfirmasi:
   → Konfirmasi 1: Baca peringatan & klik Lanjutkan
   → Konfirmasi 2: Ketik "RESET" (huruf kapital)
   → Konfirmasi 3: Klik "Ya, Reset Sekarang"
```

> 🚨 **PERINGATAN:** Reset database menghapus **semua produk dan transaksi** secara permanen. Data user tidak terpengaruh.

---

### 🧑‍💻 Panduan Kasir

#### Proses Transaksi
```
1. Login sebagai Kasir
2. Cari produk via kolom pencarian atau browse katalog
3. Klik produk untuk menambahkan ke keranjang
4. Atur quantity jika diperlukan
5. Klik "Checkout" saat siap
6. Masukkan nominal bayar
7. Sistem kalkulasi kembalian otomatis
8. Klik "Bayar Sekarang"
9. Struk ter-generate otomatis
```

#### Tips Kasir
- 🔍 Gunakan **search** untuk cari produk dengan cepat
- ➕ Klik produk berulang untuk tambah quantity
- 🗑️ Klik ikon hapus di keranjang untuk remove item
- 💵 Kembalian dikalkulasi **real-time** saat kamu mengetik nominal bayar

---

## 📸 Screenshot

> 📌 **Catatan:** Tambahkan screenshot aplikasi kamu di folder `/screenshots` dan update path di bawah ini.

### Halaman Login
```
📁 screenshots/login.png
```
![Login Page](screenshots/login.png)

---

### Dashboard Admin
```
📁 screenshots/dashboard.png
```
![Dashboard](screenshots/dashboard.png)

---

### Halaman Kasir / POS
```
📁 screenshots/kasir.png
```
![kasir Page](screenshots/kasir.png)

---

### Inventory Management
```
📁 screenshots/inventory.png
```
![Inventory](screenshots/inventory.png)

---

### Import Produk via Excel
```
📁 screenshots/import.png
```
![Import Products](screenshots/import.png)

---

### Checkout & Pembayaran
```
📁 screenshots/checkout.png
```
![Checkout](screenshots/checkout.png)

---

### Riwayat Transaksi
```
📁 screenshots/history.png
```
![Transaction History](screenshots/history.png)

---

## 📁 Struktur Project

```
sikasir/
│
├── backend/                        # Python Django Backend
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py             # Model user & role
│   │   │   ├── product.py          # Model produk & kategori
│   │   │   ├── transaction.py      # Model transaksi & item
│   │   │   └── reset_log.py        # Log aktivitas reset
│   │   ├── routes/
│   │   │   ├── auth.py             # Login, logout, refresh token
│   │   │   ├── products.py         # CRUD produk + import
│   │   │   ├── transactions.py     # Checkout & riwayat
│   │   │   ├── dashboard.py        # Data statistik
│   │   │   └── admin.py            # Reset database
│   │   ├── serializers/            # DRF Serializers
│   │   ├── middleware/             # Auth & error handler
│   │   └── utils/                  # Helper functions
│   ├── fixtures/
│   │   └── sample_data.json        # Data contoh untuk development
│   ├── .env.example
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                       # React Vite Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── POS.jsx             # Halaman kasir
│   │   │   ├── Inventory.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Receipt.jsx
│   │   │   └── Settings.jsx
│   │   ├── components/
│   │   │   ├── ImportProductModal.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── SkeletonLoader.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + interceptor
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── utils/
│   │   │   └── currency.js         # Format Rupiah helper
│   │   └── store/                  # State management
│   ├── .env.example
│   ├── index.html
│   └── vite.config.js
│
├── screenshots/                    # Screenshot untuk README
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login & dapat token | ❌ |
| POST | `/api/auth/logout` | Logout & invalidate token | ✅ |
| POST | `/api/auth/refresh` | Refresh access token | ✅ |

### Products
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/products` | List semua produk aktif | Semua |
| POST | `/api/products` | Tambah produk baru | Admin |
| PUT | `/api/products/:id` | Edit produk | Admin |
| DELETE | `/api/products/:id` | Hapus produk permanen | Admin |
| PATCH | `/api/products/:id` | Toggle status aktif/nonaktif | Admin |
| GET | `/api/products/import/template` | Download template Excel | Admin |
| POST | `/api/products/import` | Import produk dari file | Admin |

### Transactions
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| POST | `/api/transactions` | Proses checkout | Kasir |
| GET | `/api/transactions` | Riwayat transaksi | Admin |
| GET | `/api/transactions/:id` | Detail transaksi | Semua |

### Dashboard & Admin
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/dashboard` | Data statistik | Admin |
| POST | `/api/admin/reset-database` | Reset semua data | Admin |

---

## ⚙️ Build untuk Production

### Backend
```bash
cd backend

# Set environment production
export DEBUG=False
export DATABASE_URL=postgresql://user:pass@host:5432/sikasir

# Collect static files
python manage.py collectstatic --noinput

# Jalankan dengan Gunicorn
gunicorn app.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Frontend
```bash
cd frontend

# Build untuk production
npm run build
# Output: folder dist/

# Preview hasil build
npm run preview
```

---

## 🐛 Troubleshooting

<details>
<summary><b>❓ Backend tidak bisa start — ModuleNotFoundError</b></summary>

```bash
# Pastikan virtual environment aktif
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Install ulang dependencies
pip install -r requirements.txt
```
</details>

<details>
<summary><b>❓ Frontend tidak bisa connect ke backend (CORS Error)</b></summary>

```python
# backend/settings.py — pastikan CORS sudah dikonfigurasi
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```
</details>

<details>
<summary><b>❓ Import Excel gagal — "openpyxl not found"</b></summary>

```bash
cd backend
pip install openpyxl pandas
```
</details>

<details>
<summary><b>❓ Halaman dashboard/history blank putih</b></summary>

```
1. Buka DevTools (F12) → tab Console
2. Cek error merah yang muncul
3. Buka tab Network → pastikan API call return 200
4. Coba hard refresh: Ctrl+Shift+R
```
</details>

<details>
<summary><b>❓ Login berhasil tapi langsung logout sendiri</b></summary>

```
Periksa VITE_API_URL di file .env frontend
Pastikan URL mengarah ke backend yang benar
Contoh: VITE_API_URL=http://localhost:8000/api
```
</details>

---

## 🤝 Kontribusi

Kontribusi sangat terbuka! Ikuti langkah berikut:

```bash
# 1. Fork repository ini

# 2. Buat branch baru
git checkout -b feature/nama-fitur-kamu

# 3. Commit perubahan
git commit -m "feat: tambahkan fitur xyz"

# 4. Push ke branch
git push origin feature/nama-fitur-kamu

# 5. Buat Pull Request
```

### Konvensi Commit Message

| Prefix | Penggunaan |
|--------|------------|
| `feat:` | Fitur baru |
| `fix:` | Bug fix |
| `refactor:` | Refactor kode |
| `docs:` | Update dokumentasi |
| `style:` | Perubahan styling/CSS |
| `chore:` | Update dependencies, config |

---

## 📄 License

```
MIT License — bebas digunakan, dimodifikasi, dan didistribusikan.
Lihat file LICENSE untuk detail lengkap.
```

---

<div align="center">

**Dibuat dengan ❤️ oleh Tim SIKASIR**

⭐ Kalau project ini membantu, jangan lupa kasih star di GitHub!

</div>