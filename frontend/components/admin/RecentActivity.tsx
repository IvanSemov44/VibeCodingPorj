import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { API_BASE_URL } from '../../lib/constants'
import type { ActivityLog } from '../../lib/types'

type Activity = ActivityLog & {
  subject_type?: string
  subject_id?: number
  meta?: Record<string, unknown>
}

function Avatar({ name, id }: { name?: string; id?: number }) {
  const label = (name || 'S')
    .split(' ')
    .map((s) => s.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const colors = [
    'from-indigo-500 to-pink-500',
    'from-emerald-400 to-teal-600',
    'from-yellow-400 to-orange-500',
    'from-sky-400 to-indigo-600',
    'from-rose-400 to-fuchsia-500',
  ]

  const hash = (id ?? name?.split('').reduce((s, c) => s + c.charCodeAt(0), 0) ?? 0) as number
  const idx = Math.abs(hash) % colors.length
  const bg = colors[idx]

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-md ring-1 ring-white/30 transform transition-all duration-150 hover:scale-105 bg-gradient-to-br ${bg}`}
      title={name}
    >
      {label}
    </div>
  )
}

function SubjectLink({ activity }: { activity: Activity }) {
  const type = activity.subject_type ?? ''
  const id = activity.subject_id
  const name = activity.meta?.name || activity.meta?.title || activity.meta?.slug || (type.split('\\').pop() + ' #' + id)

  if (!id) return <span className="font-medium">{name}</span>

  if (type.indexOf('Tool') !== -1) {
    return (
      <Link href={`/admin/tools/${id}`} className="font-medium text-indigo-600 hover:underline">
        {name}
      </Link>
    )
  }

  if (type.indexOf('User') !== -1) {
    return (
      <Link href={`/admin/users/${id}`} className="font-medium text-indigo-600 hover:underline">
        {name}
      </Link>
    )
  }

  return <span className="font-medium">{name}</span>
}

function MetaDetails({ meta }: { meta?: any }) {
  if (!meta) return null
  if (meta.roles && Array.isArray(meta.roles)) {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {meta.roles.map((r: string) => (
          <span key={r} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{r}</span>
        ))}
      </div>
    )
  }

  // Common fields
  return (
    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
      {meta.email && <div>Email: {meta.email}</div>}
      {meta.url && <div>URL: <a className="text-indigo-500" href={meta.url} target="_blank" rel="noreferrer">{meta.url}</a></div>}
      {!meta.email && !meta.url && <pre className="whitespace-pre-wrap text-xs text-gray-400">{JSON.stringify(meta)}</pre>}
    </div>
  )
}

function ActorDetails({ user }: { user?: Activity['user'] }) {
  if (!user) return <div className="text-sm text-gray-500">System</div>
  return (
    <div className="text-sm text-gray-700 dark:text-gray-200">
      <div className="flex items-center gap-2">
        <Link href={`/admin/users/${user.id}`} className="font-medium text-indigo-600 hover:underline">{user.name}</Link>
        {user.roles && user.roles.length > 0 && (
          <div className="flex items-center gap-1">
            {user.roles.map((r) => (
              <span key={r} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{r}</span>
            ))}
          </div>
        )}
      </div>
      {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
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
              <Avatar name={a.user?.name} id={a.user?.id as any} />
              <div className="flex-1 bg-[var(--card-bg)] p-3 rounded-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[var(--text-primary)] w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="capitalize">{a.action}</span>
                        {a.subject_type ? (
                          <span className="text-xs text-gray-500 ml-2">{a.subject_type.split('\\').pop()}</span>
                        ) : null}
                      </div>
                      <time className="text-xs text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</time>
                    </div>
                    <div className="mt-2">
                      <SubjectLink activity={a} />
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <ActorDetails user={a.user as any} />
                </div>
                <MetaDetails meta={a.meta} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
