# UtterBox

开源、轻量、无服务器成本的文本转语音工具。粘贴文本，选择发音（美音/英音/中文），调速，试听并导出 `.mp3`。

## 结构

- `index.html` / `app.js` — Web 前端（纯静态页面，部署在 GitHub Pages）
- `worker/` — Cloudflare Worker，作为 Azure Speech 的代理接口，密钥不暴露给前端

## 本地开发

前端：用任意静态服务器打开根目录（如 `python -m http.server`），访问 `index.html`。

Worker：

```bash
cd worker
npm install
npm run dev
```

## 部署

前端由 GitHub Actions 自动部署到 GitHub Pages（见 `.github/workflows`）。
Worker 用 `npm run deploy`（需要先 `npx wrangler login` 并设置 `AZURE_SPEECH_KEY` secret）。
