/**
 * UpdateDialog - Modal dialog shown when a new version is available.
 *
 * Prompts the user to download the update or dismiss it.
 */

import { useStore } from '@renderer/store';
import { Download, X } from 'lucide-react';

export const UpdateDialog = (): React.JSX.Element | null => {
  const showUpdateDialog = useStore((s) => s.showUpdateDialog);
  const availableVersion = useStore((s) => s.availableVersion);
  const releaseNotes = useStore((s) => s.releaseNotes);
  const downloadUpdate = useStore((s) => s.downloadUpdate);
  const dismissUpdateDialog = useStore((s) => s.dismissUpdateDialog);

  if (!showUpdateDialog) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={dismissUpdateDialog}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-lg border p-6 shadow-xl"
        style={{
          backgroundColor: 'var(--color-surface-overlay)',
          borderColor: 'var(--color-border-emphasis)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismissUpdateDialog}
          className="absolute right-3 top-3 rounded p-1 transition-colors hover:bg-white/10"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X className="size-4" />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          Update Available
        </h2>

        {/* Body */}
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Version {availableVersion} is available. Would you like to download it?
        </p>

        {/* Release notes */}
        {releaseNotes && (
          <div
            className="mt-3 max-h-40 overflow-y-auto rounded border p-3 text-xs"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {releaseNotes}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={dismissUpdateDialog}
            className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Later
          </button>
          <button
            onClick={downloadUpdate}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            <Download className="size-4" />
            Download Update
          </button>
        </div>
      </div>
    </div>
  );
};
