import { useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { Upload, Download, FileSpreadsheet, X } from 'lucide-react'

import { productsApi } from '../api/client'
import { Toast } from '../lib/notifications'
import { formatRupiah } from '../utils/currency'

const allowedMimeTypes = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/csv',
])

const isAllowedFile = (file) => {
  if (!file) {
    return false
  }

  const extensionOk = /\.(xlsx|csv)$/i.test(file.name || '')
  const mimeOk = !file.type || allowedMimeTypes.has(file.type)
  return extensionOk && mimeOk
}

export default function ImportProductModal({ onClose, onSuccess }) {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleDownloadTemplate = async () => {
    try {
      const response = await productsApi.downloadImportTemplate()
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'template_import_produk.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      Toast.fire({ icon: 'success', title: 'Template berhasil didownload' })
    } catch {
      // handled by interceptor
    }
  }

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) {
      return
    }

    if (!isAllowedFile(selectedFile)) {
      Swal.fire({
        icon: 'error',
        title: 'Format Tidak Didukung',
        text: 'Gunakan file .xlsx atau .csv',
      })
      return
    }

    setFile(selectedFile)
    setPreview(null)
  }

  const handlePreview = async () => {
    if (!file) {
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mode', 'preview')

      const response = await productsApi.importProducts(formData)
      setPreview(response.data)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!preview || !file) {
      return
    }

    const result = await Swal.fire({
      icon: 'question',
      title: 'Konfirmasi Import',
      html: `
        <p>Kamu akan mengimport <strong>${preview.valid_rows}</strong> produk ke database.</p>
        ${preview.error_rows?.length > 0
          ? `<p style="color:#d97706; font-size:13px; margin-top:8px;">${preview.error_rows.length} baris akan dilewati karena error.</p>`
          : ''}
      `,
      showCancelButton: true,
      confirmButtonText: `Import ${preview.valid_rows} Produk`,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
    })

    if (!result.isConfirmed) {
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mode', 'import')
      const response = await productsApi.importProducts(formData)

      await Swal.fire({
        icon: 'success',
        title: 'Import Berhasil',
        html: `
          <p><strong>${response.data.imported || 0}</strong> produk berhasil ditambahkan.</p>
          ${(response.data.skipped || 0) > 0
            ? `<p style="color:#d97706; font-size:13px;">${response.data.skipped} baris dilewati.</p>`
            : ''}
        `,
        confirmButtonColor: '#16a34a',
      })

      onSuccess?.()
      onClose?.()
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const droppedFile = event.dataTransfer?.files?.[0]
    handleFileChange(droppedFile)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl border shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FileSpreadsheet size={20} /> Import Produk</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-green-800">Belum punya template?</p>
              <p className="text-sm text-green-700">Download template agar format kolom selalu sesuai.</p>
            </div>
            <button onClick={handleDownloadTemplate} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold inline-flex items-center gap-2">
              <Download size={16} /> Download Template
            </button>
          </div>

          {!preview && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
              />

              {file ? (
                <>
                  <p className="text-3xl mb-2">✅</p>
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">Klik untuk ganti file</p>
                </>
              ) : (
                <>
                  <Upload size={32} className="mx-auto mb-3 text-gray-500" />
                  <p className="font-semibold text-gray-900">Drag & drop file di sini</p>
                  <p className="text-sm text-gray-500">atau klik untuk pilih file (.xlsx / .csv)</p>
                </>
              )}
            </div>
          )}

          {preview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">✅ {preview.valid_rows} baris valid</span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">❌ {preview.error_rows?.length || 0} baris error</span>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b sticky top-0">
                      <tr>
                        <th className="px-3 py-2">SKU</th>
                        <th className="px-3 py-2">Nama Produk</th>
                        <th className="px-3 py-2 text-right">Harga</th>
                        <th className="px-3 py-2 text-center">Stok</th>
                        <th className="px-3 py-2">Kategori</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(preview.data || []).map((item, index) => (
                        <tr key={`${item.sku}-${index}`} className="border-b last:border-0">
                          <td className="px-3 py-2 font-mono">{item.sku}</td>
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-3 py-2 text-right text-blue-700 font-semibold">{formatRupiah(item.price)}</td>
                          <td className="px-3 py-2 text-center">{item.stock}</td>
                          <td className="px-3 py-2">{item.category || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {(preview.error_rows || []).length > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                  <p className="font-semibold text-amber-800 mb-2">⚠️ Baris yang akan dilewati</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {preview.error_rows.map((err, index) => (
                      <div key={`${err.row}-${index}`} className="text-sm bg-white border border-amber-200 rounded-lg p-2">
                        <p className="font-semibold text-gray-900">Baris {err.row} • {err.nama || err.sku || '-'}</p>
                        <p className="text-amber-700">{(err.errors || []).join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100">Batalkan</button>
          {!preview ? (
            <button
              onClick={handlePreview}
              disabled={!file || loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
            >
              {loading ? 'Membaca File...' : 'Upload & Preview'}
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={loading || Number(preview.valid_rows || 0) === 0}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50"
            >
              {loading ? 'Mengimport...' : `Import ${preview.valid_rows} Produk`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
