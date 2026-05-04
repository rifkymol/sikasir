import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../api/client'
import { Plus, Edit, Trash2 } from 'lucide-react'
import ProductForm from '../components/ProductForm'
import { Toast, confirmAction } from '../lib/notifications'
import { formatRupiah } from '../utils/currency'
import Swal from 'sweetalert2'

export default function InventoryPage() {
  const qc = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isFormOpen, setFormOpen] = useState(false)

  const { data: res, isLoading } = useQuery({ 
    queryKey: ['products', 'admin'], 
    queryFn: () => productsApi.getAll({ show_inactive: true }) 
  })
  
  const products = res?.data || []

  const deleteMut = useMutation({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] })
      Toast.fire({ icon: 'success', title: 'Produk berhasil dihapus' })
    }
  })

  const toggleMut = useMutation({
    mutationFn: (id) => productsApi.toggleStatus(id),
    onSuccess: async (result) => {
      await qc.invalidateQueries({ queryKey: ['products'] })
      Toast.fire({ icon: 'success', title: result?.data?.message || 'Status berhasil diubah' })
    }
  })

  const openEdit = (prod) => { setSelectedProduct(prod); setFormOpen(true) }
  const openCreate = () => { setSelectedProduct(null); setFormOpen(true) }

  const handleDelete = async (product) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Produk?',
      html: `Produk <strong>${product.name}</strong> akan dihapus permanen.<br/>Data tidak bisa dikembalikan.`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
    })
    if (result.isConfirmed) {
      deleteMut.mutate(product.id)
    }
  }

  const handleToggleStatus = async (product) => {
    const newStatus = !product.is_active
    const label = newStatus ? 'mengaktifkan' : 'menonaktifkan'
    const result = await Swal.fire({
      icon: 'question',
      title: `${newStatus ? 'Aktifkan' : 'Nonaktifkan'} Produk?`,
      text: `Kamu akan ${label} produk "${product.name}"`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: newStatus ? '#16a34a' : '#d97706',
      cancelButtonColor: '#6b7280',
    })
    if (result.isConfirmed) {
      toggleMut.mutate(product.id)
    }
  }

  if (isLoading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex gap-2 items-center transition-colors">
          <Plus size={16}/> Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">SKU</th>
              <th className="p-4">Nama</th>
              <th className="p-4 text-right">Harga</th>
              <th className="p-4 text-center">Stok</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Belum ada produk</td></tr>
            )}
            {products.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-mono text-sm text-gray-500">{p.sku}</td>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-right font-medium text-blue-700">{formatRupiah(p.price)}</td>
                <td className="p-4 text-center">
                  {p.stock === 0
                    ? <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">0 ⚠️</span>
                    : <span className="font-medium">{p.stock}</span>
                  }
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleToggleStatus(p)}
                    disabled={toggleMut.isPending}
                    title="Klik untuk ubah status"
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all hover:opacity-80 disabled:opacity-50
                      ${p.is_active ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                  >
                    {p.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => openEdit(p)} title="Edit" className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(p)} title="Hapus" disabled={deleteMut.isPending} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded disabled:opacity-50 transition-colors"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && <ProductForm product={selectedProduct} onClose={() => setFormOpen(false)} />}
    </div>
  )
}