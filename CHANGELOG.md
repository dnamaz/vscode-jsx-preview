# Changelog

## [0.2.4] — 2026-04-02

### Added

- **Live log streaming** — when `outputPath` is provided, the command is automatically wrapped with `tee` so stdout and stderr are captured to `run.log` and streamed line-by-line to the webview (`pipelineLog` message) and the "JSX Preview" Output Channel as the process runs.
- **Exit code capture** — the shell exit code is written to `exit_code.txt` on completion. The extension watches this file and posts a `pipelineComplete` message to the webview with the numeric `exitCode`.
- **Stop/cancel** — the webview can send a `stopPipeline` message to interrupt the running process with Ctrl+C, targeting the correct terminal by name.
- **Multiple named terminals** — `runInTerminal` messages now accept an optional `terminalName` field. Each unique name creates or reuses its own terminal, enabling parallel pipeline stages in separate terminals. Default is `"JSX Preview"`.
- **Configurable result file names** — `runInTerminal` messages now accept optional `statusFile` and `detailFile` fields (defaults: `status.txt`, `detail.txt`) so the result file watcher is not tied to any specific naming convention.
- **Output Channel visibility** — the "JSX Preview" Output Channel is revealed (without stealing focus) when a pipeline starts, so log output is immediately visible.

### Changed

- `getOrCreateTerminal` now accepts a `name` parameter (default: `"JSX Preview"`).
- Per-panel run state (`logOffset`, `terminalName`) is tracked in `panelRunState` and cleaned up on panel disposal.
- File watcher setup is consolidated via a `makeWatcher` helper to reduce repetition.

---

## [0.2.2] — 2026-04-02

### Added

- Terminal integration — webview can send `runInTerminal` messages to execute shell commands in a dedicated VS Code terminal.
- Results panel — file watchers monitor configurable status (KEY: VALUE format) and detail (JSONL format) files in the output directory and post parsed results back to the webview as `pipelineResults` messages.
- Extension output channel logs pipeline activity and bundle errors.

---

## [0.2.1] — 2026-04-01

### Fixed

- Cursor webview ServiceWorker CSP error — added `worker-src 'self' blob:` to the Content-Security-Policy header.

---

## [0.2.0]

### Added

- Initial public release.
- Live side-by-side JSX/TSX preview with esbuild bundling.
- Auto-refresh on save (component file and all imports).
- Resolves `node_modules` from the component's project tree.
- Multiple preview panels.
- Error overlay for build failures.
- Keyboard shortcut: Cmd+Shift+J / Ctrl+Shift+J.
