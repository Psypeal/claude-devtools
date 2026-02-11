/**
 * IPC Handlers - Orchestrates domain-specific handler modules.
 *
 * This module initializes and registers all IPC handlers from domain modules:
 * - projects.ts: Project listing and repository groups
 * - sessions.ts: Session operations and pagination
 * - search.ts: Session search functionality
 * - subagents.ts: Subagent detail retrieval
 * - validation.ts: Path validation and scroll handling
 * - utility.ts: Shell operations and file reading
 * - notifications.ts: Notification management
 * - config.ts: App configuration
 */

import { createLogger } from '@shared/utils/logger';
import { ipcMain } from 'electron';

import { registerConfigHandlers, removeConfigHandlers } from './config';

const logger = createLogger('IPC:handlers');
import { registerNotificationHandlers, removeNotificationHandlers } from './notifications';
import {
  initializeProjectHandlers,
  registerProjectHandlers,
  removeProjectHandlers,
} from './projects';
import { initializeSearchHandlers, registerSearchHandlers, removeSearchHandlers } from './search';
import {
  initializeSessionHandlers,
  registerSessionHandlers,
  removeSessionHandlers,
} from './sessions';
import {
  initializeSubagentHandlers,
  registerSubagentHandlers,
  removeSubagentHandlers,
} from './subagents';
import {
  initializeUpdaterHandlers,
  registerUpdaterHandlers,
  removeUpdaterHandlers,
} from './updater';
import { registerUtilityHandlers, removeUtilityHandlers } from './utility';
import { registerValidationHandlers, removeValidationHandlers } from './validation';

import type {
  ChunkBuilder,
  DataCache,
  ProjectScanner,
  SessionParser,
  SubagentResolver,
  UpdaterService,
} from '../services';

/**
 * Initializes IPC handlers with service instances.
 */
export function initializeIpcHandlers(
  scanner: ProjectScanner,
  parser: SessionParser,
  resolver: SubagentResolver,
  builder: ChunkBuilder,
  cache: DataCache,
  updater: UpdaterService
): void {
  // Initialize domain handlers with their required services
  initializeProjectHandlers(scanner);
  initializeSessionHandlers(scanner, parser, resolver, builder, cache);
  initializeSearchHandlers(scanner);
  initializeSubagentHandlers(builder, cache, parser, resolver);
  initializeUpdaterHandlers(updater);

  // Register all handlers
  registerProjectHandlers(ipcMain);
  registerSessionHandlers(ipcMain);
  registerSearchHandlers(ipcMain);
  registerSubagentHandlers(ipcMain);
  registerValidationHandlers(ipcMain);
  registerUtilityHandlers(ipcMain);
  registerNotificationHandlers(ipcMain);
  registerConfigHandlers(ipcMain);
  registerUpdaterHandlers(ipcMain);

  logger.info('All handlers registered');
}

/**
 * Removes all IPC handlers.
 * Should be called when shutting down.
 */
export function removeIpcHandlers(): void {
  removeProjectHandlers(ipcMain);
  removeSessionHandlers(ipcMain);
  removeSearchHandlers(ipcMain);
  removeSubagentHandlers(ipcMain);
  removeValidationHandlers(ipcMain);
  removeUtilityHandlers(ipcMain);
  removeNotificationHandlers(ipcMain);
  removeConfigHandlers(ipcMain);
  removeUpdaterHandlers(ipcMain);

  logger.info('All handlers removed');
}
