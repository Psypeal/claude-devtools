/**
 * Main process entry point for claude-devtools.
 *
 * Responsibilities:
 * - Initialize Electron app and main window
 * - Set up IPC handlers for data access
 * - Initialize ServiceContextRegistry with local context
 * - Start file watcher for live updates
 * - Manage application lifecycle
 */

import {
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
  DEV_SERVER_PORT,
  getTrafficLightPositionForZoom,
  WINDOW_ZOOM_FACTOR_CHANGED_CHANNEL,
} from '@shared/constants';
import { createLogger } from '@shared/utils/logger';
import { app, BrowserWindow } from 'electron';
import { join } from 'path';

import { initializeIpcHandlers, removeIpcHandlers } from './ipc/handlers';

// Icon path - works for both dev and production
const getIconPath = (): string => {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    return join(process.cwd(), 'resources/icon.png');
  }
  return join(__dirname, '../../resources/icon.png');
};

const logger = createLogger('App');
import { SSH_STATUS } from '@preload/constants/ipcChannels';

import {
  configManager,
  LocalFileSystemProvider,
  NotificationManager,
  ServiceContext,
  ServiceContextRegistry,
  SshConnectionManager,
  UpdaterService,
} from './services';

// =============================================================================
// Application State
// =============================================================================

let mainWindow: BrowserWindow | null = null;

// Service registry and global services
let contextRegistry: ServiceContextRegistry;
let notificationManager: NotificationManager;
let updaterService: UpdaterService;
let sshConnectionManager: SshConnectionManager;

// File watcher event cleanup functions
let fileChangeCleanup: (() => void) | null = null;
let todoChangeCleanup: (() => void) | null = null;

/**
 * Wires file watcher events from a ServiceContext to the renderer.
 * Cleans up previous listeners before adding new ones.
 */
function wireFileWatcherEvents(context: ServiceContext): void {
  logger.info(`Wiring FileWatcher events for context: ${context.id}`);

  // Clean up previous listeners
  if (fileChangeCleanup) {
    fileChangeCleanup();
    fileChangeCleanup = null;
  }
  if (todoChangeCleanup) {
    todoChangeCleanup();
    todoChangeCleanup = null;
  }

  // Wire file-change events
  const fileChangeHandler = (event: unknown) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('file-change', event);
    }
  };
  context.fileWatcher.on('file-change', fileChangeHandler);
  fileChangeCleanup = () => context.fileWatcher.off('file-change', fileChangeHandler);

  // Wire todo-change events
  const todoChangeHandler = (event: unknown) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('todo-change', event);
    }
  };
  context.fileWatcher.on('todo-change', todoChangeHandler);
  todoChangeCleanup = () => context.fileWatcher.off('todo-change', todoChangeHandler);

  logger.info(`FileWatcher events wired for context: ${context.id}`);
}

/**
 * Callback invoked when context switches (called by SSH IPC handler).
 * Re-wires file watcher events and notifies renderer.
 */
export function onContextSwitched(context: ServiceContext): void {
  // Re-wire file watcher events to new context
  wireFileWatcherEvents(context);

  // Notify renderer of context change
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(SSH_STATUS, sshConnectionManager.getStatus());
    mainWindow.webContents.send('context-changed', {
      contextId: context.id,
      type: context.type,
    });
  }
}

/**
 * Initializes all services.
 */
function initializeServices(): void {
  logger.info('Initializing services...');

  // Initialize SSH connection manager
  sshConnectionManager = new SshConnectionManager();

  // Create ServiceContextRegistry
  contextRegistry = new ServiceContextRegistry();

  // Create local context
  const localContext = new ServiceContext({
    id: 'local',
    type: 'local',
    fsProvider: new LocalFileSystemProvider(),
  });

  // Register and start local context
  contextRegistry.registerContext(localContext);
  localContext.start();

  logger.info(`Projects directory: ${localContext.projectScanner.getProjectsDir()}`);

  // Initialize notification manager (singleton, not context-scoped)
  notificationManager = NotificationManager.getInstance();

  // Set notification manager on local context's file watcher
  localContext.fileWatcher.setNotificationManager(notificationManager);

  // Wire file watcher events for local context
  wireFileWatcherEvents(localContext);

  // Initialize updater service
  updaterService = new UpdaterService();

  // Initialize IPC handlers with registry
  initializeIpcHandlers(contextRegistry, updaterService, sshConnectionManager);

  // Forward SSH state changes to renderer
  sshConnectionManager.on('state-change', (status: unknown) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(SSH_STATUS, status);
    }
  });

  logger.info('Services initialized successfully');
}

/**
 * Shuts down all services.
 */
function shutdownServices(): void {
  logger.info('Shutting down services...');

  // Clean up file watcher event listeners
  if (fileChangeCleanup) {
    fileChangeCleanup();
    fileChangeCleanup = null;
  }
  if (todoChangeCleanup) {
    todoChangeCleanup();
    todoChangeCleanup = null;
  }

  // Dispose all contexts (including local)
  if (contextRegistry) {
    contextRegistry.dispose();
  }

  // Dispose SSH connection manager
  if (sshConnectionManager) {
    sshConnectionManager.dispose();
  }

  // Remove IPC handlers
  removeIpcHandlers();

  logger.info('Services shut down successfully');
}

/**
 * Update native traffic-light position and notify renderer of the current zoom factor.
 */
function syncTrafficLightPosition(win: BrowserWindow): void {
  const zoomFactor = win.webContents.getZoomFactor();
  const position = getTrafficLightPositionForZoom(zoomFactor);
  win.setWindowButtonPosition(position);
  win.webContents.send(WINDOW_ZOOM_FACTOR_CHANGED_CHANNEL, zoomFactor);
}

/**
 * Creates the main application window.
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
    icon: getIconPath(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#1a1a1a',
    titleBarStyle: 'hidden',
    trafficLightPosition: getTrafficLightPositionForZoom(1),
    title: 'claude-devtools',
  });

  // Load the renderer
  if (process.env.NODE_ENV === 'development') {
    void mainWindow.loadURL(`http://localhost:${DEV_SERVER_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Set traffic light position + notify renderer on first load, and auto-check for updates
  mainWindow.webContents.on('did-finish-load', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      syncTrafficLightPosition(mainWindow);
      // Auto-check for updates 3 seconds after window loads
      setTimeout(() => updaterService.checkForUpdates(), 3000);
    }
  });

  // Sync traffic light position when zoom changes (Cmd+/-, Cmd+0)
  // zoom-changed event doesn't fire in Electron 40, so we detect zoom keys directly.
  // Also keeps zoom bounds within a practical readability range.
  const MIN_ZOOM_LEVEL = -3; // ~70%
  const MAX_ZOOM_LEVEL = 5;
  const ZOOM_IN_KEYS = new Set(['+', '=']);
  const ZOOM_OUT_KEYS = new Set(['-', '_']);
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (!input.meta || input.type !== 'keyDown') return;

    const currentLevel = mainWindow.webContents.getZoomLevel();

    // Block zoom-out beyond minimum
    if (ZOOM_OUT_KEYS.has(input.key) && currentLevel <= MIN_ZOOM_LEVEL) {
      event.preventDefault();
      return;
    }
    // Block zoom-in beyond maximum
    if (ZOOM_IN_KEYS.has(input.key) && currentLevel >= MAX_ZOOM_LEVEL) {
      event.preventDefault();
      return;
    }

    // For zoom keys (including Cmd+0 reset), defer sync until zoom is applied
    if (ZOOM_IN_KEYS.has(input.key) || ZOOM_OUT_KEYS.has(input.key) || input.key === '0') {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          syncTrafficLightPosition(mainWindow);
        }
      }, 100);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Clear main window references
    if (notificationManager) {
      notificationManager.setMainWindow(null);
    }
    if (updaterService) {
      updaterService.setMainWindow(null);
    }
  });

  // Handle renderer process crashes (render-process-gone replaces deprecated 'crashed' event)
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    logger.error('Renderer process gone:', details.reason, details.exitCode);
    // Could show an error dialog or attempt to reload the window
  });

  // Set main window reference for notification manager and updater
  if (notificationManager) {
    notificationManager.setMainWindow(mainWindow);
  }
  if (updaterService) {
    updaterService.setMainWindow(mainWindow);
  }

  logger.info('Main window created');
}

/**
 * Application ready handler.
 */
void app.whenReady().then(() => {
  logger.info('App ready, initializing...');

  // Initialize services first
  initializeServices();

  // Apply configuration settings
  const config = configManager.getConfig();

  // Apply launch at login setting
  app.setLoginItemSettings({
    openAtLogin: config.general.launchAtLogin,
  });

  // Apply dock visibility and icon (macOS)
  if (process.platform === 'darwin') {
    if (!config.general.showDockIcon) {
      app.dock?.hide();
    }
    // Set dock icon
    app.dock?.setIcon(getIconPath());
  }

  // Then create window
  createWindow();

  // Listen for notification click events
  notificationManager.on('notification-clicked', (_error) => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * All windows closed handler.
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Before quit handler - cleanup.
 */
app.on('before-quit', () => {
  shutdownServices();
});
