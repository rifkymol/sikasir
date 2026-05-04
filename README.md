<div align="center">

# SIKASIR
### Modern Point of Sale Application

![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

Aplikasi POS modern yang ringan, cepat, dan mudah digunakan.
Dibangun dengan FastAPI + SQLModel di backend dan React + Vite di frontend.

</div>

---

## Fitur Utama

- POS dan checkout real-time
- Manajemen inventory (CRUD + toggle aktif/nonaktif + hard delete)
- Dashboard ringkasan transaksi harian
- Riwayat transaksi + receipt
- Import produk via .xlsx / .csv dengan preview validasi
- Reset database (admin only) dengan triple confirmation
- Error boundary untuk mencegah white blank screen
- Format Rupiah konsisten di input/output

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React, Vite, React Router, TanStack Query, Axios |
| UI | Tailwind CSS, SweetAlert2, Lucide Icons |
| Backend | FastAPI, SQLModel, Pydantic |
| Database | SQLite |
| Import/Export | pandas, openpyxl |
| Auth | Bearer token sederhana berbasis role (admin/cashier) |

---

## Struktur Project

```text
sikasir/
├── backend/
│   ├── app/
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routers/
│   │      ├── admin.py
│   │      ├── product.py
│   │      └── transaction.py
│   ├── requirements.txt
│   └── sikasir.db
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── package.json
```

---

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/rifkymol/sikasir.git
cd sikasir
```

### 2. Setup Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

Backend akan berjalan di:
- http://127.0.0.1:8080
- Swagger docs: http://127.0.0.1:8080/docs

### 3. Setup Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend akan berjalan di:
- http://127.0.0.1:5173

### 4. Environment Variables (Opsional)

Backend token role default:
- admin: `sikasir-admin-123`
- cashier: `sikasir-cashier-123`

Bisa diubah dengan environment variable:

```env
SIKASIR_ADMIN_TOKEN=your-admin-token
SIKASIR_CASHIER_TOKEN=your-cashier-token
```

Frontend opsional:

```env
VITE_API_URL=http://127.0.0.1:8080/api
```

---

## Cara Pakai Singkat

### A. Login Role (via Settings)

Saat ini autentikasi menggunakan bearer token.

1. Buka menu Settings (ikon shield)
2. Masukkan token admin atau cashier
3. Klik Validasi Token

### B. Import Produk (Excel/CSV)

1. Buka menu Inventory
2. Klik Import Produk
3. Klik Download Template
4. Isi file template lalu upload (.xlsx/.csv)
5. Klik Upload & Preview
6. Cek baris valid dan error
7. Klik Import X Produk

Validasi import:
- Wajib: SKU, Nama Produk, Harga, Stok
- Harga harus angka > 0
- Stok harus angka >= 0
- SKU duplikat database/file ditolak
- Format file selain .xlsx/.csv ditolak

### C. Reset Database (Admin Only)

1. Buka Settings
2. Masuk ke Zona Berbahaya
3. Klik Reset Database
4. Triple confirmation:
   - Konfirmasi warning
   - Ketik RESET
   - Konfirmasi final

Data yang dihapus:
- products
- transactions
- transaction_items

Data yang dipertahankan:
- data auth/token role
- reset logs

---

## API Endpoints

### Health
- `GET /api/health`

### Products
- `GET /api/products/`
- `GET /api/products/{product_id}`
- `POST /api/products/`
- `PUT /api/products/{product_id}`
- `PATCH /api/products/{product_id}/toggle`
- `DELETE /api/products/{product_id}`
- `GET /api/products/import/template` (admin)
- `POST /api/products/import` (admin)

### Transactions
- `POST /api/transactions/checkout`
- `GET /api/transactions/`
- `GET /api/transactions/{transaction_id}`

### Admin
- `GET /api/admin/session`
- `POST /api/admin/reset-database`
- `GET /api/admin/reset-logs`

---

## Screenshot

Tambahkan screenshot ke folder `screenshots/` lalu update README jika perlu:

```text
screenshots/
├── dashboard.png
├── pos.png
├── inventory.png
├── import.png
├── checkout.png
└── history.png
```

---

## Build Production

Frontend:

```bash
cd frontend
npm run build
npm run preview
```

Backend (contoh):

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

---

## Troubleshooting

### Backend gagal start

```bash
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend gagal konek backend

Pastikan `VITE_API_URL` benar, atau gunakan default proxy path `/api` jika sudah diset di environment lokal.

### Import Excel gagal

Pastikan dependency terinstall:

```bash
cd backend
pip install openpyxl pandas
```

---

## License

MIT License
