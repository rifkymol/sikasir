import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Plus, Minus, ShoppingBag, Printer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { transactionsApi } from '../api/client'
import Receipt from './Receipt'
import { Toast, closeAlert, confirmAction, showLoading, showWarning } from '../lib/notifications'
import { formatInputRupiah, formatRupiah, parseRupiah } from '../utils/currency'

/**
 * CartSidebar — the right-side panel showing items in the cart.
 *
 * Props:
 *  - cartItems: array of { product, quantity }
 *  - onUpdateQuantity: function(productId, newQuantity)
 *  - onRemoveItem: function(productId)
 *  - onClearCart: function()
 *  - onCheckoutSuccess: function(transaction)
 */
export default function CartSidebar({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
}) {
  const [amountPaid, setAmountPaid] = useState(0)
  const [amountDisplay, setAmountDisplay] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [lastTransaction, setLastTransaction] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const change = amountPaid - total

  const handleAmountChange = (e) => {
    const parsed = parseRupiah(e.target.value)
    setAmountPaid(parsed)
    setAmountDisplay(formatInputRupiah(parsed))
  }

  /**
   * useMutation from TanStack Query.
   * WHY? While useQuery is for reading data, useMutation is for
   * write operations (POST, PUT, DELETE). It gives us isPending,
   * isError states and lets us invalidate cached queries on success.
   */
  const checkoutMutation = useMutation({
    mutationFn: (checkoutData) => transactionsApi.checkout(checkoutData),
    onMutate: () => {
      showLoading('Memproses pembayaran...')
    },

    onSuccess: async (response) => {
      closeAlert()
      const transaction = response.data

      // 🔑 KEY CONCEPT: Invalidating queries
      // After checkout, the product stock has changed on the server.
      // Calling invalidateQueries tells TanStack Query to refetch
      // the products list, ensuring the UI shows updated stock.
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-transactions'] })

      setLastTransaction(transaction)
      onCheckoutSuccess(transaction)
      onClearCart()
      setAmountPaid(0)
      setAmountDisplay('')

      await Swal.fire({
        icon: 'success',
        title: 'Transaksi Berhasil! 🎉',
        html: `
          <p>Total: <strong>${formatRupiah(transaction?.total_amount || total)}</strong></p>
          <p>Kembalian: <strong>${formatRupiah(transaction?.change_amount || 0)}</strong></p>
          <p class="text-xs text-gray-500 mt-2">${transaction?.transaction_code || ''}</p>
        `,
        confirmButtonText: 'Lihat Riwayat',
        timer: 4000,
        timerProgressBar: true,
      })

      navigate('/history')
    },

    onError: () => {
      closeAlert()
    },
  })

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    if (amountPaid < total) {
      showWarning('Nominal kurang', 'Jumlah pembayaran tidak boleh lebih kecil dari total belanja.')
      return
    }

    const confirmed = await confirmAction({
      title: 'Konfirmasi checkout?',
      text: `Total pembayaran ${formatRupiah(total)}`,
      confirmButtonText: 'Ya, Proses',
      confirmButtonColor: '#2563eb',
    })

    if (!confirmed) {
      return
    }

    checkoutMutation.mutate({
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      amount_paid: amountPaid,
      payment_method: paymentMethod,
    })
  }

  const handlePrintReceipt = () => {
    if (!lastTransaction) return
    setShowReceipt(true)
  }

  return (
    <>
      {showReceipt && lastTransaction && (
        <Receipt transaction={lastTransaction} onClose={() => setShowReceipt(false)} />
      )}
      <div className="w-80 bg-white flex flex-col h-full shadow-xl border-l">
      {/* ── Header ── */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <ShoppingBag size={20} className="text-blue-600" />
          Active Cart
        </h2>
        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs text-red-500 hover:text-red-700 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Cart Items ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
            <ShoppingBag size={48} />
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs text-center">Click on a product to add it here</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
            />
          ))
        )}
      </div>

      {/* ── Checkout Panel ── */}
      {cartItems.length > 0 && (
        <div className="p-4 border-t bg-gray-50 space-y-3">
          {/* Order Total */}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-blue-700">{formatRupiah(total)}</span>
          </div>

          {/* Payment Method */}
          <div className="flex gap-2">
            {['cash', 'card', 'qris'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  paymentMethod === method
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border text-gray-600 hover:bg-gray-100'
                }`}
              >
                {method.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Amount Paid Input */}
          <div>
            <label className="text-xs text-gray-500 font-medium">Amount Paid (Rp)</label>
            <div className="mt-1 flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white">
              <span className="px-3 py-2 text-sm text-gray-500 border-r bg-gray-50 rounded-l-lg">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={handleAmountChange}
                placeholder={`Min: ${formatInputRupiah(total)}`}
                className="w-full px-3 py-2 text-sm rounded-r-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Change Display */}
          <div className={`flex justify-between text-sm font-medium rounded-lg px-3 py-2 ${change < 0 ? 'text-red-700 bg-red-50' : 'text-green-700 bg-green-50'}`}>
            <span>Kembalian</span>
            <span>{change < 0 ? `Kurang ${formatRupiah(Math.abs(change))}` : formatRupiah(change)}</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={checkoutMutation.isPending || amountPaid <= 0 || amountPaid < total}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
          >
            {checkoutMutation.isPending ? 'Processing...' : '✅ Checkout'}
          </button>

          {/* Print Receipt Button */}
          {lastTransaction && (
            <button
              onClick={handlePrintReceipt}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-100 py-2 rounded-xl text-sm transition-colors"
            >
              <Printer size={16} />
              Print Last Receipt
            </button>
          )}
        </div>
      )}
    </div>
    </>
  )
}

/** A single item row in the cart. */
function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product, quantity } = item
  const subtotal = product.price * quantity

  const handleRemove = async () => {
    const confirmed = await confirmAction({
      title: 'Hapus item dari cart?',
      text: `${product.name} akan dihapus dari keranjang.`,
      confirmButtonText: 'Ya, Hapus',
    })

    if (confirmed) {
      onRemove(product.id)
    }
  }

  return (
    <div className="bg-white border rounded-xl p-3 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold leading-tight flex-1 mr-2 line-clamp-1">
          {product.name}
        </p>
        <button
          onClick={handleRemove}
          className="text-red-400 hover:text-red-600 flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200"
          >
            <Minus size={12} />
          </button>
          <span className="text-sm font-bold w-6 text-center">{quantity}</span>
          <button
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            disabled={quantity >= product.stock}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-30"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Subtotal */}
        <span className="text-sm font-bold text-blue-700">
          {formatRupiah(subtotal)}
        </span>
      </div>
    </div>
  )
}