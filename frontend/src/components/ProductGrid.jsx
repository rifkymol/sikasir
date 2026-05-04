import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, AlertCircle, Package } from 'lucide-react';
import { productsAPI } from '../api/client';

export default function ProductGrid({ onAddToCart, cartItems = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const { data: products = [], isLoading, isError, error } = useQuery({
        queryKey: ['products', searchQuery, selectedCategory],
        queryFn: () => 
            productsAPI
                .getProducts({ search: searchQuery || undefined, category: selectedCategory || undefined })
                .then(res => res.data),
        placeholderData: (prev) => prev,
    });

    const categories = ['', ...new Set(products.map(p => p.category).filter(Boolean))];

    const cartQuantityMap = cartItems.reduce((map, item) => {
      map[item.product.id] = (map[item.product.id] || 0) + item.quantity;
        return map;
    }, {});

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                <AlertCircle size={40} className="text-red-400" />
                <p className="font-medium">Could not load products</p>
                <p className="text-sm text-gray-400">{error?.message}</p>
                <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                Offline mode active — cart still works!
                </p>
            </div>
        )
    }

    return (
    <div className="flex flex-col h-full">
      {/* ── Search & Filter Bar ── */}
      <div className="p-4 bg-white border-b flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat || 'All Categories'}
            </option>
          ))}
        </select>
      </div>

      {/* ── Product Grid ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          // Skeleton loader — better UX than a spinner
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-44 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Package size={48} />
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={cartQuantityMap[product.id] || 0}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product, cartQuantity, onAddToCart }) {
    const isOutOfStock = product.stock - cartQuantity <= 0;
    const isLowStock = product.stock - cartQuantity > 0 && product.stock - cartQuantity <= 5;

    return (
        <button
            onClick={() => !isOutOfStock && onAddToCart(product)}
            disabled={isOutOfStock}
            className={`
            group relative bg-white rounded-xl p-4 text-left shadow-sm border-2 transition-all
                ${isOutOfStock ? 'opacity-50 cursor-not-allowed border-transparent' : 'hover:border-blue-400 hover:shadow-md cursor-pointer border-transparent active:scale-95'
                }
            `}
        >
            {cartQuantity > 0 && (
                <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                    {cartQuantity}
                </span>
            )}

            <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="object-cover h-full" />
                ) : (
                    <div className="text-gray-400">
                        <Package size={32} />
                    </div>
                )}
            </div>

            <p className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</p>
            <p className="text-blue-600 font-bold mt-1">
                Rp {product.price.toLocaleString('id-ID')}
            </p>

            <div className="mt-2 flex items-center gap-1">
                <div
                    className={`w-2 h-2 rounded-full ${
                        isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    />
                <span className="text-xs text-gray-500">
                    {isOutOfStock ? 'Out of stock' : `${product.stock} left`}
                </span>
            </div>

            {!isOutOfStock && (
                <div className="absolute bottom-3 right-3 bg-blue-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={12}/>
                </div>
            )}
        </button>
    )
}