import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { txApi } from '../api/client'
import { FileText } from 'lucide-react'
import Receipt from '../components/Receipt'
import { formatRupiah } from '../utils/currency'

export default function HistoryPage() {
  const [selectedTx, setSelectedTx] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data: res, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['transactions', startDate, endDate, page],
    queryFn: () => txApi.getAll({
      skip: (page - 1) * pageSize,
      limit: pageSize,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    })
  })
  const transactions = Array.isArray(res?.data) ? res.data : []

  if (isLoading) return <div className="p-8">Loading history...</div>

  if (isError) {
    return (
      <div className="p-8">
        <div className="bg-white border rounded-xl p-6 max-w-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Riwayat</h2>
          <p className="text-gray-600 mb-4">{error?.message || 'Terjadi kesalahan saat memuat transaksi.'}</p>
          <button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        <div className="flex gap-3 flex-wrap">
          <input type="date" value={startDate} onChange={(event) => { setPage(1); setStartDate(event.target.value) }} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={endDate} onChange={(event) => { setPage(1); setEndDate(event.target.value) }} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Kode Transaksi</th>
              <th className="p-4">Item</th>
              <th className="p-4">Total</th>
              <th className="p-4 text-center">Struk</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada transaksi.</td>
              </tr>
            )}
            {transactions.map(tx => (
              <tr key={tx?.id || tx?.transaction_code} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 text-sm">{tx?.created_at ? new Date(tx.created_at).toLocaleString('id-ID') : '-'}</td>
                <td className="p-4 font-mono font-bold text-sm">{tx?.transaction_code || '-'}</td>
                <td className="p-4 text-sm">{(tx?.order_items || []).length} Macam Barang</td>
                <td className="p-4 font-bold text-green-600">{formatRupiah(tx?.total_amount || 0)}</td>
                <td className="p-4 text-center">
                  <button onClick={() => setSelectedTx(tx)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl inline-flex">
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3 mt-4">
        <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50">Sebelumnya</button>
        <span className="text-sm text-gray-500">Halaman {page}</span>
        <button onClick={() => setPage((current) => current + 1)} disabled={transactions.length < pageSize} className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50">Berikutnya</button>
      </div>

      {selectedTx && <Receipt transaction={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  )
}