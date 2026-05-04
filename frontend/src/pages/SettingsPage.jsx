import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { adminApi } from '../api/client'
import { clearAuthSession, getAuthMeta, getAuthToken, setAuthMeta, setAuthToken } from '../utils/authSession'
import { Toast } from '../lib/notifications'

export default function SettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tokenInput, setTokenInput] = useState(getAuthToken())
  const [sessionMeta, setSessionMeta] = useState(getAuthMeta())

  const { refetch: refetchSession, isFetching: isCheckingSession } = useQuery({
    queryKey: ['admin-session'],
    queryFn: () => adminApi.getSession(),
    enabled: false,
  })

  const { data: logsResponse, refetch: refetchLogs, isFetching: isLoadingLogs } = useQuery({
    queryKey: ['reset-logs'],
    queryFn: () => adminApi.getResetLogs({ limit: 10 }),
    enabled: sessionMeta.role === 'admin',
  })

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      return
    }

    refetchSession().then((result) => {
      const profile = result?.data?.data
      if (profile?.role) {
        setSessionMeta(profile)
        setAuthMeta(profile)
      }
    }).catch(() => {
      clearAuthSession()
      setSessionMeta({ username: 'guest', role: 'guest' })
      setTokenInput('')
    })
  }, [refetchSession])

  const resetMutation = useMutation({
    mutationFn: () => adminApi.resetDatabase({ confirmation: 'RESET_CONFIRMED' }),
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-transactions'] }),
      ])

      const deleted = response?.data?.deleted || {}

      await Swal.fire({
        icon: 'success',
        title: 'Reset Berhasil!',
        html: `
          <p>Database telah dikosongkan.</p>
          <small style="color:#6b7280;">
            ${deleted.products || 0} produk & ${deleted.transactions || 0} transaksi dihapus.<br/>
            ${deleted.transaction_items || 0} item transaksi dibersihkan.
          </small>
        `,
        confirmButtonText: 'Kembali ke Dashboard',
        confirmButtonColor: '#16a34a',
      })

      await refetchLogs()
      navigate('/dashboard')
    },
  })

  const isAdmin = sessionMeta.role === 'admin'

  const rolePillClass = useMemo(() => {
    if (sessionMeta.role === 'admin') {
      return 'bg-red-100 text-red-700 border-red-300'
    }
    if (sessionMeta.role === 'cashier') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    }
    return 'bg-gray-100 text-gray-600 border-gray-300'
  }, [sessionMeta.role])

  const handleValidateToken = async () => {
    if (!tokenInput.trim()) {
      Toast.fire({ icon: 'warning', title: 'Token wajib diisi' })
      return
    }

    setAuthToken(tokenInput.trim())

    try {
      const result = await refetchSession()
      const profile = result?.data?.data
      if (profile?.role) {
        setSessionMeta(profile)
        setAuthMeta(profile)
        Toast.fire({ icon: 'success', title: `Login sebagai ${profile.role}` })
      }
    } catch {
      clearAuthSession()
      setSessionMeta({ username: 'guest', role: 'guest' })
      setTokenInput('')
    }
  }

  const handleLogout = () => {
    clearAuthSession()
    setSessionMeta({ username: 'guest', role: 'guest' })
    setTokenInput('')
    Toast.fire({ icon: 'success', title: 'Sesi dibersihkan' })
  }

  const handleResetDatabase = async () => {
    const step1 = await Swal.fire({
      icon: 'warning',
      title: 'Reset Database',
      html: `
        <p>Kamu akan menghapus <strong>semua data</strong> berikut secara permanen:</p>
        <ul style="text-align:left; margin-top:12px; color:#dc2626;">
          <li>Semua data produk & inventory</li>
          <li>Semua riwayat transaksi</li>
        </ul>
        <p style="margin-top:12px; color:#6b7280; font-size:13px;">
          Data user/admin dan log reset tidak akan terpengaruh.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lanjutkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d97706',
      cancelButtonColor: '#6b7280',
    })

    if (!step1.isConfirmed) {
      return
    }

    const step2 = await Swal.fire({
      icon: 'question',
      title: 'Konfirmasi Tindakan',
      html: '<p>Ketik <strong>RESET</strong> pada kolom di bawah untuk melanjutkan:</p>',
      input: 'text',
      inputPlaceholder: 'Ketik RESET di sini...',
      inputAttributes: { autocomplete: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Konfirmasi',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      preConfirm: (value) => {
        if (value !== 'RESET') {
          Swal.showValidationMessage('Ketik persis: RESET (huruf kapital)')
          return false
        }
        return true
      },
    })

    if (!step2.isConfirmed) {
      return
    }

    const step3 = await Swal.fire({
      icon: 'error',
      title: 'Kesempatan Terakhir',
      text: 'Semua data akan dihapus permanen dan tidak bisa dikembalikan. Yakin?',
      showCancelButton: true,
      confirmButtonText: 'Ya, Reset Sekarang',
      cancelButtonText: 'Tidak, Batalkan',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#16a34a',
      reverseButtons: true,
    })

    if (!step3.isConfirmed) {
      return
    }

    Swal.fire({
      title: 'Mereset Database...',
      text: 'Mohon tunggu, jangan tutup halaman ini.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    resetMutation.mutate()
  }

  const logs = logsResponse?.data || []

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-500 mt-2">Kelola sesi admin dan aksi sensitif sistem.</p>
        </div>

        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Autentikasi Admin</h2>
          <p className="text-sm text-gray-500 mb-4">Masukkan bearer token untuk membuka fitur admin.</p>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <input
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              placeholder="Masukkan token"
              className="flex-1 min-w-[260px] border rounded-lg px-3 py-2"
            />
            <button
              onClick={handleValidateToken}
              disabled={isCheckingSession}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isCheckingSession ? 'Memvalidasi...' : 'Validasi Token'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
            >
              Logout
            </button>
          </div>

          <div className={`inline-flex px-3 py-1 rounded-full border text-sm font-semibold capitalize ${rolePillClass}`}>
            Sesi: {sessionMeta.username} ({sessionMeta.role})
          </div>
        </section>

        <section className="border border-red-300 rounded-2xl p-6 bg-red-50">
          <div className="mb-4">
            <h3 className="text-red-700 font-bold text-lg">Zona Berbahaya</h3>
            <p className="text-red-900/80 text-sm mt-1">Tindakan di bawah ini permanen dan tidak bisa dibatalkan.</p>
          </div>

          <div className="bg-white border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 className="font-semibold text-gray-900">Reset Database</h4>
              <p className="text-sm text-gray-600">Hapus semua produk dan riwayat transaksi. Data user/admin serta log reset tetap aman.</p>
            </div>

            {isAdmin ? (
              <button
                onClick={handleResetDatabase}
                disabled={resetMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap disabled:opacity-50"
              >
                {resetMutation.isPending ? 'Mereset...' : 'Reset Database'}
              </button>
            ) : (
              <span className="text-sm font-semibold text-red-700 bg-red-100 border border-red-200 px-3 py-2 rounded-lg">
                Hanya admin yang dapat mengakses aksi ini
              </span>
            )}
          </div>
        </section>

        {isAdmin && (
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Log Reset Terakhir</h2>
              <button onClick={() => refetchLogs()} className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-sm">
                Muat Ulang
              </button>
            </div>

            {isLoadingLogs && <p className="text-sm text-gray-500">Memuat log...</p>}

            {!isLoadingLogs && logs.length === 0 && (
              <p className="text-sm text-gray-500">Belum ada log reset.</p>
            )}

            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="font-semibold text-gray-900">{log.performed_by} ({log.performed_role})</p>
                    <p className="text-gray-500">{new Date(log.performed_at).toLocaleString('id-ID')}</p>
                  </div>
                  <p className="text-gray-600 mt-1">
                    Dihapus: {log.deleted_counts?.products || 0} produk, {log.deleted_counts?.transactions || 0} transaksi,
                    {' '}{log.deleted_counts?.transaction_items || 0} item transaksi.
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Catatan Keamanan</h2>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>Endpoint reset dilindungi autentikasi bearer token.</li>
            <li>Role selain admin otomatis ditolak dengan HTTP 403.</li>
            <li>Reset menggunakan transaksi atomik untuk mencegah hapus sebagian data.</li>
            <li>Setiap reset tercatat beserta pelaku dan waktu eksekusi.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
