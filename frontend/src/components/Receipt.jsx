import { useRef } from 'react'
import { Printer, X } from 'lucide-react'
import { formatRupiah } from '../utils/currency'

export default function Receipt({ transaction, onClose }) {
  const receiptRef = useRef()
  const items = transaction?.order_items || []

  const printReceipt = () => {
    const content = receiptRef.current.innerHTML
    const printWindow = window.open('', '', 'width=400,height=600')
    printWindow.document.write(`
      <html><head><title>Struk</title>
      <style>
        body { font-family: monospace; padding: 20px; font-size: 14px; width: 300px; margin: auto; }
        .center { text-align: center; }
        .flex { display: flex; justify-content: space-between; }
        hr { border-top: 1px dashed #000; my: 10px; }
      </style></head>
      <body>${content}</body></html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl overflow-hidden max-w-sm w-full">
        <div ref={receiptRef} className="p-6 bg-white text-black">
          <h2 className="center text-xl font-bold">POS SYSTEM</h2>
          <p className="center text-sm mb-4">{transaction?.transaction_code || '-'}</p>
          <hr />
          {items.map((item, index) => (
            <div key={item?.id || item?.product?.id || index} className="flex flex-col text-sm py-1">
              <span>{item?.product?.name || 'Produk'}</span>
              <div className="flex justify-between">
                <span>{Number(item?.quantity || 0)} x {formatRupiah(item?.unit_price || 0)}</span>
                <span>{formatRupiah(item?.subtotal || 0)}</span>
              </div>
            </div>
          ))}
          <hr />
          <div className="flex justify-between font-bold"><span>Total</span><span>{formatRupiah(transaction?.total_amount || 0)}</span></div>
          <div className="flex justify-between"><span>Bayar</span><span>{formatRupiah(transaction?.amount_paid || 0)}</span></div>
          <div className="flex justify-between"><span>Kembali</span><span>{formatRupiah(transaction?.change_amount || 0)}</span></div>
        </div>
        <div className="flex border-t">
          <button onClick={onClose} className="flex-1 py-3 text-red-500 font-bold flex items-center justify-center gap-2 border-r"><X size={16}/> Tutup</button>
          <button onClick={printReceipt} className="flex-1 py-3 text-blue-600 font-bold flex items-center justify-center gap-2"><Printer size={16}/> Print</button>
        </div>
      </div>
    </div>
  )
}