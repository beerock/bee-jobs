import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JobBoard } from '@/components/JobBoard'
import { Header } from '@/components/Header'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="container mx-auto px-4 py-6">
        <JobBoard initialJobs={jobs || []} />
      </main>
    </div>
  )
}
