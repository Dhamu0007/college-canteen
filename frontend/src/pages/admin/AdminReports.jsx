import React, { useState, useEffect } from 'react'
import { Download, Calendar, BarChart2 } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import { reportsAPI } from '../../api/reports'
import RevenueChart from '../../components/admin/RevenueChart'
import BestSellingProducts from '../../components/admin/BestSellingProducts'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import { formatCurrency } from '../../utils/helpers'

const AdminReports = () => {
  const [reportType, setReportType] = useState('daily')
  const [revenueData, setRevenueData] = useState([])
  const [bestSelling, setBestSelling] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [reportType])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const [revRes, prodRes] = await Promise.all([
        reportsAPI.getRevenueReport({ type: reportType }),
        reportsAPI.getProductPerformance(),
      ])
      setRevenueData(revRes.data || [])
      setBestSelling(prodRes.data || [])
    } catch (err) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    toast.success('Report exported to CSV successfully!')
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-earth-900">Analytics & Sales Reports</h1>
            <p className="text-xs text-earth-500">Track canteen revenue, order trends & item popularity</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 bg-white border border-earth-300 rounded-xl text-sm font-semibold text-earth-800 focus:outline-none"
            >
              <option value="daily">Daily Report (30 Days)</option>
              <option value="weekly">Weekly Report (12 Weeks)</option>
              <option value="monthly">Monthly Report (12 Months)</option>
              <option value="yearly">Yearly Report</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-xl text-sm flex items-center gap-2 shadow-xs"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <Loader text="Generating sales analytics..." />
        ) : (
          <div className="space-y-6">
            <RevenueChart reportData={revenueData} />
            <BestSellingProducts products={bestSelling} />
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminReports
