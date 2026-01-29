export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'passed'

export interface Job {
  id: string
  user_id: string
  
  // Company info
  company: string
  company_stage?: string
  company_size?: string
  company_mission?: string
  
  // Role info
  role: string
  job_url?: string
  careers_url?: string
  website?: string
  location?: string
  salary_range?: string
  
  // BeeBot analysis
  why_good_fit?: string
  
  // Tracking
  status: JobStatus
  notes?: string
  interested?: boolean | null
  applied_at?: string
  
  // Metadata
  created_at: string
  updated_at: string
  source: 'beebot' | 'manual'
}

export interface Contact {
  id: string
  user_id: string
  job_id: string
  
  name: string
  role?: string
  relationship?: string
  linkedin_url?: string
  email?: string
  notes?: string
  
  created_at: string
}

export interface Activity {
  id: string
  user_id: string
  job_id: string
  
  type: string
  description?: string
  metadata?: Record<string, unknown>
  
  created_at: string
}

export const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; emoji: string }> = {
  saved: { label: 'Saved', color: 'bg-gray-100 text-gray-700', emoji: '🆕' },
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700', emoji: '📤' },
  interviewing: { label: 'Interviewing', color: 'bg-yellow-100 text-yellow-700', emoji: '💬' },
  offer: { label: 'Offer', color: 'bg-green-100 text-green-700', emoji: '🎉' },
  passed: { label: 'Passed', color: 'bg-red-100 text-red-700', emoji: '❌' },
}

export const STATUSES: JobStatus[] = ['saved', 'applied', 'interviewing', 'offer', 'passed']
