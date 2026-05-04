import { useOfflineCart } from '../hooks/useOfflineCart'
import ProductGrid from '../components/ProductGrid'
import CartSidebar from '../components/CartSidebar'

/**
 * POSPage — the main sales screen.
 * Combines ProductGrid (left) and CartSidebar (right).
 * All cart state lives in the useOfflineCart hook (covered in Section 7).
 */
export default function POSPage() {
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useOfflineCart()

  const handleCheckoutSuccess = (transaction) => {
    return transaction
  }

  return (
    <div className="flex h-full">
      {/* Left: Product browsing area */}
      <div className="flex-1 overflow-hidden">
        <ProductGrid
          onAddToCart={addToCart}
          cartItems={cartItems}
        />
      </div>

      {/* Right: Cart sidebar */}
      <CartSidebar
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    </div>
  )
}