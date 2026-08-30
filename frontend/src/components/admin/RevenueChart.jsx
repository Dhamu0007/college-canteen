import React from 'react'
import { formatCurrency } from '../../utils/helpers'

const RevenueChart = ({ reportData = [] }) => {
  const maxRevenue = Math.max(...reportData.map((d) => parseFloat(d.total_revenue || d.revenue || 0)), 100)

  return (
    <div className="bg-white rounded-2xl border border-earth-100 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-earth-800 text-base">Revenue Overview Trend</h3>
      </div>

      {reportData && reportData.length > 0 ? (
        <div className="h-64 flex items-end gap-2 pt-8 pb-2 px-2 overflow-x-auto border-b border-earth-200">
          {reportData.map((item, idx) => {
            const rev = parseFloat(item.total_revenue || item.revenue || 0)
            const heightPct = Math.max((rev / maxRevenue) * 100, 8)
            const label = item.date || item.week_start || item.month || `P${idx + 1}`

            return (
              <div key={idx} className="flex-1 min-w-[32px] flex flex-col items-center group relative">
                {/* Tooltip */}
                <div className="absolute -top-8 hidden group-hover:block bg-earth-900 text-white text-[10px] py-1 px-2 rounded-md font-bold whitespace-nowrap shadow-md z-20">
                  {formatCurrency(rev)}
                </div>

                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full bg-gradient-to-t from-mustard-500 to-mustard-400 rounded-t-lg transition-all duration-300 hover:from-mustard-600 hover:to-mustard-500"
                />
                <span className="text-[10px] text-earth-500 mt-2 font-mono truncate w-full text-center">
                  {label.slice(-5)}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-earth-400 text-sm">
          No revenue analytics available for selected range
        </div>
      )}
    </div>
  )
}

export default RevenueChart
