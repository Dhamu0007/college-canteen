import React, { useState } from 'react'
import { Save, Store, Clock, Shield, Bell } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    canteenName: 'EM BABU THINNAVA? Canteen',
    openTime: '08:00',
    closeTime: '22:00',
    deliveryFee: '15',
    taxRate: '5',
    isCanteenOpen: true,
    enableNotifications: true,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Canteen settings updated successfully!')
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Canteen Platform Settings</h1>
          <p className="text-xs text-earth-500">Configure opening hours, taxes, delivery fees & notifications</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-earth-100 p-6 shadow-xs space-y-6">
          {/* Canteen Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-earth-50 rounded-2xl border border-earth-200">
            <div>
              <h4 className="font-bold text-earth-900 text-base">Canteen Operational Status</h4>
              <p className="text-xs text-earth-500">Toggle whether students can place orders right now</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isCanteenOpen}
                onChange={(e) => setSettings({ ...settings, isCanteenOpen: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mustard-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Canteen Outlet Name</label>
              <input
                type="text"
                value={settings.canteenName}
                onChange={(e) => setSettings({ ...settings, canteenName: e.target.value })}
                className="w-full px-4 py-2.5 border border-earth-300 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Hostel Delivery Fee (₹)</label>
              <input
                type="number"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: e.target.value })}
                className="w-full px-4 py-2.5 border border-earth-300 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Opening Time</label>
              <input
                type="time"
                value={settings.openTime}
                onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-earth-300 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-earth-600 mb-1">Closing Time</label>
              <input
                type="time"
                value={settings.closeTime}
                onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-earth-300 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-earth-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-mustard-500 hover:bg-mustard-600 text-earth-900 font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save size={18} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminSettings
