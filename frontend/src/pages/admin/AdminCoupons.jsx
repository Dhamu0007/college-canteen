import React, { useState, useEffect } from 'react'
import { Plus, Ticket, Trash2, Check, X } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import { couponsAPI } from '../../api/coupons'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import { formatDate } from '../../utils/helpers'

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '0',
    max_discount: '',
    valid_from: new Date().toISOString().slice(0, 10),
    valid_to: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    is_active: true,
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await couponsAPI.getCoupons()
      setCoupons(res.data.results || res.data || [])
    } catch (err) {
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete coupon code "${code}"?`)) return
    try {
      await couponsAPI.deleteCoupon(code)
      fetchCoupons()
      toast.success('Coupon deleted successfully')
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Failed to delete coupon')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        max_discount: formData.max_discount === '' ? null : formData.max_discount,
        min_order_value: formData.min_order_value === '' ? 0 : formData.min_order_value,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : new Date().toISOString(),
        valid_to: formData.valid_to ? new Date(formData.valid_to).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
      }
      await couponsAPI.createCoupon(payload)
      toast.success('Coupon created successfully!')
      setIsModalOpen(false)
      fetchCoupons()
    } catch (err) {
      const errData = err.response?.data
      const errorMsg = typeof errData === 'object' && errData
        ? Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ')
        : 'Failed to create coupon'
      toast.error(errorMsg)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-earth-900">Discount Coupons</h1>
            <p className="text-xs text-earth-500">Create promotional discount codes & first-order offers</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} /> Create Coupon
          </button>
        </div>

        {loading ? (
          <Loader text="Loading coupon codes..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons && coupons.length > 0 ? (
              coupons.map((c) => (
                <div
                  key={c.id || c.code}
                  className="bg-white rounded-2xl border border-earth-100 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-lg text-mustard-700 bg-mustard-50 px-3 py-1 rounded-xl border border-mustard-200">
                        {c.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          c.is_active && c.is_valid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {c.is_active && c.is_valid ? 'Active' : 'Inactive / Expired'}
                      </span>
                    </div>
                    <h4 className="font-bold text-earth-900 text-sm mt-2">{c.name}</h4>
                    <p className="text-xs text-earth-500 mt-1">
                      Discount: {c.discount_value}
                      {c.discount_type === 'percentage' ? '%' : '₹'} off
                    </p>
                    {c.min_order_value > 0 && (
                      <p className="text-xs text-earth-400 mt-0.5">
                        Min Order: ₹{c.min_order_value}
                      </p>
                    )}
                    <p className="text-xs text-earth-400 mt-1">
                      Valid: {formatDate(c.valid_from)} - {formatDate(c.valid_to)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-earth-100 flex items-center justify-between mt-4">
                    <span className="text-xs text-earth-500">Used: {c.used_count || 0} times</span>
                    <button
                      onClick={() => handleDelete(c.code)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-12 rounded-2xl text-center text-earth-400 text-sm">
                No active coupons configured. Create your first coupon discount!
              </div>
            )}
          </div>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-earth-900">Create Coupon Code</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-earth-400 hover:text-earth-700 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="FEAST20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm font-mono focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Offer Title</label>
                  <input
                    type="text"
                    required
                    placeholder="20% Off Canteen Snacks"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Type</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none bg-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="20"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Min Order (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.min_order_value}
                      onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Max Discount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Optional"
                      value={formData.max_discount}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Valid From</label>
                    <input
                      type="date"
                      required
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Valid To</label>
                    <input
                      type="date"
                      required
                      value={formData.valid_to}
                      onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                      className="w-full px-3 py-2 border border-earth-300 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-earth-100 text-earth-700 rounded-xl font-bold text-sm cursor-pointer hover:bg-earth-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-mustard-500 hover:bg-mustard-600 text-earth-900 rounded-xl font-bold text-sm cursor-pointer"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCoupons
