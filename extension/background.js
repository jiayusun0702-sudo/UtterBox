import {
  getSettings,
  synthesizeToArrayBuffer,
  arrayBufferToBase64,
  makeFilename,
} from "./common.js";

const MENU_ID = "utterbox-selection-to-speech";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "用 UtterBox 转为语音并下载",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) return;
  const text = (info.selectionText || "").trim();
  if (!text) return;

  await notify(tab?.id, "正在生成语音…");
  try {
    await synthesizeAndDownload(text);
    await notify(tab?.id, "已开始下载");
  } catch (err) {
    console.error("UtterBox error:", err);
    await notify(tab?.id, `出错了：${err.message}`);
  }
});

async function synthesizeAndDownload(text) {
  const settings = await getSettings();
  const trimmed = text.slice(0, 5000);
  const buffer = await synthesizeToArrayBuffer(trimmed, settings.voice, settings.rate);
  const base64 = arrayBufferToBase64(buffer);
  const dataUrl = `data:audio/mpeg;base64,${base64}`;
  await chrome.downloads.download({
    url: dataUrl,
    filename: makeFilename(trimmed),
    saveAs: settings.saveAs,
  });
}

async function notify(tabId, message) {
  if (!tabId) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (msg) => {
        const el = document.createElement("div");
        el.textContent = msg;
        el.style.cssText =
          "position:fixed;bottom:20px;right:20px;z-index:2147483647;" +
          "background:#1e293b;color:#fff;padding:10px 16px;border-radius:8px;" +
          "font:14px/1.4 sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.2);opacity:0.95;";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3500);
      },
      args: [message],
    });
  } catch {
    // Page may not allow script injection (e.g. chrome:// pages); ignore.
  }
}

// Allow the popup to request the active tab's current text selection.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "GET_SELECTION") return;
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return sendResponse({ text: "" });
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || "",
      });
      sendResponse({ text: result || "" });
    } catch {
      sendResponse({ text: "" });
    }
  })();
  return true;
});
