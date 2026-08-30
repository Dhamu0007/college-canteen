import React, { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../hooks/useAuth'
import { authAPI } from '../../api/auth'
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  Camera,
  Trash2,
  Lock,
  Sparkles,
  Key,
  BadgeCheck,
  Loader2,
  FileText,
  Building,
} from 'lucide-react'
import AnimatedPage from '../../components/animations/AnimatedPage'
import toast from 'react-hot-toast'
import { getImageUrl } from '../../utils/helpers'

const AdminProfilePage = () => {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    role: 'Administrator',
    bio: '',
  })

  const [profilePicture, setProfilePicture] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [removePicture, setRemovePicture] = useState(false)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchAdminProfile()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      setFetching(true)
      const res = await authAPI.getAdminProfile()
      const p = res.data
      setFormData({
        full_name: p.full_name || user?.full_name || user?.username || '',
        phone_number: p.phone_number || user?.phone_number || '',
        email: p.email || user?.email || '',
        role: p.role || 'Administrator',
        bio: p.bio || '',
      })

      if (p.profile_picture) {
        setPreviewUrl(p.profile_picture)
      } else if (user?.profile_picture) {
        setPreviewUrl(user.profile_picture)
      }
    } catch (err) {
      if (user) {
        setFormData((prev) => ({
          ...prev,
          full_name: user.full_name || user.username || '',
          phone_number: user.phone_number || '',
          email: user.email || '',
          bio: user.bio || '',
        }))
        if (user.profile_picture) {
          setPreviewUrl(user.profile_picture)
        }
      }
    } finally {
      setFetching(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setProfilePicture(file)
      setRemovePicture(false)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemovePhoto = () => {
    setProfilePicture(null)
    setPreviewUrl('')
    setRemovePicture(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

      const submitData = new FormData()
      submitData.append('full_name', formData.full_name)
      submitData.append('phone_number', formData.phone_number)
      submitData.append('role', formData.role)
      submitData.append('bio', formData.bio)

      if (profilePicture) {
        submitData.append('profile_picture', profilePicture)
      } else if (removePicture) {
        submitData.append('profile_picture', '')
      }

      const res = await authAPI.updateAdminProfile(submitData)
      const updatedProfile = res.data

      const picUrl = updatedProfile.profile_picture || updatedProfile.user?.profile_picture || (removePicture ? null : user?.profile_picture)

      // Sync state to AuthContext
      updateUser({
        full_name: updatedProfile.full_name,
        phone_number: updatedProfile.phone_number,
        role: updatedProfile.role,
        bio: updatedProfile.bio,
        profile_picture: picUrl,
        admin_profile: updatedProfile,
      })

      if (picUrl) {
        setPreviewUrl(picUrl)
      } else if (removePicture) {
        setPreviewUrl('')
      }

      setRemovePicture(false)
      setProfilePicture(null)

      toast.success('Admin Profile updated successfully! 🛡️')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to update admin profile'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <AnimatedPage className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-600 via-earth-800 to-earth-900 p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              
              {/* Profile Photo Avatar & Upload */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-3xl bg-amber-100 text-earth-900 border-4 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300">
                  {previewUrl ? (
                    <img
                      src={getImageUrl(previewUrl)}
                      alt="Admin Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-display font-extrabold text-earth-800">
                      {formData.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'A'}
                    </span>
                  )}
                </div>
                
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 bg-amber-500 hover:bg-amber-400 text-earth-950 rounded-2xl shadow-lg transition-transform transform hover:scale-110 active:scale-95"
                  title="Upload Admin Photo"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    {formData.full_name || 'Administrator'}
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                    <ShieldCheck size={14} /> {formData.role || 'Super Admin'}
                  </span>
                </div>
                <p className="text-amber-200 text-sm mt-1">{formData.email}</p>
                {formData.bio && (
                  <p className="text-earth-300 text-xs italic mt-2 max-w-md line-clamp-2">
                    "{formData.bio}"
                  </p>
                )}
              </div>
            </div>

            {/* Quick Security Badge */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-xs text-amber-200 flex items-center gap-3">
              <BadgeCheck size={28} className="text-amber-400" />
              <div>
                <p className="font-bold text-white">Full System Access</p>
                <p className="text-[11px] text-amber-200/80">Management Privileges</p>
              </div>
            </div>
          </div>

          {/* Photo Removal bar */}
          {(profilePicture || previewUrl) && (
            <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-amber-200">
              <span>Photo status: {profilePicture ? 'New avatar selected (unsaved)' : 'Custom avatar set'}</span>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-rose-300 hover:text-rose-100 flex items-center gap-1 font-medium transition-colors"
              >
                <Trash2 size={14} /> Remove Photo
              </button>
            </div>
          )}
        </div>

        {fetching ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="animate-spin text-amber-600" size={36} />
            <p className="text-sm font-semibold text-earth-600">Loading admin credentials...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Edit Form (Left 2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Admin Details Card */}
                <div className="bg-white rounded-3xl border border-earth-100 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-earth-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-100 text-earth-900 rounded-2xl">
                        <User size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-earth-900">Admin Account Details</h2>
                        <p className="text-xs text-earth-500">Manage your administrative identity and designation</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-earth-50/50 border border-earth-200 rounded-xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                          placeholder="Admin Full Name"
                        />
                        <User size={16} className="absolute left-3.5 top-3 text-earth-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-1.5">
                        Role / Title
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-earth-50/50 border border-earth-200 rounded-xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                          placeholder="e.g. Senior Canteen Manager"
                        />
                        <ShieldCheck size={16} className="absolute left-3.5 top-3 text-earth-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-1.5">
                        Mobile Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-earth-50/50 border border-earth-200 rounded-xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                          placeholder="+91 9876543210"
                        />
                        <Phone size={16} className="absolute left-3.5 top-3 text-earth-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-1.5">
                        System Email (Read-only)
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          disabled
                          value={formData.email}
                          className="w-full pl-10 pr-4 py-2.5 bg-earth-100/60 border border-earth-200 rounded-xl text-sm font-medium text-earth-600 cursor-not-allowed"
                        />
                        <Mail size={16} className="absolute left-3.5 top-3 text-earth-400" />
                      </div>
                    </div>
                  </div>

                  {/* Admin Bio / Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700">
                        Admin Bio & Operational Notes
                      </label>
                      <span className="text-[11px] text-earth-400">{formData.bio.length}/500</span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Enter details about your role, canteen management responsibilities, or contact hours..."
                      className="w-full p-3.5 bg-earth-50/50 border border-earth-200 rounded-2xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-98 text-earth-950 font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Saving Admin Profile...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Admin Profile
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sidebar Info (Right 1 col) */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-earth-100 p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-earth-900 text-sm uppercase tracking-wider border-b border-earth-100 pb-3 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-600" /> Security & Privileges
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <Key size={14} /> Administrator Level
                      </div>
                      <p className="text-amber-800/80 text-[11px] leading-relaxed">
                        Authorized to manage products, menu items, coupons, active orders, and customer reports.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-100 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-earth-900">
                        <Lock size={14} className="text-earth-600" /> Password Security
                      </div>
                      <p className="text-earth-500 text-[11px]">
                        To update your password, use the account security settings panel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-3xl border border-amber-200/50 p-6 text-earth-800 space-y-2">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-earth-900">
                    <Sparkles size={16} className="text-amber-600" /> System Note
                  </h4>
                  <p className="text-xs text-earth-600 leading-relaxed">
                    Changes to your Admin Full Name or Profile Photo will immediately reflect across order audit logs and the management header.
                  </p>
                </div>
              </div>

            </div>
          </form>
        )}
      </AnimatedPage>
    </AdminLayout>
  )
}

export default AdminProfilePage
