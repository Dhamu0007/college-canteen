import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2, ChevronRight, PackageCheck } from 'lucide-react'
import { formatCurrency, formatDateTime, getOrderStatusColor } from '../../utils/helpers'
import { ORDER_STATUS_LABELS } from '../../utils/constants'

const OrderCard = ({ order }) => {
  const { id, order_number, status, total_amount, items, created_at } = order

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-earth-100 p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-earth-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-earth-900 text-lg">#{order_number}</span>
            <span
              className={`px-3 py-0.5 text-xs font-bold rounded-full border ${getOrderStatusColor(
                status
              )}`}
            >
              {ORDER_STATUS_LABELS[status] || status}
            </span>
          </div>
          <p className="text-xs text-earth-500 mt-1 flex items-center gap-1">
            <Clock size={12} />
            {formatDateTime(created_at)}
          </p>
        </div>

        <div className="text-right">
          <span className="text-sm text-earth-500">Total</span>
          <p className="text-xl font-bold text-mustard-600">{formatCurrency(total_amount)}</p>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="py-3 space-y-1">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-earth-700">
              <span>
                {item.quantity}x {item.product_name || item.product?.name}
              </span>
              <span className="font-medium">{formatCurrency(item.total_price)}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-earth-400">Order items details</p>
        )}
      </div>

      <div className="pt-3 border-t border-earth-100 flex justify-end">
        <Link
          to={`/tracking/${order_number || id}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-mustard-600 hover:text-mustard-700 transition-colors"
        >
          <span>Track Order</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </motion.div>
  )
}

export default OrderCard
