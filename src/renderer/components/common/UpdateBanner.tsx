/**
 * UpdateBanner - Slim top banner for download progress and restart prompt.
 *
 * Visible during download and after the update is ready to install.
 */

import { useStore } from '@renderer/store';
import { CheckCircle, Loader2, X } from 'lucide-react';

export const UpdateBanner = (): React.JSX.Element | null => {
  const showUpdateBanner = useStore((s) => s.showUpdateBanner);
  const updateStatus = useStore((s) => s.updateStatus);
  const downloadProgress = useStore((s) => s.downloadProgress);
  const availableVersion = useStore((s) => s.availableVersion);
  const installUpdate = useStore((s) => s.installUpdate);
  const dismissUpdateBanner = useStore((s) => s.dismissUpdateBanner);

  if (!showUpdateBanner || (updateStatus !== 'downloading' && updateStatus !== 'downloaded')) {
    return null;
  }

  const isDownloading = updateStatus === 'downloading';
  const percent = Math.round(downloadProgress);

  return (
    <div
      className="relative flex items-center gap-3 border-b px-4 py-2 text-sm"
      style={{
        backgroundColor: 'var(--color-surface-raised)',
        borderColor: 'var(--color-border)',
      }}
    >
      {isDownloading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin text-blue-400" />
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Downloading update... {percent}%
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <CheckCircle className="size-4 shrink-0 text-green-400" />
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Update ready{availableVersion ? ` (v${availableVersion})` : ''}
          </span>
          <button
            onClick={installUpdate}
            className="ml-auto rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-500"
          >
            Restart to Update
          </button>
        </>
      )}

      {/* Dismiss */}
      <button
        onClick={dismissUpdateBanner}
        className="shrink-0 rounded p-0.5 transition-colors hover:bg-white/10"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
};
