import * as vscode from "vscode";
import * as esbuild from "esbuild";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const panels = new Map<string, vscode.WebviewPanel>();
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("JSX Preview");

  const openCmd = vscode.commands.registerCommand("jsxPreview.open", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !/\.(jsx|tsx)$/.test(editor.document.fileName)) {
      vscode.window.showWarningMessage("Open a .jsx or .tsx file first.");
      return;
    }
    openPreview(editor.document, context);
  });

  const onSave = vscode.workspace.onDidSaveTextDocument((doc) => {
    if (/\.(jsx|tsx)$/.test(doc.fileName) && panels.has(doc.fileName)) {
      updatePreview(doc.fileName, context);
    }
  });

  // Also refresh when any file imported by a previewed component changes
  const onAnyJsSave = vscode.workspace.onDidSaveTextDocument((doc) => {
    if (/\.(js|jsx|ts|tsx|css|json)$/.test(doc.fileName)) {
      for (const filePath of panels.keys()) {
        if (filePath !== doc.fileName) {
          updatePreview(filePath, context);
        }
      }
    }
  });

  context.subscriptions.push(openCmd, onSave, onAnyJsSave, outputChannel);
}

// ─── Preview lifecycle ────────────────────────────────────────────

async function openPreview(
  doc: vscode.TextDocument,
  ctx: vscode.ExtensionContext
) {
  const filePath = doc.fileName;
  const existing = panels.get(filePath);
  if (existing) {
    existing.reveal(vscode.ViewColumn.Beside);
    await updatePreview(filePath, ctx);
    return;
  }

  const name = path.basename(filePath).replace(/\.(jsx|tsx)$/, "");
  const panel = vscode.window.createWebviewPanel(
    "jsxPreview",
    `⚛ ${name}`,
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(os.tmpdir()),
        vscode.Uri.file(path.dirname(filePath)),
        vscode.Uri.file(ctx.extensionPath),
      ],
    }
  );

  panels.set(filePath, panel);
  panel.onDidDispose(() => panels.delete(filePath));

  await updatePreview(filePath, ctx);
}

async function updatePreview(filePath: string, ctx: vscode.ExtensionContext) {
  const panel = panels.get(filePath);
  if (!panel) return;

  try {
    const bundle = await bundleJsx(filePath, ctx);
    panel.webview.html = buildHtml(bundle);
    outputChannel.appendLine(`[OK] ${path.basename(filePath)} bundled`);
  } catch (err: any) {
    panel.webview.html = buildErrorHtml(err.message || String(err));
    outputChannel.appendLine(`[ERR] ${path.basename(filePath)}: ${err.message}`);
  }
}

// ─── Bundler ──────────────────────────────────────────────────────

async function bundleJsx(
  filePath: string,
  ctx: vscode.ExtensionContext
): Promise<string> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "jsx-preview-"));
  const entryPath = path.join(tmpDir, "entry.jsx");

  const entryCode = [
    `import { createRoot } from "react-dom/client";`,
    `import App from ${JSON.stringify(filePath)};`,
    `const root = document.getElementById("root");`,
    `createRoot(root).render(<App />);`,
  ].join("\n");

  fs.writeFileSync(entryPath, entryCode);

  // Resolve react from the component's project first, fall back to extension deps
  const projectModules = findNodeModules(path.dirname(filePath));
  const extModules = path.join(ctx.extensionPath, "node_modules");
  const nodePaths = projectModules
    ? [projectModules, extModules]
    : [extModules];

  try {
    const result = await esbuild.build({
      entryPoints: [entryPath],
      bundle: true,
      write: false,
      format: "iife",
      target: "es2020",
      jsx: "automatic",
      nodePaths,
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
        ".ts": "tsx",
        ".tsx": "tsx",
        ".css": "css",
        ".json": "json",
      },
      logLevel: "silent",
    });

    if (result.errors.length > 0) {
      const msgs = result.errors.map((e) => e.text).join("\n");
      throw new Error(msgs);
    }

    const jsOutput =
      result.outputFiles.find((f) => f.path.endsWith(".js")) ||
      result.outputFiles[0];
    if (!jsOutput) throw new Error("No output produced by bundler");

    return jsOutput.text;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function findNodeModules(dir: string): string | null {
  let current = dir;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(current, "node_modules");
    if (
      fs.existsSync(candidate) &&
      fs.existsSync(path.join(candidate, "react"))
    ) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

// ─── HTML generation ──────────────────────────────────────────────

function buildHtml(bundle: string): string {
  const nonce = generateNonce();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 style-src 'unsafe-inline';
                 script-src 'nonce-${nonce}';
                 connect-src http: https: ws: wss:;
                 img-src https: data:;
                 font-src https: data:;">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: auto; }
    body { background: #0a0a0f; color: #c8c8d4; }
    #root { width: 100%; min-height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}">
  ${bundle}
  </script>
</body>
</html>`;
}

function buildErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0f; color: #ff6b6b; padding: 32px;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 13px; line-height: 1.7;
    }
    h3 { color: #ff4444; margin-bottom: 16px; font-size: 14px; letter-spacing: 2px; }
    pre {
      white-space: pre-wrap; word-break: break-word;
      background: #1a0a0a; border: 1px solid #331111;
      border-radius: 6px; padding: 16px; overflow-x: auto;
    }
  </style>
</head>
<body>
  <h3>BUILD ERROR</h3>
  <pre>${escapeHtml(message)}</pre>
</body>
</html>`;
}

// ─── Utilities ────────────────────────────────────────────────────

function generateNonce(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function deactivate() {
  for (const panel of panels.values()) {
    panel.dispose();
  }
  panels.clear();
}
