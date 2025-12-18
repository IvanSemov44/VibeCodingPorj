import { fetchWithAuth, parseJson } from '../fetch';

export async function getComments(toolId: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/tools/${toolId}/comments`);
  return await parseJson(res as unknown as Response);
}

export async function postComment(
  toolId: string | number,
  content: string,
  parent_id?: number,
): Promise<unknown> {
  const res = await fetchWithAuth(`/api/tools/${toolId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, parent_id }),
  });
  return await parseJson(res as unknown as Response);
}

export async function deleteComment(commentId: number): Promise<void> {
  await fetchWithAuth(`/api/comments/${commentId}`, { method: 'DELETE' });
}

export async function rateTool(
  toolId: string | number,
  score: number,
  review?: string,
): Promise<unknown> {
  const res = await fetchWithAuth(`/api/tools/${toolId}/rating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, review }),
  });
  return await parseJson(res as unknown as Response);
}

export async function deleteRating(toolId: string | number): Promise<void> {
  await fetchWithAuth(`/api/tools/${toolId}/rating`, { method: 'DELETE' });
}
