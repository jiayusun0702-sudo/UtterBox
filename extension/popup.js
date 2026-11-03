import {
  VOICES,
  getSettings,
  saveSettings,
  synthesizeToArrayBuffer,
  arrayBufferToBase64,
  makeFilename,
} from "./common.js";

const textEl = document.getElementById("text");
const voiceEl = document.getElementById("voice");
const rateEl = document.getElementById("rate");
const rateLabelEl = document.getElementById("rateLabel");
const saveAsEl = document.getElementById("saveAs");
const useSelectionBtn = document.getElementById("useSelectionBtn");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusEl = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer");

let cachedBuffer = null;
let cachedKey = "";

function populateVoices() {
  const groups = {};
  for (const v of VOICES) {
    (groups[v.group] ??= []).push(v);
  }
  for (const [group, items] of Object.entries(groups)) {
    const optgroup = document.createElement("optgroup");
    optgroup.label = group;
    for (const v of items) {
      const opt = document.createElement("option");
      opt.value = v.value;
      opt.textContent = v.label;
      optgroup.appendChild(opt);
    }
    voiceEl.appendChild(optgroup);
  }
}

async function init() {
  populateVoices();
  const settings = await getSettings();
  voiceEl.value = settings.voice;
  rateEl.value = parseInt(settings.rate, 10) || 0;
  rateLabelEl.textContent = settings.rate;
  saveAsEl.checked = settings.saveAs;

  chrome.runtime.sendMessage({ type: "GET_SELECTION" }, (resp) => {
    if (resp?.text) textEl.value = resp.text.slice(0, 5000);
  });
}

voiceEl.addEventListener("change", () => saveSettings({ voice: voiceEl.value }));
saveAsEl.addEventListener("change", () => saveSettings({ saveAs: saveAsEl.checked }));
rateEl.addEventListener("input", () => {
  const v = Number(rateEl.value);
  const label = (v > 0 ? "+" : "") + v + "%";
  rateLabelEl.textContent = label;
  saveSettings({ rate: `${v}%` });
});

useSelectionBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "GET_SELECTION" }, (resp) => {
    if (resp?.text) {
      textEl.value = resp.text.slice(0, 5000);
    } else {
      statusEl.textContent = "没有检测到选中的文本";
    }
  });
});

function currentKey() {
  return JSON.stringify({ text: textEl.value, voice: voiceEl.value, rate: rateEl.value });
}

function setBusy(busy, label) {
  previewBtn.disabled = busy;
  downloadBtn.disabled = busy;
  statusEl.textContent = label || "";
}

async function synthesize() {
  const text = textEl.value.trim();
  if (!text) {
    statusEl.textContent = "请先输入文本";
    return null;
  }

  const key = currentKey();
  if (cachedBuffer && key === cachedKey) return cachedBuffer;

  setBusy(true, "正在生成语音…");
  try {
    const buffer = await synthesizeToArrayBuffer(text, voiceEl.value, `${rateEl.value}%`);
    cachedBuffer = buffer;
    cachedKey = key;
    statusEl.textContent = "生成完成";
    return buffer;
  } catch (err) {
    statusEl.textContent = `出错了：${err.message}`;
    return null;
  } finally {
    setBusy(false);
  }
}

previewBtn.addEventListener("click", async () => {
  const buffer = await synthesize();
  if (!buffer) return;
  const blob = new Blob([buffer], { type: "audio/mpeg" });
  audioPlayer.src = URL.createObjectURL(blob);
  audioPlayer.style.display = "block";
  audioPlayer.play();
});

downloadBtn.addEventListener("click", async () => {
  const buffer = await synthesize();
  if (!buffer) return;
  const base64 = arrayBufferToBase64(buffer);
  await chrome.downloads.download({
    url: `data:audio/mpeg;base64,${base64}`,
    filename: makeFilename(textEl.value),
    saveAs: saveAsEl.checked,
  });
  statusEl.textContent = "已开始下载";
});

init();
