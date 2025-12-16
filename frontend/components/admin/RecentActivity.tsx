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
    <section className="bg-white dark:bg-gray-800 rounded-md p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Recent Submissions</h3>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">No recent activity.</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((a) => (
            <li key={a.id} className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {a.action} {a.subject_type ? ` ${a.subject_type.split('\\').pop()}` : ''}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{a.user?.name ?? 'System'}</p>
                {a.meta && a.meta.name && <div className="text-xs text-gray-400">{a.meta.name}</div>}
              </div>
              <time className="text-xs text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
