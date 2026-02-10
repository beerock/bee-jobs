'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AddJobModalProps {
  onClose: () => void
}

export function AddJobModal({ onClose }: AddJobModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    company_stage: '',
    location: '',
    salary_range: '',
    job_url: '',
    website: '',
    notes: '',
  })
  const supabase = createClient()
  const router = useRouter()

  // Prevent body scroll when modal is open
  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('jobs').insert({
      ...formData,
      user_id: user.id,
      source: 'manual',
    })

    if (!error) {
      router.refresh()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto touch-scroll safe-bottom">
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white sm:rounded-t-xl z-10">
          <h2 className="text-lg font-semibold">Add New Job</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 active:text-gray-700 p-2.5 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Company *
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-500 focus:border-transparent outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role *
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-500 focus:border-transparent outline-none text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Company Stage
                </label>
                <select
                  value={formData.company_stage}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_stage: e.target.value }))}
                  className="w-full px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-500 focus:border-transparent outline-none text-base bg-white"
                >
                  <option value="">Select...</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C">Series C</option>
                  <option value="Series D+">Series D+</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Remote, NYC..."
                  className="w-full px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-500 focus:border-transparent outline-none text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Salary Range
              </label>
              <input
                type="text"
                value={formData.salary_range}
                onChange={(e) => setFormData(prev => ({ ...prev, salary_range: e.target.value }))}
                placeholder="$150k-$200k"
                className="w-full px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-500 focus:border-transparent outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job URL
              </label>
              <input
                type="url"
                value={formData.job_url}
                onChange={(e) => setFormData(prev => ({ ...prev, job_url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-500 focus:border-transparent outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-500 focus:border-transparent outline-none resize-none text-base"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition min-h-[48px] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 sm:py-2.5 bg-bee-500 text-white rounded-lg hover:bg-bee-600 active:bg-bee-700 transition disabled:opacity-50 min-h-[48px] font-medium"
            >
              {loading ? 'Adding...' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
