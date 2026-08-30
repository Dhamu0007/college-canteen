import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Trash2 } from 'lucide-react'
import { formatCurrency, getImageUrl } from '../../utils/helpers'
import CategoryAnimatedEmoji from './CategoryAnimatedEmoji'

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { id, product, quantity, total_price, price_per_unit, product_details } = item
  const productName = product_details?.name || product?.name || item.product_name || 'Food Item'
  const rawImage = product_details?.image || product?.image || item.image || null
  const productImage = getImageUrl(rawImage)
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-earth-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-earth-100 flex items-center justify-center text-2xl flex-shrink-0">
          {productImage && !imgError ? (
            <img 
              src={productImage} 
              alt={productName} 
              className="w-full h-full object-cover" 
              onError={() => setImgError(true)}
            />
          ) : (
            <CategoryAnimatedEmoji
              categoryName={product_details?.category_name || item?.category_name || productName}
              size="sm"
            />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-earth-800 text-base">{productName}</h4>
          <p className="text-xs text-earth-500">{formatCurrency(price_per_unit || product_details?.price || product?.price)} each</p>
          <p className="font-bold text-mustard-600 mt-1">{formatCurrency(total_price)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quantity Controller */}
        <div className="flex items-center gap-2 bg-earth-50 p-1.5 rounded-xl border border-earth-200">
          <button
            onClick={() => onUpdateQuantity(id, Math.max(1, quantity - 1))}
            className="p-1 rounded-lg hover:bg-earth-200 text-earth-700 transition-colors"
            disabled={quantity <= 1}
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center font-bold text-earth-800 text-sm">{quantity}</span>
          <button
            onClick={() => onUpdateQuantity(id, quantity + 1)}
            className="p-1 rounded-lg hover:bg-earth-200 text-earth-700 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Delete */}
        <button
          onClick={() => onRemove(id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Remove Item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  )
}

export default CartItem
