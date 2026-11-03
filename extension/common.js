export const WORKER_URL = "https://utterbox-tts-worker.sunj0061ntu.workers.dev/tts";

export const VOICES = [
  { group: "English (US)", value: "en-US-AriaNeural", label: "Aria（女声）" },
  { group: "English (US)", value: "en-US-GuyNeural", label: "Guy（男声）" },
  { group: "English (UK)", value: "en-GB-SoniaNeural", label: "Sonia（女声）" },
  { group: "English (UK)", value: "en-GB-RyanNeural", label: "Ryan（男声）" },
  { group: "中文", value: "zh-CN-XiaoxiaoNeural", label: "晓晓（女声）" },
  { group: "中文", value: "zh-CN-YunxiNeural", label: "云希（男声）" },
];

export const DEFAULT_SETTINGS = {
  voice: "en-US-AriaNeural",
  rate: "0%",
  saveAs: true,
};

export async function getSettings() {
  const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(partial) {
  await chrome.storage.local.set(partial);
}

export async function synthesizeToArrayBuffer(text, voice, rate) {
  const resp = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, rate }),
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || `请求失败 (HTTP ${resp.status})`);
  }
  return resp.arrayBuffer();
}

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

export function makeFilename(text) {
  const slug = text
    .trim()
    .slice(0, 24)
    .replace(/[\\/:*?"<>|\n\r]+/g, " ")
    .trim();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `utterbox-${slug || "audio"}-${stamp}.mp3`;
}
