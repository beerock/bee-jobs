'use client'

import { useState } from 'react'
import { Job, JobStatus, STATUSES, STATUS_CONFIG } from '@/lib/types'
import { JobCard } from './JobCard'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface JobBoardProps {
  initialJobs: Job[]
}

export function JobBoard({ initialJobs }: JobBoardProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [draggedJob, setDraggedJob] = useState<Job | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const jobsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = jobs.filter(job => job.status === status)
    return acc
  }, {} as Record<JobStatus, Job[]>)

  const handleDragStart = (job: Job) => {
    setDraggedJob(job)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (status: JobStatus) => {
    if (!draggedJob || draggedJob.status === status) {
      setDraggedJob(null)
      return
    }

    // Optimistic update
    setJobs(prev => prev.map(j => 
      j.id === draggedJob.id ? { ...j, status } : j
    ))

    // Update in database
    const { error } = await supabase
      .from('jobs')
      .update({ 
        status,
        applied_at: status === 'applied' ? new Date().toISOString() : draggedJob.applied_at
      })
      .eq('id', draggedJob.id)

    if (error) {
      // Revert on error
      setJobs(prev => prev.map(j => 
        j.id === draggedJob.id ? draggedJob : j
      ))
    } else {
      router.refresh()
    }

    setDraggedJob(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map(status => (
        <div
          key={status}
          className="flex-shrink-0 w-72"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(status)}
        >
          <div className={`rounded-lg p-2 mb-3 ${STATUS_CONFIG[status].color}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {STATUS_CONFIG[status].emoji} {STATUS_CONFIG[status].label}
              </span>
              <span className="text-sm opacity-75">
                {jobsByStatus[status].length}
              </span>
            </div>
          </div>

          <div className="space-y-3 min-h-96">
            {jobsByStatus[status].map(job => (
              <JobCard
                key={job.id}
                job={job}
                onDragStart={() => handleDragStart(job)}
                isDragging={draggedJob?.id === job.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
