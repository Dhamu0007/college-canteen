import React, { useState, useEffect } from 'react'
import { Users, Mail, Phone, Home, Search, GraduationCap } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import api from '../../api/index'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/auth/customers/')
      setCustomers(res.data.results || res.data || [])
    } catch (err) {
      // Fallback empty list
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number?.includes(search) ||
      c.college_id?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Customer Directory</h1>
          <p className="text-xs text-earth-500">Registered students, hostelers & staff profiles</p>
        </div>

        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3.5 top-3 text-earth-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone or college ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-earth-200 rounded-xl text-sm focus:outline-none focus:border-mustard-500"
          />
        </div>

        {loading ? (
          <Loader text="Loading customer directory..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered && filtered.length > 0 ? (
              filtered.map((cust) => (
                <div
                  key={cust.id}
                  className="bg-white rounded-2xl border border-earth-100 p-5 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-mustard-200 text-earth-900 font-bold text-lg flex items-center justify-center">
                      {cust.full_name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h4 className="font-bold text-earth-900 text-base">{cust.full_name || cust.user?.username}</h4>
                      <p className="text-xs text-earth-400">Total Orders: {cust.total_orders || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-earth-600 border-t border-earth-100 pt-3">
                    {(cust.college_id || cust.user?.college_id) && (
                      <p className="flex items-center gap-2 font-semibold text-earth-800">
                        <GraduationCap size={14} className="text-mustard-600" /> ID: {cust.college_id || cust.user?.college_id}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-earth-400" /> {cust.email || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-earth-400" /> {cust.phone_number || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Home size={14} className="text-earth-400" />{' '}
                      {cust.hostel_name ? `${cust.hostel_name} (Room ${cust.room_number || ''})` : cust.address || 'Local Canteen'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-12 rounded-2xl text-center text-earth-400 text-sm">
                No customer profiles match your search
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCustomers
