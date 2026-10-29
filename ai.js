// Shorts Studio – "Get help": Claude suggests a scene's visual, dialogue lines and image prompt.
// With an Anthropic API key saved in this browser, the scene is written directly through the
// Claude API. Without one, the user gets a ready-made request to paste into Claude or ChatGPT
// and pastes the answer back.

const API_KEY_STORAGE = "shorts-studio:anthropic-key";
const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.135.0/+esm";
const AI_MODEL = "claude-opus-5-5";

const SCENE_SCHEMA = {
  type: "object",
  properties: {
    visual: { type: "string" },
    lines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          speaker: { type: "string" },
          kind: { type: "string", enum: ["speech", "thought", "message"] },
          text: { type: "string" },
        },
        required: ["speaker", "kind", "text"],
        additionalProperties: false,
      },
    },
    prompt: { type: "string" },
  },
  required: ["visual", "lines", "prompt"],
  additionalProperties: false,
};

let assistTarget = null; // { episode, scene } while the manual dialog is open

// ---------- key storage ----------

function getApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || "";
  } catch (error) {
    return "";
  }
}

function setApiKey(key) {
  try {
    if (key) localStorage.setItem(API_KEY_STORAGE, key);
    else localStorage.removeItem(API_KEY_STORAGE);
  } catch (error) {
    console.warn("Could not save the API key", error);
  }
}

// ---------- request text ----------

function describeScene(scene, index) {
  const parts = [`Scene ${index + 1}${scene.duration ? ` (${scene.duration})` : ""}`];
  if (scene.visual.trim()) parts.push(`Visual: ${scene.visual.trim()}`);
  for (const line of scene.lines.filter((item) => item.text.trim())) {
    parts.push(`${line.speaker || "?"} (${line.kind}): "${line.text.trim()}"`);
  }
  if (scene.prompt.trim()) parts.push(`Image prompt: ${scene.prompt.trim()}`);
  return parts.join("\n");
}

function buildAssistPrompt(episode, scene) {
  const index = episode.scenes.indexOf(scene);
  const others = episode.scenes
    .map((item, position) => ({ item, position }))
    .filter(({ item }) => item !== scene && (item.visual.trim() || item.lines.some((line) => line.text.trim())));

  const out = [
    "You are helping write an episode of a vertical short video (YouTube Shorts, Instagram Reels, TikTok).",
    "Each scene is one comic-style illustration with speech, thought or phone-message bubbles on it.",
    "",
    `Channel: ${channelNameById(episode.channelId)}`,
    `Episode: ${episode.title}`,
  ];
  if (episode.notes.trim()) out.push(`Episode notes: ${episode.notes.trim()}`);

  out.push("", others.length ? "Other scenes of this episode:" : "This is the first scene written for this episode.");
  for (const { item, position } of others) out.push("", describeScene(item, position));

  out.push("", `Now write scene ${index + 1} of ${episode.scenes.length}.`);
  if (scene.duration.trim()) out.push(`Its time slot is ${scene.duration.trim()}.`);
  if (scene.visual.trim()) out.push(`What should happen in it: ${scene.visual.trim()}`);
  const existing = scene.lines.filter((line) => line.text.trim());
  if (existing.length) {
    out.push("Its current draft lines, to improve or keep:");
    for (const line of existing) out.push(`- ${line.speaker || "?"} (${line.kind}): "${line.text.trim()}"`);
  }

  out.push(
    "",
    "Guidelines:",
    "- Continue the story naturally from the scenes before and lead into the scenes after.",
    "- Use 1 to 3 bubbles. Each must be short enough to read in 3–4 seconds.",
    "- Keep the same character names as the other scenes.",
    '- kind is "speech" for spoken words, "thought" for inner voice, "message" for a phone text.',
    `- Write "visual" and the dialogue in the language the episode is already written in; if there is no text yet, use ${LANGUAGES[currentLanguage].name}.`,
    '- Write "prompt" in English for an image model: vertical 9:16, no text, letters or speech bubbles in the image. Describe the characters exactly as in the other image prompts so they stay consistent.',
    "",
    "Reply with only this JSON and nothing else:",
    '{"visual": "...", "lines": [{"speaker": "...", "kind": "speech", "text": "..."}], "prompt": "..."}'
  );
  return out.join("\n");
}

// ---------- answers ----------

// Accepts either a parsed object or a pasted reply that contains the JSON somewhere.
function readSuggestion(answer) {
  let data = answer;
  if (typeof answer === "string") {
    const start = answer.indexOf("{");
    const end = answer.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      data = JSON.parse(answer.slice(start, end + 1));
    } catch (error) {
      return null;
    }
  }
  if (!data || !Array.isArray(data.lines)) return null;

  const lines = data.lines
    .filter((line) => line && typeof line.text === "string" && line.text.trim())
    .map((line) => ({
      speaker: String(line.speaker ?? "").trim(),
      kind: LINE_KINDS.includes(line.kind) ? line.kind : "speech",
      text: line.text.trim(),
    }));
  if (lines.length === 0) return null;

  return {
    visual: typeof data.visual === "string" ? data.visual.trim() : "",
    lines,
    prompt: typeof data.prompt === "string" ? data.prompt.trim() : "",
  };
}

function applySuggestion(scene, suggestion) {
  const hasText = scene.lines.some((line) => line.text.trim()) || scene.prompt.trim();
  if (hasText && !confirm(t("ai_replace"))) return false;

  if (suggestion.visual) scene.visual = suggestion.visual;
  scene.lines = suggestion.lines;
  if (suggestion.prompt) scene.prompt = suggestion.prompt;
  saveState();
  renderScripts();
  return true;
}

// ---------- Claude API ----------

async function writeSceneWithClaude(prompt) {
  const { default: Anthropic } = await import(SDK_URL);
  const client = new Anthropic({ apiKey: getApiKey(), dangerouslyAllowBrowser: true });

  const response = await client.beta.messages.create({
    model: AI_MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCENE_SCHEMA } },
    messages: [{ role: "user", content: prompt }],
  });

  if (response.stop_reason === "refusal") throw new Error(t("ai_refused"));
  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  const suggestion = readSuggestion(text);
  if (!suggestion) throw new Error(t("ai_bad_answer"));
  return suggestion;
}

// ---------- "Get help" button ----------

async function assistScene(episode, scene, button) {
  const prompt = buildAssistPrompt(episode, scene);
  if (!getApiKey()) {
    openManualAssist(episode, scene, prompt);
    return;
  }

  const label = button.textContent;
  button.disabled = true;
  button.textContent = t("ai_working");
  try {
    applySuggestion(scene, await writeSceneWithClaude(prompt));
  } catch (error) {
    console.warn("Claude request failed", error);
    const reason = error.status === 401 ? t("ai_bad_key") : error.message || error;
    alert(t("ai_failed", { error: reason }));
    openManualAssist(episode, scene, prompt);
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

function openManualAssist(episode, scene, prompt) {
  assistTarget = { episode, scene };
  $("assist-request").value = prompt;
  $("assist-answer").value = "";
  $("assist-error").hidden = true;
  $("assist-dialog").showModal();
  copyAssistRequest();
}

async function copyAssistRequest() {
  const button = $("assist-copy");
  try {
    await navigator.clipboard.writeText($("assist-request").value);
    button.textContent = t("copied");
  } catch (error) {
    $("assist-request").select();
  }
  setTimeout(() => (button.textContent = t("copy")), 1500);
}

// ---------- settings ----------

function renderKeyStatus() {
  $("ai-key-status").textContent = getApiKey() ? t("ai_key_saved") : t("ai_key_none");
}

function initAssist() {
  $("assist-copy").addEventListener("click", copyAssistRequest);
  $("assist-apply").addEventListener("click", () => {
    const suggestion = readSuggestion($("assist-answer").value);
    if (!suggestion) {
      $("assist-error").hidden = false;
      return;
    }
    if (assistTarget && applySuggestion(assistTarget.scene, suggestion)) $("assist-dialog").close();
  });
  $("assist-close").addEventListener("click", () => $("assist-dialog").close());

  $("ai-settings-open").addEventListener("click", () => {
    $("ai-key").value = "";
    renderKeyStatus();
    $("ai-settings").showModal();
  });
  $("ai-key-save").addEventListener("click", () => {
    const key = $("ai-key").value.trim();
    if (key) setApiKey(key);
    $("ai-key").value = "";
    renderKeyStatus();
  });
  $("ai-key-remove").addEventListener("click", () => {
    setApiKey("");
    renderKeyStatus();
  });
  $("ai-settings-close").addEventListener("click", () => $("ai-settings").close());
}
