# Roadmap: SSH Multi-Context Workspaces

## Overview

This roadmap transforms claude-devtools from a single-mode application (local XOR SSH) into a true multi-context workspace system where local mode is always alive and each SSH connection is an independent, switchable workspace with full state preservation. Phase 1 fixes the critical "no conversation history" bug by plumbing FileSystemProvider through all parsing services. Phase 2 establishes ServiceContextRegistry infrastructure to manage multiple independent service contexts. Phase 3 implements snapshot-based state management for instant context switching. Phase 4 delivers the workspace switcher UI and connection profiles.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Provider Plumbing** - Fix SSH session parsing and subagent loading ✓ 2026-02-12
- [x] **Phase 2: Service Infrastructure** - ServiceContextRegistry and IPC context API ✓ 2026-02-12
- [x] **Phase 3: State Management** - Snapshot/restore system for instant switching ✓ 2026-02-12
- [ ] **Phase 4: Workspace UI** - Context switcher and connection profiles

## Phase Details

### Phase 1: Provider Plumbing
**Goal**: SSH sessions display full conversation history and subagent drill-down works correctly
**Depends on**: Nothing (first phase)
**Requirements**: PROV-01, PROV-02
**Success Criteria** (what must be TRUE):
  1. User can open an SSH session and see full conversation history (not "No conversation history" message)
  2. User can drill down into subagents within SSH sessions and view their execution details
  3. JSONL file parsing uses SSH FileSystemProvider when in SSH mode (not falling back to local filesystem)
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — Thread FileSystemProvider through parsing stack (SessionParser, SubagentResolver, SubagentDetailBuilder) ✓

### Phase 2: Service Infrastructure
**Goal**: Multiple service contexts coexist with proper lifecycle management and IPC routing
**Depends on**: Phase 1
**Requirements**: SCTX-01, SCTX-02, SCTX-03, SCTX-04, SCTX-05, IPC-01, IPC-02, IPC-03
**Success Criteria** (what must be TRUE):
  1. User can connect to SSH without destroying local service context (local projects/sessions remain available)
  2. Multiple SSH connections can exist simultaneously with independent service instances
  3. Switching between contexts routes IPC requests to the correct service context
  4. Disconnecting SSH and reconnecting later restores the same SSH context (not recreated from scratch)
  5. File watcher events only fire for the active context (no cross-context pollution)
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — ServiceContext bundle class, ServiceContextRegistry coordinator, and dispose() methods for FileWatcher/DataCache ✓
- [x] 02-02-PLAN.md — Wire registry into main/index.ts and update all IPC handlers to route via registry ✓
- [x] 02-03-PLAN.md — Context management IPC channels, preload bridge, and connection profiles in ConfigManager ✓

### Phase 3: State Management
**Goal**: Context switching preserves exact UI state per workspace with instant restoration
**Depends on**: Phase 2
**Requirements**: SNAP-01, SNAP-02, SNAP-03, SNAP-04, SNAP-05
**Success Criteria** (what must be TRUE):
  1. User can switch from local to SSH and back, returning to exact same state (open tabs, selected project, scroll position, sidebar selections)
  2. First-time switch to new SSH context shows empty state (not stale local data)
  3. Previously visited context restores instantly without refetching data
  4. Loading overlay prevents stale data flash during context switch
  5. Context snapshots survive app restart (stored in IndexedDB)
**Plans**: 1 plan

Plans:
- [x] 03-01-PLAN.md — Context snapshot system: contextSlice, IndexedDB storage, overlay, validation, and store wiring ✓

### Phase 4: Workspace UI
**Goal**: Users can visually manage and switch between workspaces with clear status indicators
**Depends on**: Phase 3
**Requirements**: WSUI-01, WSUI-02, WSUI-03, WSUI-04, WSUI-05
**Success Criteria** (what must be TRUE):
  1. User sees context switcher in sidebar listing Local + all SSH workspaces
  2. Status bar shows active workspace name and connection status at all times
  3. Connection status indicators clearly show connected/connecting/disconnected/error states with distinct visual treatment
  4. User can save SSH connection as a profile, then reconnect to it later without re-entering credentials
  5. User can switch workspaces using keyboard shortcut (Cmd/Ctrl+K or similar)
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md — ContextSwitcher dropdown, ConnectionStatusBadge, SidebarHeader integration, and Cmd+Shift+K shortcut
- [ ] 04-02-PLAN.md — WorkspaceSection settings for SSH profile CRUD with auto-refresh

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Provider Plumbing | 1/1 | ✓ Complete | 2026-02-12 |
| 2. Service Infrastructure | 3/3 | ✓ Complete | 2026-02-12 |
| 3. State Management | 1/1 | ✓ Complete | 2026-02-12 |
| 4. Workspace UI | 0/2 | Not started | - |

---
*Roadmap created: 2026-02-12*
*Last updated: 2026-02-12 after Phase 4 planning complete*
