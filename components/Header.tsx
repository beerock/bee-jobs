'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Plus } from 'lucide-react'
import { useState } from 'react'
import { AddJobModal } from './AddJobModal'

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showAddModal, setShowAddModal] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-bee-600">🐝 bee-jobs</h1>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Job Tracker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-bee-500 hover:bg-bee-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Job</span>
            </button>

            <span className="text-sm text-gray-600 hidden md:inline">
              {user.email}
            </span>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {showAddModal && (
        <AddJobModal onClose={() => setShowAddModal(false)} />
      )}
    </>
  )
}
