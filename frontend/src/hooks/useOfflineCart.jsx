import { useState, useEffect } from 'react'

export function useOfflineCart() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('pos_cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('pos_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id)
      if (exists) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (id, qty) => setCart(prev => qty <= 0 ? prev.filter(i => i.product.id !== id) : prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i))
  const clearCart = () => setCart([])
  const removeFromCart = (id) => updateQty(id, 0)

  return {
    cart,
    cartItems: cart,
    addToCart,
    updateQty,
    updateQuantity: updateQty,
    removeFromCart,
    clearCart,
  }
}