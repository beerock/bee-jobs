'use client'

import { useState, useRef, useMemo } from 'react'
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
  const [activeTab, setActiveTab] = useState<JobStatus>('saved')
  const touchStartX = useRef<number | null>(null)
  const supabase = useMemo(() => createClient(), [])
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
      j.id === draggedJob.id ? { ...j, status, updated_at: new Date().toISOString() } : j
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

  // Swipe navigation between tabs on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    const threshold = 80

    if (Math.abs(diff) > threshold) {
      const currentIndex = STATUSES.indexOf(activeTab)
      if (diff > 0 && currentIndex < STATUSES.length - 1) {
        // Swipe left → next tab
        setActiveTab(STATUSES[currentIndex + 1])
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right → previous tab
        setActiveTab(STATUSES[currentIndex - 1])
      }
    }
    touchStartX.current = null
  }

  return (
    <>
      {/* Mobile: Tab-based view with swipe */}
      <div className="md:hidden">
        {/* Scrollable tab bar */}
        <div className="flex overflow-x-auto gap-1.5 pb-3 -mx-1 px-1 scrollbar-hide">
          {STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`flex-shrink-0 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                activeTab === status
                  ? STATUS_CONFIG[status].color + ' ring-2 ring-offset-1 ring-gray-300'
                  : 'bg-gray-100 text-gray-500 active:bg-gray-200'
              }`}
            >
              {STATUS_CONFIG[status].emoji} {STATUS_CONFIG[status].label}
              <span className="ml-1.5 opacity-75">({jobsByStatus[status].length})</span>
            </button>
          ))}
        </div>

        {/* Swipe hint */}
        <div className="text-center text-xs text-gray-400 mb-3">
          ← Swipe to change status →
        </div>

        {/* Active column content with swipe */}
        <div 
          className="space-y-3 min-h-[50vh] touch-scroll"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {jobsByStatus[activeTab].length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <p className="text-lg">No jobs in {STATUS_CONFIG[activeTab].label}</p>
              <p className="text-sm mt-2">Tap + to add a job</p>
            </div>
          ) : (
            jobsByStatus[activeTab].map(job => (
              <JobCard
                key={job.id}
                job={job}
                onDragStart={() => handleDragStart(job)}
                isDragging={draggedJob?.id === job.id}
              />
            ))
          )}
        </div>

        {/* Job count footer */}
        <div className="text-center text-sm text-gray-400 pt-4 pb-2">
          {jobs.length} total job{jobs.length !== 1 ? 's' : ''} tracked
        </div>
      </div>

      {/* Desktop: Kanban columns */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map(status => (
          <div
            key={status}
            className="flex-shrink-0 w-72 lg:w-80 lg:flex-1 lg:min-w-0"
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
    </>
  )
}
