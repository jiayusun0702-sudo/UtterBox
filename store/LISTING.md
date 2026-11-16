# UtterBox 上架资料

## 基本信息

- **扩展名称**：UtterBox - 文字转语音
- **版本**：1.0.0
- **分类**：Productivity / Accessibility（生产力工具 / 无障碍）
- **官网 / 支持主页**：https://jiayusun0702-sudo.github.io/UtterBox/
- **隐私政策 URL**：https://jiayusun0702-sudo.github.io/UtterBox/privacy.html
- **源码**：https://github.com/jiayusun0702-sudo/UtterBox
- **联系方式**：GitHub Issues（见上方源码链接）

## 简短描述（Chrome/Edge 限 132 字符）

选中网页文本，右键或点击图标，一键转换为自然语音并下载 MP3。支持中英文多种音色，可调节语速。

**English (short):**
Select any text on a webpage and turn it into natural speech — one click to preview or download as MP3. Multiple English/Chinese voices, adjustable rate.

## 详细描述

UtterBox 是一个轻量的文字转语音工具，基于 Microsoft Azure 认知服务语音合成（Neural TTS），可以把网页上的任意文本快速转换成自然流畅的语音，并下载为 MP3 文件。

**主要功能：**
- 🖱️ 选中网页上的任意文本，右键菜单一键转语音并下载
- 🎛️ 点击工具栏图标打开面板，手动输入文本、调整发音人和语速
- 🗣️ 内置中英文多种高质量神经网络音色（晓晓、云希、Aria、Guy、Sonia、Ryan 等）
- ▶️ 支持试听后再下载，避免反复生成
- 💾 下载时可选择是否弹出"另存为"对话框
- 🔒 不收集任何个人信息，不追踪、不设 Cookie，文本仅用于实时生成语音，不会被留存（详见隐私政策）

**适合场景：**
- 阅读长文章/文档时想"听"而不是"看"
- 外语学习者想听地道发音
- 视觉障碍或阅读困难用户的无障碍辅助
- 快速把网页摘录转换成语音备忘

**English:**
UtterBox is a lightweight text-to-speech extension powered by Microsoft Azure Neural TTS. Select any text on a webpage and convert it into natural-sounding speech, previewable and downloadable as an MP3 — in one click via the right-click menu, or through the toolbar popup for more control (voice, rate). No personal data is collected or tracked; text is only used transiently to generate audio and is never stored (see Privacy Policy).

## 权限使用说明（供审核参考）

| 权限 | 用途 |
|---|---|
| `contextMenus` | 在右键菜单添加"用 UtterBox 转为语音并下载" |
| `activeTab` / `scripting` | 读取当前页面中用户选中的文本 |
| `downloads` | 将生成的 MP3 保存到本地 |
| `storage` | 保存用户的语音/语速/下载偏好（仅本地） |
| `host_permissions`（Worker 域名）| 向自建的 Cloudflare Worker 代理发送合成请求，避免浏览器 CORS 限制；Worker 本身只转发请求到 Azure，不留存任何文本或音频 |

## 各商店备注

- **Microsoft Edge Add-ons**：使用 `dist/utterbox-chromium.zip`。免费开发者账号，审核通常数小时到几天。
- **Chrome Web Store**：使用 `dist/utterbox-chromium.zip`。需要一次性 $5 开发者注册费，审核可能数天，注意权限说明要写清楚（已在上表提供）。
- **Firefox Add-ons (AMO)**：使用 `dist/utterbox-firefox.zip`（背景脚本用 `scripts` 而非 `service_worker`，已在 `manifest.firefox.json` 中单独配置，并带有 `browser_specific_settings.gecko.id`）。免费账号，走自动化审查 + 人工复核。

## 截图清单（建议尺寸 1280x800）

1. `screenshot-web.png` — 网页版 UtterBox 使用效果
2. `screenshot-popup.png` — 扩展弹窗界面（选择发音人/语速/试听）
