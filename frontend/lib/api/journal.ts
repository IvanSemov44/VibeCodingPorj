import type {
  JournalEntry,
  JournalStats,
  JournalCreatePayload,
  JournalUpdatePayload,
} from '../types';
import { fetchWithAuth, parseJson, parseListResponse } from './fetch';

export async function getJournalEntries(
  params: Record<string, string | number | boolean> = {},
): Promise<JournalEntry[]> {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>(
      (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
      {},
    ),
  ).toString();
  const res = await fetchWithAuth(`/api/journal${qs ? '?' + qs : ''}`);
  return (await parseListResponse<JournalEntry>(res)).data;
}

export async function createJournalEntry(data: JournalCreatePayload): Promise<JournalEntry> {
  const res = await fetchWithAuth(`/api/journal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson<JournalEntry>(res);
}

export async function updateJournalEntry(
  id: number | string,
  data: JournalUpdatePayload,
): Promise<JournalEntry> {
  const res = await fetchWithAuth(`/api/journal/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson<JournalEntry>(res);
}

export async function deleteJournalEntry(id: number | string): Promise<void> {
  const res = await fetchWithAuth(`/api/journal/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseJson(res as unknown as Response);
}

export async function getJournalStats(): Promise<JournalStats> {
  const res = await fetchWithAuth(`/api/journal/stats`);
  return await parseJson<JournalStats>(res);
}
