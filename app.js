const WORKER_URL = "https://utterbox-tts-worker.sunj0061ntu.workers.dev/tts";

const textEl = document.getElementById("text");
const charCountEl = document.getElementById("charCount");
const voiceEl = document.getElementById("voice");
const rateEl = document.getElementById("rate");
const rateLabelEl = document.getElementById("rateLabel");
const previewBtn = document.getElementById("previewBtn");
const previewIcon = document.getElementById("previewIcon");
const downloadBtn = document.getElementById("downloadBtn");
const statusEl = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer");

let cachedBlob = null;
let cachedKey = "";

textEl.addEventListener("input", () => {
  charCountEl.textContent = textEl.value.length;
});

rateEl.addEventListener("input", () => {
  const v = Number(rateEl.value);
  rateLabelEl.textContent = (v > 0 ? "+" : "") + v + "%";
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
  if (cachedBlob && key === cachedKey) {
    return cachedBlob;
  }

  setBusy(true, "正在生成语音…");
  try {
    const resp = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voice: voiceEl.value,
        rate: `${rateEl.value}%`,
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      throw new Error(errBody.error || `请求失败 (HTTP ${resp.status})`);
    }

    const blob = await resp.blob();
    cachedBlob = blob;
    cachedKey = key;
    statusEl.textContent = "生成完成";
    return blob;
  } catch (err) {
    statusEl.textContent = `出错了：${err.message}`;
    return null;
  } finally {
    setBusy(false);
  }
}

previewBtn.addEventListener("click", async () => {
  const blob = await synthesize();
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  audioPlayer.src = url;
  audioPlayer.classList.remove("hidden");
  audioPlayer.play();
});

downloadBtn.addEventListener("click", async () => {
  const blob = await synthesize();
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `utterbox-${Date.now()}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
