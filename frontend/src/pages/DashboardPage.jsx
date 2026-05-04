import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Receipt, Wallet } from 'lucide-react'
import { txApi } from '../api/client'
import { formatRupiah } from '../utils/currency'

function StatCard({ icon: Icon, label, value }) {
    return (
        <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={18} />
                </div>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    )
}

export default function DashboardPage() {
    const { data: response, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['dashboard-transactions'],
        queryFn: () => txApi.getAll({ limit: 1000 }),
    })

    const transactions = Array.isArray(response?.data) ? response.data : []

    const summary = useMemo(() => {
        const today = new Date().toDateString()
        const todayTransactions = transactions.filter((tx) => tx?.created_at && new Date(tx.created_at).toDateString() === today)
        const revenue = todayTransactions.reduce((sum, tx) => sum + Number(tx?.total_amount || 0), 0)
        const productMap = new Map()

        todayTransactions.forEach((tx) => {
            ;(tx?.order_items || []).forEach((item) => {
                const current = productMap.get(item.product?.name || 'Produk tidak diketahui') || 0
                productMap.set(item.product?.name || 'Produk tidak diketahui', current + Number(item?.quantity || 0))
            })
        })

        const topProduct = [...productMap.entries()].sort((a, b) => b[1] - a[1])[0]

        return {
            revenue,
            transactionCount: todayTransactions.length,
            topProduct: topProduct ? `${topProduct[0]} (${topProduct[1]})` : '-',
        }
    }, [transactions])

    if (isLoading) {
        return <div className="p-8">Memuat dashboard...</div>
    }

    if (isError) {
        return (
            <div className="p-8">
                <div className="bg-white border rounded-xl p-6 max-w-xl">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error?.message || 'Terjadi kesalahan saat memuat data.'}</p>
                    <button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        Coba Lagi
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 h-full overflow-y-auto bg-gray-50">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-2">Ringkasan penjualan hari ini dari data transaksi aktual.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mb-8">
                <StatCard icon={Wallet} label="Total Penjualan Hari Ini" value={formatRupiah(summary.revenue)} />
                <StatCard icon={Receipt} label="Jumlah Transaksi Hari Ini" value={summary.transactionCount} />
                <StatCard icon={BarChart3} label="Produk Terlaris" value={summary.topProduct} />
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="font-semibold text-gray-900">Transaksi Terbaru</h2>
                </div>
                <div className="divide-y">
                    {transactions.slice(0, 8).map((tx) => (
                        <div key={tx?.id || tx?.transaction_code} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-gray-900">{tx?.transaction_code || '-'}</p>
                                <p className="text-sm text-gray-500">{tx?.created_at ? new Date(tx.created_at).toLocaleString('id-ID') : '-'}</p>
                            </div>
                            <p className="font-bold text-blue-600">{formatRupiah(tx?.total_amount || 0)}</p>
                        </div>
                    ))}
                    {transactions.length === 0 && <div className="px-6 py-10 text-center text-gray-500">Belum ada transaksi.</div>}
                </div>
            </div>
        </div>
    )
}