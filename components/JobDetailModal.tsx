'use client'

import { useState, useEffect } from 'react'
import { Job, STATUS_CONFIG, STATUSES } from '@/lib/types'
import { X, ExternalLink, Building2, MapPin, DollarSign, Star, StarOff, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface JobDetailModalProps {
  job: Job
  onClose: () => void
}

export function JobDetailModal({ job: initialJob, onClose }: JobDetailModalProps) {
  const [job, setJob] = useState(initialJob)
  const [notes, setNotes] = useState(job.notes || '')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Prevent body scroll when modal is open
  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  const handleUpdate = async (updates: Partial<Job>) => {
    setSaving(true)
    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', job.id)

    if (!error) {
      setJob(prev => ({ ...prev, ...updates }))
      router.refresh()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return

    await supabase.from('jobs').delete().eq('id', job.id)
    router.refresh()
    onClose()
  }

  const toggleInterested = () => {
    const newValue = job.interested === true ? false : job.interested === false ? null : true
    handleUpdate({ interested: newValue })
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto touch-scroll safe-bottom">
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white sm:rounded-t-xl z-10">
          <h2 className="text-base sm:text-lg font-semibold truncate pr-4">{job.role}</h2>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-600 active:text-red-700 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
              title="Delete job"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 active:text-gray-700 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="font-semibold text-lg">{job.company}</span>
              {job.company_stage && (
                <span className="text-sm bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">
                  {job.company_stage}
                </span>
              )}
            </div>
            {job.company_mission && (
              <p className="text-gray-600 text-sm ml-7">{job.company_mission}</p>
            )}
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-3">
            {job.location && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{job.location}</span>
              </div>
            )}
            {job.salary_range && (
              <div className="flex items-center gap-1.5 text-green-600">
                <DollarSign className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{job.salary_range}</span>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            {job.job_url && (
              <a
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-bee-600 hover:text-bee-700 active:text-bee-800 text-sm px-3 py-2.5 bg-bee-50 active:bg-bee-100 rounded-lg min-h-[44px] transition"
              >
                <ExternalLink className="w-4 h-4" />
                Job Posting
              </a>
            )}
            {job.website && (
              <a
                href={job.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-bee-600 hover:text-bee-700 active:text-bee-800 text-sm px-3 py-2.5 bg-bee-50 active:bg-bee-100 rounded-lg min-h-[44px] transition"
              >
                <ExternalLink className="w-4 h-4" />
                Company Website
              </a>
            )}
            {job.careers_url && (
              <a
                href={job.careers_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-bee-600 hover:text-bee-700 active:text-bee-800 text-sm px-3 py-2.5 bg-bee-50 active:bg-bee-100 rounded-lg min-h-[44px] transition"
              >
                <ExternalLink className="w-4 h-4" />
                Careers Page
              </a>
            )}
          </div>

          {/* Why Good Fit */}
          {job.why_good_fit && (
            <div className="bg-bee-50 rounded-lg p-4">
              <h3 className="font-medium text-bee-800 mb-1">💡 Why it&apos;s a good fit</h3>
              <p className="text-bee-700 text-sm leading-relaxed">{job.why_good_fit}</p>
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(status => (
                <button
                  key={status}
                  onClick={() => handleUpdate({ 
                    status,
                    applied_at: status === 'applied' && job.status !== 'applied' 
                      ? new Date().toISOString() 
                      : job.applied_at
                  })}
                  className={`px-3.5 py-2.5 rounded-lg text-sm font-medium transition min-h-[44px] ${
                    job.status === status
                      ? STATUS_CONFIG[status].color + ' ring-2 ring-offset-1 ring-gray-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  {STATUS_CONFIG[status].emoji} {STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>
          </div>

          {/* Interest */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Interest Level</h3>
            <button
              onClick={toggleInterested}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition min-h-[44px] ${
                job.interested === true
                  ? 'bg-bee-100 text-bee-700'
                  : job.interested === false
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {job.interested === true ? (
                <>
                  <Star className="w-5 h-5 fill-bee-500 text-bee-500" />
                  Interested
                </>
              ) : job.interested === false ? (
                <>
                  <StarOff className="w-5 h-5" />
                  Not Interested
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  Not Reviewed
                </>
              )}
            </button>
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== job.notes) {
                  handleUpdate({ notes })
                }
              }}
              rows={4}
              placeholder="Add your notes here..."
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-500 focus:border-transparent outline-none resize-none text-base leading-relaxed"
            />
          </div>

          {/* Metadata */}
          <div className="text-sm text-gray-400 pt-2 border-t space-y-1">
            <p>Added: {new Date(job.created_at).toLocaleDateString()}</p>
            {job.applied_at && (
              <p>Applied: {new Date(job.applied_at).toLocaleDateString()}</p>
            )}
            <p>Source: {job.source === 'beebot' ? '🐝 BeeBot' : 'Manual'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
