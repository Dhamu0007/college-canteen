import React from 'react'
import { motion } from 'framer-motion'
import { Check, Clock, Utensils, Bike, PackageCheck, AlertCircle } from 'lucide-react'

const steps = [
  { key: 'placed', label: 'Order Placed', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: Check },
  { key: 'preparing', label: 'Preparing Food', icon: Utensils },
  { key: 'ready', label: 'Ready for Pickup', icon: PackageCheck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
  { key: 'delivered', label: 'Delivered', icon: Check },
]

const OrderTracker = ({ currentStatus }) => {
  if (currentStatus === 'cancelled') {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center text-red-700 font-semibold flex items-center justify-center gap-2">
        <AlertCircle size={20} />
        This order has been cancelled.
      </div>
    )
  }

  const currentIndex = steps.findIndex((step) => step.key === currentStatus)
  const activeStep = currentIndex >= 0 ? currentIndex : 0

  return (
    <div className="py-6">
      <div className="relative flex items-center justify-between max-w-2xl mx-auto">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-earth-200 -z-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-mustard-500"
          />
        </div>

        {steps.map((step, idx) => {
          const Icon = step.icon
          const isCompleted = idx <= activeStep
          const isCurrent = idx === activeStep

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm
                  ${
                    isCompleted
                      ? 'bg-mustard-500 text-earth-900 font-bold'
                      : 'bg-white border-2 border-earth-300 text-earth-400'
                  }
                  ${isCurrent ? 'ring-4 ring-mustard-200 shadow-md' : ''}
                `}
              >
                <Icon size={18} />
              </motion.div>
              <span
                className={`text-xs mt-2 font-semibold text-center max-w-[80px] ${
                  isCurrent ? 'text-mustard-700 font-bold' : isCompleted ? 'text-earth-800' : 'text-earth-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderTracker
