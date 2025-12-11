/**
 * ScreenshotManager Component
 * Handles screenshot file uploads, URL inputs, and deletion
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { ErrorMessage } from 'formik';
import { deleteToolScreenshot, getCsrf } from '../../lib/api';

interface ScreenshotManagerProps {
  screenshots: string[];
  toolId?: number;
  onScreenshotsChange: (screenshots: string[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function ScreenshotManager({
  screenshots,
  toolId,
  onScreenshotsChange,
  fileInputRef
}: ScreenshotManagerProps): React.ReactElement {
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [deleting, setDeleting] = useState<boolean>(false);

  const hasStatus = (e: unknown): e is { status: number } => {
    if (typeof e !== 'object' || e === null) return false;
    const maybe = e as Record<string, unknown>;
    return 'status' in maybe && typeof maybe.status === 'number';
  };

  const handleAddUrl = () => {
    const url = (screenshotUrl || '').trim();
    if (!url) return;

    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    const newScreenshots = [...screenshots, url];
    onScreenshotsChange(newScreenshots);
    setScreenshotUrl('');
  };

  const handleDelete = async (screenshotUrl: string) => {
    if (!toolId) {
      onScreenshotsChange(screenshots.filter(x => x !== screenshotUrl));
      return;
    }

    if (!confirm('Delete this screenshot?')) return;

    setDeleting(true);
    try {
      const body = await deleteToolScreenshot(toolId, screenshotUrl);
      const updated = body?.screenshots || screenshots.filter(x => x !== screenshotUrl);
      onScreenshotsChange(updated);
    } catch (err: unknown) {
      if (hasStatus(err) && err.status === 401) {
        try {
          await getCsrf();
          const body2 = await deleteToolScreenshot(toolId, screenshotUrl);
          const updated2 = body2?.screenshots || screenshots.filter(x => x !== screenshotUrl);
          onScreenshotsChange(updated2);
        } catch (err2: unknown) {
          console.error('Retry delete after CSRF refresh failed', err2);
          alert('Failed to delete screenshot (unauthenticated). Please sign in and try again.');
        }
      } else {
        console.error('Delete screenshot error', err);
        alert((err instanceof Error && err.message) ? err.message : 'Failed to delete screenshot');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ display: 'block', fontWeight: 600 }}>
        Screenshots (optional) {screenshots.length > 0 && `(${screenshots.length}/10)`}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ marginTop: 8 }}
      />
      <ErrorMessage name="screenshots" component="div" className="error" />

      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <input
          value={screenshotUrl}
          onChange={e => setScreenshotUrl(e.target.value)}
          placeholder="Image URL"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="button" onClick={handleAddUrl} style={{ padding: '8px 10px' }}>
          Add
        </button>
      </div>

      {screenshots.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {screenshots.map((s: string) => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Image
                src={s}
                alt="screenshot"
                width={120}
                height={80}
                style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              <button
                type="button"
                onClick={() => handleDelete(s)}
                disabled={deleting}
                style={{ marginTop: 6 }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
