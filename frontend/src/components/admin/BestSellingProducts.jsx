import React from 'react'
import { Flame } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

const BestSellingProducts = ({ products = [] }) => {
  return (
    <div className="bg-white rounded-2xl border border-earth-100 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-earth-800 text-base flex items-center gap-2">
          <Flame size={18} className="text-mustard-600" /> Best Selling Food Items
        </h3>
      </div>

      <div className="space-y-3">
        {products && products.length > 0 ? (
          products.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-earth-50 border border-earth-100 hover:bg-earth-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-mustard-500 text-earth-900 text-xs font-bold flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="font-semibold text-earth-900 text-sm">{item.product__name || item.name}</h4>
                  <p className="text-xs text-earth-500">{item.total_quantity || item.orders_count || 0} orders</p>
                </div>
              </div>
              <span className="font-bold text-earth-800 text-sm">{formatCurrency(item.revenue || item.price || 0)}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-center py-6 text-earth-400">No product sales statistics available</p>
        )}
      </div>
    </div>
  )
}

export default BestSellingProducts
