import React from 'react'

const OrderStatusChart = ({ data = {} }) => {
  const statuses = [
    { key: 'placed', label: 'Placed', color: 'bg-blue-500', count: data.placed || 0 },
    { key: 'preparing', label: 'Preparing', color: 'bg-yellow-500', count: data.preparing || 0 },
    { key: 'ready', label: 'Ready', color: 'bg-mustard-500', count: data.ready || 0 },
    { key: 'delivered', label: 'Delivered', color: 'bg-green-500', count: data.delivered || 0 },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-red-500', count: data.cancelled || 0 },
  ]

  const total = statuses.reduce((sum, item) => sum + item.count, 0) || 1

  return (
    <div className="bg-white rounded-2xl border border-earth-100 p-5 shadow-xs">
      <h3 className="font-bold text-earth-800 text-base mb-4">Order Status Breakdown</h3>

      {/* Progress Bar Stack */}
      <div className="h-4 w-full bg-earth-100 rounded-full overflow-hidden flex mb-6">
        {statuses.map((st) => {
          const pct = (st.count / total) * 100
          if (pct === 0) return null
          return (
            <div
              key={st.key}
              style={{ width: `${pct}%` }}
              className={`${st.color} h-full transition-all duration-500`}
              title={`${st.label}: ${st.count}`}
            />
          )
        })}
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {statuses.map((st) => (
          <div key={st.key} className="flex items-center justify-between p-2 rounded-xl bg-earth-50">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${st.color}`} />
              <span className="text-earth-700 font-semibold">{st.label}</span>
            </div>
            <span className="font-bold text-earth-900">{st.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderStatusChart
