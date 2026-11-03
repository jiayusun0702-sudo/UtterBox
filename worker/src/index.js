const TTS_PATH = "/tts";
const VOICES_PATH = "/voices";

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSsml({ text, voice, rate, pitch, lang }) {
  const safeText = escapeXml(text);
  const safeRate = rate || "0%";
  const safePitch = pitch || "0%";
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">` +
    `<voice name="${voice}">` +
    `<prosody rate="${safeRate}" pitch="${safePitch}">${safeText}</prosody>` +
    `</voice></speak>`;
}

async function handleTts(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(env) },
    });
  }

  const text = (payload.text || "").toString();
  if (!text.trim()) {
    return new Response(JSON.stringify({ error: "`text` is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(env) },
    });
  }
  if (text.length > 5000) {
    return new Response(JSON.stringify({ error: "`text` too long (max 5000 chars)" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(env) },
    });
  }

  const voice = payload.voice || "en-US-AriaNeural";
  const lang = payload.lang || voice.split("-").slice(0, 2).join("-") || "en-US";
  const rate = payload.rate;
  const pitch = payload.pitch;

  const ssml = buildSsml({ text, voice, rate, pitch, lang });
  const region = env.AZURE_SPEECH_REGION;
  const azureUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const azureResp = await fetch(azureUrl, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "utterbox-tts-worker",
    },
    body: ssml,
  });

  if (!azureResp.ok) {
    const errText = await azureResp.text().catch(() => "");
    return new Response(
      JSON.stringify({ error: "Azure Speech request failed", status: azureResp.status, detail: errText }),
      {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders(env) },
      }
    );
  }

  return new Response(azureResp.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      ...corsHeaders(env),
    },
  });
}

async function handleVoices(request, env) {
  const region = env.AZURE_SPEECH_REGION;
  const azureUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`;

  const azureResp = await fetch(azureUrl, {
    headers: { "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY },
  });

  if (!azureResp.ok) {
    return new Response(JSON.stringify({ error: "Failed to list voices", status: azureResp.status }), {
      status: 502,
      headers: { "Content-Type": "application/json", ...corsHeaders(env) },
    });
  }

  return new Response(azureResp.body, {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders(env) },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (url.pathname === TTS_PATH && request.method === "POST") {
      return handleTts(request, env);
    }

    if (url.pathname === VOICES_PATH && request.method === "GET") {
      return handleVoices(request, env);
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, service: "utterbox-tts-worker" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders(env) },
      });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders(env) });
  },
};
