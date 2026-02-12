<p align="center">
  <img src="resources/icons/png/1024x1024.png" alt="claude-devtools" width="120" />
</p>

<h1 align="center">claude-devtools</h1>

<p align="center">
  <strong>Stop guessing. See exactly what Claude is doing.</strong>
  <br />
  A desktop app that turns Claude Code's opaque session logs into a visual, searchable, actionable interface.
</p>

<br />

<p align="center">
  <!-- TODO: Replace with actual demo GIF/video -->
  <img src="resources/demo.gif" alt="claude-devtools Demo" width="900" />
</p>

---

## Why This Exists

There are many GUI wrappers for Claude Code — Conductor, Craft Agents, Vibe Kanban, 1Code, ccswitch, and others. I tried them all. None of them solved the actual problem:

**They wrap Claude Code.** They inject their own prompts, add their own abstractions, and change how Claude behaves. If you love the terminal — and I do — you don't want that. You want Claude Code exactly as it is.

**They only show their own sessions.** Run something in the terminal? It doesn't exist in their UI. You can only see what was executed through *their* tool. The terminal and the GUI are two separate worlds.

**You can't debug what went wrong.** A session failed — but why? The context filled up too fast — but what consumed it? A subagent spawned 5 child agents — but what did they do? Even in the terminal, scrolling back through a long session to reconstruct what happened is nearly impossible.

**You can't monitor what matters.** Want to know when Claude reads `.env`? When a single tool call exceeds 4K tokens of context? When a teammate sends a shutdown request? You'd have to wire up hooks manually, every time, for every project.

**claude-devtools takes a different approach.** It doesn't wrap or modify Claude Code at all. It reads the session logs that already exist on your machine (`~/.claude/`) and turns them into a rich, interactive interface — regardless of whether the session ran in the terminal, in an IDE, or through another tool.

> Zero configuration. No API keys. Works with every session you've ever run.

---

## Key Features

### :mag: Visible Context Tracking

See exactly what's eating your context window. The **Session Context Panel** breaks down token usage across 6 categories — CLAUDE.md files, @-mentioned files, tool outputs, extended thinking, team coordination, and user messages — so you can instantly identify what's consuming tokens and optimize your workflow.

### :hammer_and_wrench: Rich Tool Call Inspector

Every tool call is paired with its result in an expandable card. Specialized viewers render each tool natively:
- **Read** calls show syntax-highlighted code with line numbers
- **Edit** calls show inline diffs with added/removed highlighting
- **Bash** calls show command output
- **Subagent** calls show the full execution tree, expandable in-place

### :bell: Custom Notification Triggers

Define rules for when you want to be notified. Match on regex patterns, assign colors, and filter your inbox by trigger. Built-in triggers catch common errors out of the box; add your own for project-specific patterns.

### :busts_in_silhouette: Team & Subagent Visualization

When Claude uses multi-agent orchestration, see the full picture. Teammate messages render as color-coded cards. Subagent sessions are expandable inline with their own execution traces, metrics, and tool calls.

### :zap: Command Palette & Cross-Session Search

Hit **Cmd+K** for a Spotlight-style command palette. Search across all sessions in a project — results show context snippets with highlighted keywords. Navigate directly to the exact message.

### :bar_chart: Multi-Pane Layout

Open multiple sessions side-by-side. Drag-and-drop tabs between panes, split views, and compare sessions in parallel — like a proper IDE for your AI conversations.

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 10+
- macOS or Windows

### Install & Run

```bash
git clone https://github.com/matt1398/claude-devtools.git
cd claude-devtools
pnpm install
pnpm dev
```

That's it. The app auto-discovers your Claude Code projects from `~/.claude/`.

### Build for Distribution

```bash
pnpm dist:mac     # macOS (.dmg)
pnpm dist:win     # Windows (.exe)
pnpm dist         # Both platforms
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development with hot reload |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint:fix` | Lint and auto-fix |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Watch mode |
| `pnpm test:coverage` | Coverage report |
| `pnpm check` | Full quality gate (types + lint + test + build) |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines. Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

IPC handlers validate all inputs with strict path containment checks. File reads are constrained to the project root and `~/.claude`. Sensitive credential paths are blocked. See [SECURITY.md](SECURITY.md) for details.

## License

[MIT](LICENSE)
