# JSX Preview — VS Code Extension

Live preview of JSX/TSX components in a VS Code webview panel. Open any `.jsx` or `.tsx` file and press **Cmd+Shift+J** (Mac) or **Ctrl+Shift+J** to see it rendered. Save the file to refresh automatically.

![Screenshot](screenshot.png)

## Quick Start

Create a component with a default export:

```jsx
// HelloWorld.jsx
export default function HelloWorld() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 8 }}>
        Hello, World!
      </h1>
      <p style={{ fontSize: 18, opacity: 0.6 }}>
        Edit this file and save to see live changes.
      </p>
    </div>
  );
}
```

Open the file in VS Code, press **Cmd+Shift+J**, and see it rendered in a side panel. Every save refreshes the preview.

## Install

**From a release** (easiest):

Download `jsx-preview-0.1.0.vsix` from [Releases](../../releases) and run:

```bash
code --install-extension jsx-preview-0.1.0.vsix
```

**From source:**

```bash
git clone https://github.com/dnamaz/vscode-jsx-preview.git
cd vscode-jsx-preview
npm install
npm run compile
npm run package
code --install-extension jsx-preview-0.1.0.vsix
```

## Development

```bash
npm install
npm run watch          # compile TypeScript in watch mode
# Press F5 in VS Code to launch Extension Development Host
```

## Build `.vsix`

```bash
npm run package        # produces jsx-preview-0.1.0.vsix
```
