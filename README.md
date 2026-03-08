# JSX Preview — VS Code Extension

Live preview of JSX/TSX components in a VS Code webview panel. Open any `.jsx` or `.tsx` file and press **Cmd+Shift+J** (Mac) or **Ctrl+Shift+J** to see it rendered.

## Install from GitHub

```bash
git clone https://github.com/dnamaz/vscode-jsx-preview.git
cd vscode-jsx-preview
npm install
npm run compile
npm run package
code --install-extension jsx-preview-0.1.0.vsix
```

Or download the `.vsix` from [Releases](../../releases) and run:

```bash
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
