/**
 * Infrastructure services - Core application infrastructure.
 *
 * Exports:
 * - DataCache: LRU cache with TTL for parsed session data
 * - FileWatcher: Watches for file changes with debouncing
 * - ConfigManager: App configuration management
 * - TriggerManager: Notification trigger management (used internally by ConfigManager)
 * - NotificationManager: Notification handling and persistence
 */

export * from './ConfigManager';
export * from './DataCache';
export * from './FileWatcher';
export * from './NotificationManager';
export * from './TriggerManager';
export * from './UpdaterService';
