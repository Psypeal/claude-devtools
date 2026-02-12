/**
 * useContextSwitch - Hook for context switching actions.
 *
 * Thin wrapper exposing context switch functionality to components.
 */

import { useCallback } from 'react';

import { useStore } from '../store';

export function useContextSwitch() {
  const switchContext = useStore((state) => state.switchContext);
  const isContextSwitching = useStore((state) => state.isContextSwitching);
  const activeContextId = useStore((state) => state.activeContextId);

  const handleSwitch = useCallback(
    async (targetContextId: string) => {
      await switchContext(targetContextId);
    },
    [switchContext]
  );

  return {
    switchContext: handleSwitch,
    isContextSwitching,
    activeContextId,
  };
}
