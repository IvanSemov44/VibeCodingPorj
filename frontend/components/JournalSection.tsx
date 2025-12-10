import React, { useState, useEffect, useCallback } from 'react';
import JournalEntry from './JournalEntry';
import { getJournalEntries, createJournalEntry, deleteJournalEntry, getJournalStats } from '../lib/api';
import { LoadingPage } from './Loading';
import type { JournalEntry as JournalEntryModel, JournalStats } from '../lib/types';

type MoodOption = { value: string; emoji: string; label: string; color: string };

const MOOD_OPTIONS: MoodOption[] = [
  { value: 'excited', emoji: '🚀', label: 'Excited', color: '#f59e0b' },
  { value: 'happy', emoji: '😊', label: 'Happy', color: '#10b981' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#6b7280' },
  { value: 'tired', emoji: '😴', label: 'Tired', color: '#8b5cf6' },
  { value: 'victorious', emoji: '🏆', label: 'Victorious', color: '#ef4444' }
];

const TAG_OPTIONS = [
  'Backend', 'Frontend', 'Bug Fix', 'Feature Quest', 'Refactor',
  'Docs', 'Testing', 'Design', 'Learning', 'Team Collab'
];

export default function JournalSection(): React.ReactElement {
  const [entries, setEntries] = useState<JournalEntryModel[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const [formData, setFormData] = useState({ title: '', content: '', mood: 'neutral', tags: [] as string[], xp: 50 });
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const params: Record<string, string | number | boolean> = {};
      if (search) params.search = search;
      if (moodFilter) params.mood = moodFilter;
      if (tagFilter) params.tag = tagFilter;

      const [entriesData, statsData] = await Promise.all([
        getJournalEntries(params),
        getJournalStats()
      ]);

      setEntries(entriesData || []);
      setStats(statsData || null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load journal data:', error);
    } finally {
      setLoading(false);
    }
  }, [search, moodFilter, tagFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Content is required');
      return;
    }

    setSubmitting(true);
    try {
      const newEntry = await createJournalEntry(formData);
      if (newEntry) {
        setEntries([newEntry, ...entries]);
        setFormData({ title: '', content: '', mood: 'neutral', tags: [], xp: 50 });
        setShowForm(false);
        loadData();
      }
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to create entry:', error);
      const message = (error && typeof error === 'object' && 'message' in (error as Record<string, unknown>)) ? String((error as Record<string, unknown>).message) : String(error || 'Failed to create entry. Please try again.');
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteJournalEntry(id);
      setEntries(entries.filter(e => e.id !== id));
      loadData();
    } catch (error) {
      throw error;
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }));
  };

  if (loading && !stats) {
    return <LoadingPage message="Loading your adventure journal..." />;
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>📖 Adventure Journal</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>Track your coding journey and earn XP!</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm ? 'var(--bg-secondary)' : 'var(--accent-primary)',
            color: showForm ? 'var(--text-primary)' : 'white',
            border: showForm ? '2px solid var(--border-color)' : 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
          onMouseEnter={(e) => {
            if (!showForm) {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: 18 }}>{showForm ? '✖️' : '✨'}</span>
          {showForm ? 'Cancel' : 'New Entry'}
        </button>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24, padding: 16, background: 'var(--bg-secondary)', border: '2px solid var(--border-color)', borderRadius: 12 }}>
          <StatItem icon="📚" label="Total Entries" value={stats.total_entries} color="#3b82f6" />
          <StatItem icon="⭐" label="Total XP" value={stats.total_xp} color="#f59e0b" />
          <StatItem icon="📅" label="This Week" value={stats.entries_this_week} color="#10b981" />
          <StatItem icon="🔥" label="Streak" value={`${stats.recent_streak} days`} color="#ef4444" />
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', border: '2px solid var(--accent-primary)', borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>✨ Record Your Adventure</h3>

          {formError && (
            <div style={{ padding: 12, background: '#ef444420', border: '1px solid #ef4444', borderRadius: 8, color: '#ef4444', fontSize: 14, marginBottom: 16 }}>{formError}</div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
              placeholder="What did you accomplish today?"
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
              placeholder="Describe your journey in detail..."
              rows={6}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s', resize: 'vertical', fontFamily: 'inherit' }}
              onFocus={(e) => (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>How are you feeling? *</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MOOD_OPTIONS.map(mood => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: mood.value })}
                  style={{ padding: '8px 16px', background: formData.mood === mood.value ? `${mood.color}20` : 'var(--bg-primary)', border: `2px solid ${formData.mood === mood.value ? mood.color : 'var(--border-color)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: formData.mood === mood.value ? mood.color : 'var(--text-secondary)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span style={{ fontSize: 18 }}>{mood.emoji}</span>
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Tags (optional)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TAG_OPTIONS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{ padding: '6px 12px', background: formData.tags.includes(tag) ? 'var(--accent-primary)' : 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: formData.tags.includes(tag) ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>#{tag}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>XP Earned: <span style={{ color: '#f59e0b', fontSize: 16 }}>{formData.xp}</span></label>
            <input type="range" min="1" max="100" value={formData.xp} onChange={(e) => setFormData({ ...formData, xp: parseInt(e.currentTarget.value) })} style={{ width: '100%', height: 6, borderRadius: 3, outline: 'none', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              <span>1 XP</span>
              <span>100 XP</span>
            </div>
          </div>

          <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px', background: submitting ? 'var(--bg-tertiary)' : 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            {submitting ? '⏳ Saving...' : '🚀 Save Entry'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" value={search} onChange={(e) => setSearch(e.currentTarget.value)} placeholder="🔍 Search entries..." style={{ flex: '1 1 200px', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', outline: 'none' }} />

        <select value={moodFilter} onChange={(e) => setMoodFilter(e.currentTarget.value)} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}>
          <option value="">All Moods</option>
          {MOOD_OPTIONS.map(mood => (<option key={mood.value} value={mood.value}>{mood.emoji} {mood.label}</option>))}
        </select>

        <select value={tagFilter} onChange={(e) => setTagFilter(e.currentTarget.value)} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}>
          <option value="">All Tags</option>
          {TAG_OPTIONS.map(tag => (<option key={tag} value={tag}>#{tag}</option>))}
        </select>

        {(search || moodFilter || tagFilter) && (
          <button onClick={() => { setSearch(''); setMoodFilter(''); setTagFilter(''); }} style={{ padding: '10px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>Clear Filters</button>
        )}
      </div>

      {loading ? (
        <LoadingPage message="Loading entries..." />
      ) : entries.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: 'var(--bg-secondary)', border: '2px dashed var(--border-color)', borderRadius: 12 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>No entries yet</h3>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>{search || moodFilter || tagFilter ? 'No entries match your filters. Try adjusting them.' : 'Start your adventure by creating your first journal entry!'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {entries.map(entry => (<JournalEntry key={entry.id} entry={entry} onDelete={handleDelete} />))}
        </div>
      )}
    </div>
  );
}

function StatItem({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
    </div>
  );
}
