/**
 * ScreenshotManager Component
 * Handles screenshot file uploads, URL inputs, and deletion
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { ErrorMessage } from 'formik';
import { useDeleteToolScreenshotMutation } from '../../store/domains';
import { useGetCsrfMutation } from '../../store/domains';

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
  fileInputRef,
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

  const [deleteTrigger] = useDeleteToolScreenshotMutation();
  const [csrfTrigger] = useGetCsrfMutation();

  const handleDelete = async (screenshotUrl: string) => {
    if (!toolId) {
      onScreenshotsChange(screenshots.filter((x) => x !== screenshotUrl));
      return;
    }

    if (!confirm('Delete this screenshot?')) return;

    setDeleting(true);
    try {
      const body = await deleteTrigger({ id: toolId, url: screenshotUrl }).unwrap();
      const updated = body?.screenshots || screenshots.filter((x) => x !== screenshotUrl);
      onScreenshotsChange(updated);
    } catch (err: unknown) {
      if (hasStatus(err) && err.status === 401) {
        try {
          await csrfTrigger().unwrap();
          const body2 = await deleteTrigger({ id: toolId, url: screenshotUrl }).unwrap();
          const updated2 = body2?.screenshots || screenshots.filter((x) => x !== screenshotUrl);
          onScreenshotsChange(updated2);
        } catch (err2: unknown) {
          console.error('Retry delete after CSRF refresh failed', err2);
          alert('Failed to delete screenshot (unauthenticated). Please sign in and try again.');
        }
      } else {
        console.error('Delete screenshot error', err);
        alert(err instanceof Error && err.message ? err.message : 'Failed to delete screenshot');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-3">
      <label className="block font-semibold mb-1 text-sm text-primary-text">
        Screenshots (optional) {screenshots.length > 0 && `(${screenshots.length}/10)`}
      </label>

      <input ref={fileInputRef} type="file" multiple accept="image/*" className="mt-2 text-sm" />
      <ErrorMessage name="screenshots" component="div" className="error" />

      <div className="mt-2 flex gap-2">
        <input
          value={screenshotUrl}
          onChange={(e) => setScreenshotUrl(e.target.value)}
          placeholder="Image URL"
          className="flex-1 px-3 py-2 bg-primary-bg border border-border rounded-md text-sm text-primary-text outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-4 py-2 bg-accent text-white border-none rounded-md cursor-pointer font-medium transition-opacity hover:opacity-90"
        >
          Add
        </button>
      </div>

      {screenshots.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {screenshots.map((s: string) => (
            <div key={s} className="flex flex-col items-center">
              <Image
                src={s}
                alt="screenshot"
                width={120}
                height={80}
                className="object-cover rounded-md border border-gray-300"
              />
              <button
                type="button"
                onClick={() => handleDelete(s)}
                disabled={deleting}
                className="mt-1.5 px-2.5 py-1 bg-red-500 text-white border-none rounded cursor-pointer text-xs transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
