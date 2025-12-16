import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../lib/constants'

type Activity = {
  id: number
  subject_type?: string
  subject_id?: number
  action?: string
  user?: { id?: number; name?: string }
  meta?: any
  created_at?: string
}

function Avatar({ name }: { name?: string }) {
  const label = (name || 'S').charAt(0).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-800 dark:text-gray-100">
      {label}
    </div>
  )
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const url = `${API_BASE_URL.replace(/\/$/, '')}/admin/activities`
        const res = await fetch(url, { credentials: 'include' })
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (mounted) setActivities(data.data ?? [])
      } catch (e) {
        if (mounted) setActivities([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="rounded-md p-4 shadow-sm bg-gradient-to-b from-white/50 to-white/30 dark:from-gray-800/60 dark:to-gray-800/40">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Activity</h3>
        <div className="text-xs text-gray-500">Latest 10</div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">No recent activity.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((a) => (
            <li key={a.id} className="flex items-start gap-3">
              <Avatar name={a.user?.name} />
              <div className="flex-1 bg-[var(--card-bg)] p-3 rounded-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    <span className="capitalize">{a.action}</span>
                    {a.subject_type ? (
                      <span className="text-xs text-gray-500 ml-2">{a.subject_type.split('\\').pop()}</span>
                    ) : null}
                  </div>
                  <time className="text-xs text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</time>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {a.meta && a.meta.name ? a.meta.name : a.user?.name ?? 'System'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
