/**
 * Context IPC Handlers - Manages context switching and listing.
 *
 * Channels:
 * - context:list - List all available contexts (local + SSH)
 * - context:getActive - Get current active context ID
 * - context:switch - Switch to a different context
 */

import {
  CONTEXT_CHANGED,
  CONTEXT_GET_ACTIVE,
  CONTEXT_LIST,
  CONTEXT_SWITCH,
} from '@preload/constants/ipcChannels';
import { createLogger } from '@shared/utils/logger';

import type { ServiceContext, ServiceContextRegistry } from '../services';
import type { IpcMain } from 'electron';

const logger = createLogger('IPC:context');

// =============================================================================
// Module State
// =============================================================================

let registry: ServiceContextRegistry;
let onContextSwitched: (context: ServiceContext) => void;

// =============================================================================
// Initialization
// =============================================================================

/**
 * Initialize context handlers with required services.
 * @param contextRegistry - The service context registry
 * @param onSwitched - Callback to invoke after successful context switch
 */
export function initializeContextHandlers(
  contextRegistry: ServiceContextRegistry,
  onSwitched: (context: ServiceContext) => void
): void {
  registry = contextRegistry;
  onContextSwitched = onSwitched;
}

// =============================================================================
// Handler Registration
// =============================================================================

export function registerContextHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(CONTEXT_LIST, async () => {
    try {
      const contexts = registry.list();
      return { success: true, data: contexts };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('Failed to list contexts:', message);
      return { success: false, error: message };
    }
  });

  ipcMain.handle(CONTEXT_GET_ACTIVE, async () => {
    try {
      const activeContextId = registry.getActiveContextId();
      return { success: true, data: activeContextId };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('Failed to get active context:', message);
      return { success: false, error: message };
    }
  });

  ipcMain.handle(CONTEXT_SWITCH, async (_event, contextId: string) => {
    try {
      // Switch to the new context
      const { current } = registry.switch(contextId);

      // Invoke the context switched callback (re-wires file watcher events)
      onContextSwitched(current);

      return { success: true, data: { contextId } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`Context switch to "${contextId}" failed:`, message);
      return { success: false, error: message };
    }
  });

  logger.info('Context handlers registered');
}

export function removeContextHandlers(ipcMain: IpcMain): void {
  ipcMain.removeHandler(CONTEXT_LIST);
  ipcMain.removeHandler(CONTEXT_GET_ACTIVE);
  ipcMain.removeHandler(CONTEXT_SWITCH);
}
