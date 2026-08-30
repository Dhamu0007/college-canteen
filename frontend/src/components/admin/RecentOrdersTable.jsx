import React from 'react'
import { formatCurrency, formatTime, getOrderStatusColor } from '../../utils/helpers'
import { ORDER_STATUS_LABELS } from '../../utils/constants'

const RecentOrdersTable = ({ orders = [], onStatusUpdate }) => {
  return (
    <div className="bg-white rounded-2xl border border-earth-100 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-earth-800 text-base">Recent Live Orders</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-earth-700">
          <thead className="bg-earth-50 text-earth-500 uppercase text-[11px] font-bold border-b border-earth-200">
            <tr>
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-earth-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-earth-900">
                    #{order.order_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-earth-800">{order.customer_name || order.customer?.full_name}</p>
                    <p className="text-xs text-earth-400">{order.customer?.phone_number}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-mustard-700">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getOrderStatusColor(
                        order.status
                      )}`}
                    >
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-earth-500">
                    {formatTime(order.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {onStatusUpdate && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <select
                        value={order.status}
                        onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                        className="text-xs p-1.5 rounded-lg border border-earth-300 font-semibold text-earth-800 bg-white"
                      >
                        <option value="placed">Placed</option>
                        <option value="accepted">Accepted</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-earth-400">
                  No orders recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentOrdersTable
