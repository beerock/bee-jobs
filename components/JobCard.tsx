'use client'

import { Job } from '@/lib/types'
import { Building2, MapPin, DollarSign, ExternalLink, Star, StarOff } from 'lucide-react'
import { useState } from 'react'
import { JobDetailModal } from './JobDetailModal'

interface JobCardProps {
  job: Job
  onDragStart: () => void
  isDragging: boolean
}

export function JobCard({ job, onDragStart, isDragging }: JobCardProps) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onClick={() => setShowDetail(true)}
        className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition ${
          isDragging ? 'opacity-50 scale-95' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{job.role}</h3>
          {job.interested !== null && (
            job.interested ? (
              <Star className="w-4 h-4 text-bee-500 fill-bee-500 flex-shrink-0" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-600 mb-2">
          <Building2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{job.company}</span>
          {job.company_stage && (
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded ml-1">
              {job.company_stage}
            </span>
          )}
        </div>

        {job.location && (
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{job.location}</span>
          </div>
        )}

        {job.salary_range && (
          <div className="flex items-center gap-1 text-green-600 text-sm mb-2">
            <DollarSign className="w-3 h-3" />
            <span>{job.salary_range}</span>
          </div>
        )}

        {job.why_good_fit && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-2 border-t pt-2">
            💡 {job.why_good_fit}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-2 border-t">
          <span className="text-xs text-gray-400">
            {new Date(job.created_at).toLocaleDateString()}
          </span>
          {job.job_url && (
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-bee-500 hover:text-bee-600"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {showDetail && (
        <JobDetailModal job={job} onClose={() => setShowDetail(false)} />
      )}
    </>
  )
}
