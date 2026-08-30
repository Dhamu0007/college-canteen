import React, { useState, useEffect, useRef } from 'react'
import CustomerLayout from '../../layouts/CustomerLayout'
import { useAuth } from '../../hooks/useAuth'
import { authAPI } from '../../api/auth'
import {
  User,
  Mail,
  Phone,
  Home,
  Save,
  Camera,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  Award,
  Sparkles,
  MapPin,
  Building,
  FileText,
  Clock,
  Loader2,
} from 'lucide-react'
import AnimatedPage from '../../components/animations/AnimatedPage'
import toast from 'react-hot-toast'
import { HOSTELS } from '../../utils/constants'
import { getImageUrl } from '../../utils/helpers'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    college_id: '',
    bio: '',
    hostel_name: HOSTELS[0] || 'Main Hostel',
    room_number: '',
    address: '',
  })
  
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [removePicture, setRemovePicture] = useState(false)
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    isPhoneVerified: false,
    isEmailVerified: false,
    createdAt: null,
  })

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setFetching(true)
      const res = await authAPI.getCustomerProfile()
      const p = res.data
      setFormData({
        full_name: p.full_name || user?.username || '',
        phone_number: p.phone_number || user?.phone_number || '',
        email: p.email || user?.email || '',
        college_id: p.college_id || user?.college_id || '',
        bio: p.bio || '',
        hostel_name: p.hostel_name || HOSTELS[0] || 'Main Hostel',
        room_number: p.room_number || '',
        address: p.address || '',
      })

      if (p.profile_picture) {
        setPreviewUrl(p.profile_picture)
      } else if (user?.profile_picture) {
        setPreviewUrl(user.profile_picture)
      }

      setStats({
        totalOrders: p.total_orders || 0,
        isPhoneVerified: p.is_phone_verified || false,
        isEmailVerified: p.is_email_verified || false,
        createdAt: p.created_at || user?.created_at,
      })
    } catch (err) {
      // Fall back to context user if endpoint fails
      if (user) {
        setFormData((prev) => ({
          ...prev,
          full_name: user.full_name || user.username || '',
          phone_number: user.phone_number || '',
          email: user.email || '',
          college_id: user.college_id || '',
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
      submitData.append('college_id', formData.college_id)
      submitData.append('bio', formData.bio)
      submitData.append('hostel_name', formData.hostel_name)
      submitData.append('room_number', formData.room_number)
      submitData.append('address', formData.address)

      if (profilePicture) {
        submitData.append('profile_picture', profilePicture)
      } else if (removePicture) {
        submitData.append('profile_picture', '')
      }

      const res = await authAPI.updateCustomerProfile(submitData)
      const updatedProfile = res.data

      const picUrl = updatedProfile.profile_picture || updatedProfile.user?.profile_picture || (removePicture ? null : user?.profile_picture)

      // Update AuthContext state
      updateUser({
        full_name: updatedProfile.full_name,
        phone_number: updatedProfile.phone_number,
        college_id: updatedProfile.college_id,
        bio: updatedProfile.bio,
        profile_picture: picUrl,
        customer_profile: updatedProfile,
      })

      if (picUrl) {
        setPreviewUrl(picUrl)
      } else if (removePicture) {
        setPreviewUrl('')
      }

      setRemovePicture(false)
      setProfilePicture(null)

      toast.success('Profile updated successfully! 👤✨')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to update profile'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerLayout>
      <AnimatedPage className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-mustard-600 via-earth-800 to-earth-900 p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-mustard-400/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Profile Photo Avatar & Upload */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-3xl bg-mustard-100 text-earth-900 border-4 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300">
                  {previewUrl ? (
                    <img
                      src={getImageUrl(previewUrl)}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-display font-extrabold text-earth-800">
                      {formData.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                
                {/* Upload Button overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 bg-mustard-500 hover:bg-mustard-400 text-earth-950 rounded-2xl shadow-lg transition-transform transform hover:scale-110 active:scale-95"
                  title="Upload profile photo"
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
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    {formData.full_name || 'Food Explorer'}
                  </h1>
                  <span className="bg-mustard-500/30 text-mustard-200 border border-mustard-400/40 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    Student
                  </span>
                </div>
                <p className="text-earth-200 text-sm mt-1">{formData.email}</p>
                {formData.bio && (
                  <p className="text-earth-300 text-xs italic mt-2 max-w-md line-clamp-2">
                    "{formData.bio}"
                  </p>
                )}
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-xs text-white">
              <div className="text-center px-3 py-1 border-r border-white/20">
                <p className="text-lg font-bold text-mustard-300">{stats.totalOrders}</p>
                <p className="text-[11px] text-earth-200">Orders</p>
              </div>
              <div className="text-center px-3 py-1">
                <p className="text-lg font-bold text-emerald-400">Verified</p>
                <p className="text-[11px] text-earth-200">Account</p>
              </div>
            </div>
          </div>

          {/* Photo Actions bar if photo modified */}
          {(profilePicture || previewUrl) && (
            <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-earth-200">
              <span>Photo status: {profilePicture ? 'New photo selected (unsaved)' : 'Custom avatar set'}</span>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-red-300 hover:text-red-100 flex items-center gap-1 font-medium transition-colors"
              >
                <Trash2 size={14} /> Remove Photo
              </button>
            </div>
          )}
        </div>

        {fetching ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="animate-spin text-mustard-600" size={36} />
            <p className="text-sm font-semibold text-earth-600">Loading profile details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 columns: Main Edit Form */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Personal Information Card */}
                <div className="bg-white rounded-3xl border border-earth-100 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-earth-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-mustard-100 text-earth-800 rounded-2xl">
                        <User size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-earth-900">Personal Information</h2>
                        <p className="text-xs text-earth-500">Update your personal identity and college details</p>
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
                          className="w-full pl-10 pr-4 py-2.5 bg-earth-50/50 border border-earth-200 rounded-xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mustard-500 transition-all"
                          placeholder="Your Full Name"
                        />
                        <User size={16} className="absolute left-3.5 top-3 text-earth-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-1.5">
                        College ID / Roll Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.college_id}
                          onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-earth-50/50 border border-earth-200 rounded-xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mustard-500 transition-all"
                          placeholder="e.g. 21BCE1024"
                        />
                        <Award size={16} className="absolute left-3.5 top-3 text-earth-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-1.5">
                        Mobile Phone
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-earth-50/50 border border-earth-200 rounded-xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mustard-500 transition-all"
                          placeholder="10 digit mobile number"
                        />
                        <Phone size={16} className="absolute left-3.5 top-3 text-earth-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-1.5">
                        Email Address (Read-only)
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

                  {/* Bio Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700">
                        About Me / Bio
                      </label>
                      <span className="text-[11px] text-earth-400">{formData.bio.length}/300</span>
                    </div>
                    <div className="relative">
                      <textarea
                        rows={3}
                        maxLength={300}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell canteen staff or fellow foodies a bit about yourself (e.g., Favorite dishes, food preferences, study year...)"
                        className="w-full p-3.5 bg-earth-50/50 border border-earth-200 rounded-2xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mustard-500 transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Delivery & Hostel Address Card */}
                <div className="bg-white rounded-3xl border border-earth-100 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-earth-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-mustard-100 text-earth-800 rounded-2xl">
                        <Home size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-earth-900">Campus Delivery Location</h2>
                        <p className="text-xs text-earth-500">Hostel block & room for seamless order delivery</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-1.5">
                        Hostel Block / Building
                      </label>
                      <div className="relative">
                        <select
                          value={formData.hostel_name}
                          onChange={(e) => setFormData({ ...formData, hostel_name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-earth-50/50 border border-earth-200 rounded-xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mustard-500 transition-all appearance-none cursor-pointer"
                        >
                          {HOSTELS.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                        <Building size={16} className="absolute left-3.5 top-3 text-earth-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-1.5">
                        Room Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. 304-B"
                          value={formData.room_number}
                          onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-earth-50/50 border border-earth-200 rounded-xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mustard-500 transition-all"
                        />
                        <MapPin size={16} className="absolute left-3.5 top-3 text-earth-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-1.5">
                      Full Campus Address / Delivery Notes
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Near Main Gate Canteen Dropzone or Block B entrance..."
                      className="w-full p-3.5 bg-earth-50/50 border border-earth-200 rounded-2xl text-sm font-medium text-earth-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mustard-500 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-mustard-500 hover:bg-mustard-600 active:scale-98 text-earth-950 font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right 1 column: Account Summary & Status */}
              <div className="space-y-6">
                
                {/* Account Status Card */}
                <div className="bg-white rounded-3xl border border-earth-100 p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-earth-900 text-sm uppercase tracking-wider border-b border-earth-100 pb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-mustard-600" /> Account Status
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-earth-50 border border-earth-100">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <span className="text-xs font-semibold text-earth-800">Email Verified</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-earth-50 border border-earth-100">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <span className="text-xs font-semibold text-earth-800">Phone Status</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-earth-50 border border-earth-100">
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag size={18} className="text-mustard-600" />
                        <span className="text-xs font-semibold text-earth-800">Total Orders</span>
                      </div>
                      <span className="text-sm font-bold text-earth-900">
                        {stats.totalOrders}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Helpful Tips Card */}
                <div className="bg-gradient-to-br from-mustard-50 to-earth-50 rounded-3xl border border-mustard-200/50 p-6 space-y-3">
                  <h4 className="font-bold text-earth-900 text-sm flex items-center gap-2">
                    💡 Quick Tip
                  </h4>
                  <p className="text-xs text-earth-600 leading-relaxed">
                    Keeping your hostel block and room number up to date ensures your food arrives hot and fast without extra calls!
                  </p>
                </div>
              </div>

            </div>
          </form>
        )}
      </AnimatedPage>
    </CustomerLayout>
  )
}

export default Profile
