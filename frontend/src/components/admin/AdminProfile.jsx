import React from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, ShieldCheck, Edit3 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getImageUrl } from '../../utils/helpers'

const AdminProfile = () => {
  const { user } = useAuth()

  return (
    <div className="bg-white rounded-3xl border border-earth-100 p-6 shadow-xs max-w-md space-y-4">
      <div className="flex items-center gap-4 border-b border-earth-100 pb-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-earth-900 font-bold text-2xl flex items-center justify-center shadow-inner overflow-hidden border border-amber-200">
          {user?.profile_picture ? (
            <img src={getImageUrl(user.profile_picture)} alt="Admin Photo" className="w-full h-full object-cover" />
          ) : (
            user?.username?.[0]?.toUpperCase() || 'A'
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-earth-900">{user?.full_name || user?.username || 'Administrator'}</h3>
          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5 font-medium">
            <ShieldCheck size={14} /> {user?.role || 'Super Admin Credentials'}
          </p>
        </div>
      </div>

      {user?.bio && (
        <p className="text-xs italic text-earth-600 bg-earth-50 p-3 rounded-xl border border-earth-100">
          "{user.bio}"
        </p>
      )}

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-earth-700">
          <span className="flex items-center gap-2 text-earth-500 font-medium">
            <Mail size={15} /> Email
          </span>
          <span className="font-semibold text-earth-900">{user?.email || 'admin@embabuthinnava.local'}</span>
        </div>
        <div className="flex items-center justify-between text-earth-700">
          <span className="flex items-center gap-2 text-earth-500 font-medium">
            <Phone size={15} /> Phone
          </span>
          <span className="font-semibold text-earth-900">{user?.phone_number || '+91 9876543210'}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-earth-100">
        <Link
          to="/admin/profile"
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-earth-950 font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          <Edit3 size={15} /> Edit Full Profile & Photo
        </Link>
      </div>
    </div>
  )
}

export default AdminProfile
