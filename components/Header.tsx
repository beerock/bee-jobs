'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AddJobModal } from './AddJobModal'

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [showAddModal, setShowAddModal] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-bee-600">🐝 bee-jobs</h1>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Job Tracker
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-bee-500 hover:bg-bee-600 active:bg-bee-700 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg font-medium transition min-h-[44px]"
            >
              <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add Job</span>
            </button>

            <span className="text-sm text-gray-600 hidden md:inline">
              {user.email}
            </span>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 active:text-gray-900 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition min-h-[44px] disabled:opacity-50"
            >
              {signingOut ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" /> : <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">{signingOut ? 'Signing out...' : 'Sign Out'}</span>
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
