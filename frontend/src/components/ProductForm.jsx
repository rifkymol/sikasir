import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../api/client'
import { Toast, showError } from '../lib/notifications'
import { formatInputRupiah, parseRupiah } from '../utils/currency'

export default function ProductForm({ product, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!product
  const [form, setForm] = useState(product || { name: '', price: '', stock: '', sku: '', category: 'General', image_url: '' })
  const [displayPrice, setDisplayPrice] = useState(product?.price ? formatInputRupiah(product.price) : '')

  const errors = {}

  if (!form.name?.trim()) errors.name = 'Nama produk wajib diisi.'
  if (!isEdit && !form.sku?.trim()) errors.sku = 'SKU wajib diisi.'
  if (Number(form.price) <= 0) errors.price = 'Harga harus lebih dari 0.'
  if (Number(form.stock) < 0) errors.stock = 'Stok tidak boleh negatif.'

  const isFormValid = Object.keys(errors).length === 0

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setDisplayPrice(formatInputRupiah(raw))
    setForm({ ...form, price: raw ? parseInt(raw, 10) : '' })
  }

  const getApiErrorMessage = (error) => {
    const payload = error?.response?.data

    if (payload?.detail) return payload.detail
    if (payload?.message && !Array.isArray(payload?.data)) return payload.message

    if (Array.isArray(payload?.data) && payload.data.length > 0) {
      const firstError = payload.data[0]
      const fieldName = Array.isArray(firstError?.loc) ? firstError.loc[firstError.loc.length - 1] : null
      const prefix = fieldName ? `${String(fieldName)}: ` : ''
      return `${prefix}${firstError?.msg || 'Data produk tidak valid.'}`
    }

    return 'Periksa kembali data produk.'
  }

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? productsApi.update(product.id, data) : productsApi.create(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] })
      Toast.fire({ icon: 'success', title: isEdit ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan' })
      onClose()
    },
    onError: (error) => showError('Gagal menyimpan produk', getApiErrorMessage(error))
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFormValid) {
      showError('Form belum valid', 'Lengkapi semua field wajib dan pastikan nilainya benar.')
      return
    }

    mutation.mutate({
      ...form,
      name: form.name.trim(),
      sku: form.sku?.trim(),
      category: form.category?.trim() || 'General',
      image_url: form.image_url?.trim() || null,
      price: Number(form.price),
      stock: Number(form.stock),
    })
  }

  const inputCls = 'border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400'
  const errorCls = 'text-xs text-red-500 -mt-2'
  const labelCls = 'text-sm font-medium text-gray-700'
  const required = <span className="text-red-500 ml-0.5">*</span>

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-96 flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg">{isEdit ? 'Edit' : 'Tambah'} Produk</h2>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Nama Produk {required}</label>
          <input placeholder="Nama Produk" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputCls} />
          {errors.name && <p className={errorCls}>{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>SKU {required}</label>
          <input placeholder="SKU" required disabled={isEdit} value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className={`${inputCls} ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
          {errors.sku && <p className={errorCls}>{errors.sku}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Harga {required}</label>
          <div className="flex items-center border rounded focus-within:ring-2 focus-within:ring-blue-400">
            <span className="px-3 py-2 bg-gray-50 border-r text-gray-500 rounded-l select-none">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              required
              value={displayPrice}
              onChange={handlePriceChange}
              className="flex-1 p-2 rounded-r focus:outline-none"
            />
          </div>
          {errors.price && <p className={errorCls}>{errors.price}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Stok {required}</label>
          <input placeholder="Stok" type="number" min="0" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className={inputCls} />
          {errors.stock && <p className={errorCls}>{errors.stock}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Kategori</label>
          <input placeholder="Kategori" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} className={inputCls} />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>URL Gambar</label>
          <input placeholder="URL Gambar" value={form.image_url || ''} onChange={e => setForm({...form, image_url: e.target.value})} className={inputCls} />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 p-2 rounded transition-colors">Batal</button>
          <button type="submit" disabled={mutation.isPending || !isFormValid} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}