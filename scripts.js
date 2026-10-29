// Shorts Studio – scene-by-scene scripts.
// Loaded before app.js; uses the shared state, saveState, newId and activeChannelId from there.
// Each dialogue line may also carry a `bubble` layout, added by the bubble editor.

const LINE_KINDS = ["speech", "thought", "message"];
const KIND_LABELS = { speech: "", thought: " (thought)", message: " (message)" };

let activeEpisodeId = null;

// ---------- data helpers ----------

function newScene() {
  return { id: newId(), duration: "", visual: "", lines: [], prompt: "", image: "" };
}

function sceneCount(episode) {
  return `${episode.scenes.length} scene${episode.scenes.length === 1 ? "" : "s"}`;
}

function activeEpisode() {
  return state.episodes.find((episode) => episode.id === activeEpisodeId) ?? null;
}

function createEpisode({ title, channelId, ideaId = null }) {
  const episode = {
    id: newId(),
    channelId,
    ideaId,
    title,
    notes: "",
    createdAt: Date.now(),
    scenes: [newScene()],
  };
  state.episodes.push(episode);
  activeEpisodeId = episode.id;
  saveState();
  return episode;
}

// ---------- rendering ----------

function renderScripts() {
  renderEpisodeList();
  renderEpisodeEditor();
}

function renderEpisodeList() {
  const list = $("episode-list");
  const episodes = state.episodes
    .filter((episode) => activeChannelId === null || episode.channelId === activeChannelId)
    .sort((a, b) => b.createdAt - a.createdAt);

  list.replaceChildren(
    ...episodes.map((episode) => {
      const item = document.createElement("li");
      item.classList.toggle("is-active", episode.id === activeEpisodeId);
      item.addEventListener("click", () => {
        activeEpisodeId = episode.id;
        renderScripts();
      });

      const title = document.createElement("span");
      title.textContent = episode.title;
      const meta = document.createElement("span");
      meta.className = "muted";
      meta.textContent = `${channelNameById(episode.channelId)} · ${sceneCount(episode)}`;

      item.append(title, meta);
      return item;
    })
  );

  $("episode-empty").hidden = episodes.length > 0;

  const channelSelect = $("episode-channel");
  channelSelect.replaceChildren(...state.channels.map((channel) => new Option(channel.name, channel.id)));
  if (activeChannelId) channelSelect.value = activeChannelId;
  $("episode-form").querySelector("button[type=submit]").disabled = state.channels.length === 0;
}

function renderEpisodeEditor() {
  const editor = $("episode-editor");
  const episode = activeEpisode();
  editor.hidden = !episode;
  if (!episode) return;

  $("episode-title").value = episode.title;
  $("episode-notes").value = episode.notes;
  $("scene-list").replaceChildren(...episode.scenes.map((scene, index) => renderScene(episode, scene, index)));
}

function field(tag, value, placeholder, onInput) {
  const element = document.createElement(tag);
  element.value = value;
  element.placeholder = placeholder;
  if (tag === "textarea") element.rows = 2;
  element.addEventListener("input", () => {
    onInput(element.value);
    saveState();
  });
  return element;
}

function smallButton(text, title, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "link-button";
  button.textContent = text;
  button.title = title;
  button.addEventListener("click", onClick);
  return button;
}

function renderScene(episode, scene, index) {
  const card = document.createElement("li");
  card.className = "card scene";

  const head = document.createElement("div");
  head.className = "scene-head";

  const number = document.createElement("strong");
  number.textContent = `Scene ${index + 1}`;

  const duration = field("input", scene.duration, "Time, e.g. 0–3 s", (value) => (scene.duration = value));
  duration.className = "scene-duration";

  const actions = document.createElement("div");
  actions.className = "idea-actions";
  actions.append(
    smallButton("↑", "Move up", () => moveScene(episode, index, -1)),
    smallButton("↓", "Move down", () => moveScene(episode, index, 1)),
    smallButton("Delete", "Delete scene", () => deleteScene(episode, scene.id))
  );

  head.append(number, duration, actions);

  const visual = field("textarea", scene.visual, "What we see in this scene", (value) => (scene.visual = value));

  const lines = document.createElement("div");
  lines.className = "scene-lines";
  scene.lines.forEach((line, lineIndex) => lines.append(renderLine(scene, line, lineIndex)));

  const addLine = smallButton("+ Add line", "Add a dialogue, thought or message line", () => {
    scene.lines.push({ speaker: "", kind: "speech", text: "" });
    saveState();
    renderEpisodeEditor();
  });
  addLine.classList.add("add-line");

  const prompt = field("textarea", scene.prompt, "Image prompt", (value) => (scene.prompt = value));
  const image = field("input", scene.image, "Image file name, e.g. 01-secret-plan.png", (value) => (scene.image = value));

  card.append(head, label("Visual", visual), label("Dialogue", lines, addLine), label("Image prompt", prompt), label("Image file", image));
  return card;
}

function label(text, ...children) {
  const wrapper = document.createElement("div");
  wrapper.className = "scene-field";
  const caption = document.createElement("span");
  caption.className = "muted";
  caption.textContent = text;
  wrapper.append(caption, ...children);
  return wrapper;
}

function renderLine(scene, line, lineIndex) {
  const row = document.createElement("div");
  row.className = "line-row";

  const speaker = field("input", line.speaker, "Who", (value) => (line.speaker = value));
  speaker.className = "line-speaker";

  const kind = document.createElement("select");
  for (const option of LINE_KINDS) kind.append(new Option(option, option));
  kind.value = line.kind;
  kind.addEventListener("change", () => {
    line.kind = kind.value;
    saveState();
  });

  const text = field("input", line.text, "Line", (value) => (line.text = value));
  text.className = "line-text";

  const remove = smallButton("×", "Delete line", () => {
    scene.lines.splice(lineIndex, 1);
    saveState();
    renderEpisodeEditor();
  });

  row.append(speaker, kind, text, remove);
  return row;
}

// ---------- actions ----------

function moveScene(episode, index, step) {
  const target = index + step;
  if (target < 0 || target >= episode.scenes.length) return;
  const [scene] = episode.scenes.splice(index, 1);
  episode.scenes.splice(target, 0, scene);
  saveState();
  renderEpisodeEditor();
}

function deleteScene(episode, sceneId) {
  if (!confirm("Delete this scene?")) return;
  episode.scenes = episode.scenes.filter((scene) => scene.id !== sceneId);
  saveState();
  renderScripts();
}

function deleteEpisode() {
  const episode = activeEpisode();
  if (!episode || !confirm(`Delete "${episode.title}" and all its scenes?`)) return;
  state.episodes = state.episodes.filter((item) => item.id !== episode.id);
  activeEpisodeId = null;
  saveState();
  render();
}

// ---------- Markdown export ----------

function cell(text) {
  return text.trim().replace(/\|/g, "\\|").replace(/\n+/g, "<br>");
}

function episodeToMarkdown(episode) {
  const out = [`# ${episode.title}`, ""];
  out.push(`Channel: ${channelNameById(episode.channelId)} · ${sceneCount(episode)}`, "");
  if (episode.notes.trim()) out.push(episode.notes.trim(), "");

  out.push("## Scenes", "", "| # | Time | Visual | Dialogue |", "| --- | --- | --- | --- |");
  episode.scenes.forEach((scene, index) => {
    const dialogue = scene.lines
      .filter((line) => line.text.trim())
      .map((line) => `**${cell(line.speaker || "?")}${KIND_LABELS[line.kind]}:** “${cell(line.text)}”`)
      .join("<br>");
    out.push(`| ${index + 1} | ${cell(scene.duration)} | ${cell(scene.visual)} | ${dialogue} |`);
  });

  const prompts = episode.scenes.map((scene, index) => ({ scene, index })).filter(({ scene }) => scene.prompt.trim());
  if (prompts.length) {
    out.push("", "## Image prompts");
    for (const { scene, index } of prompts) {
      const name = scene.image.trim() ? ` — \`${scene.image.trim()}\`` : "";
      out.push("", `### ${String(index + 1).padStart(2, "0")}${name}`, "", "```", scene.prompt.trim(), "```");
    }
  }

  return out.join("\n") + "\n";
}

function fileSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "episode";
}

function downloadMarkdown() {
  const episode = activeEpisode();
  if (!episode) return;
  const blob = new Blob([episodeToMarkdown(episode)], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${fileSlug(episode.title)}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function copyMarkdown(button) {
  const episode = activeEpisode();
  if (!episode) return;
  try {
    await navigator.clipboard.writeText(episodeToMarkdown(episode));
    button.textContent = "Copied!";
  } catch (error) {
    console.warn("Clipboard not available", error);
    button.textContent = "Copy failed – use Download";
  }
  setTimeout(() => (button.textContent = "Copy Markdown"), 1500);
}

// ---------- events ----------

function initScripts() {
  $("episode-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = $("episode-new-title").value.trim();
    const channelId = $("episode-channel").value;
    if (!title || !channelId) return;
    createEpisode({ title, channelId });
    $("episode-new-title").value = "";
    renderScripts();
  });

  $("episode-title").addEventListener("input", (event) => {
    const episode = activeEpisode();
    if (!episode) return;
    episode.title = event.target.value;
    saveState();
    renderEpisodeList();
  });

  $("episode-notes").addEventListener("input", (event) => {
    const episode = activeEpisode();
    if (!episode) return;
    episode.notes = event.target.value;
    saveState();
  });

  $("add-scene").addEventListener("click", () => {
    const episode = activeEpisode();
    if (!episode) return;
    episode.scenes.push(newScene());
    saveState();
    renderScripts();
  });

  $("delete-episode").addEventListener("click", deleteEpisode);
  $("download-markdown").addEventListener("click", downloadMarkdown);
  $("copy-markdown").addEventListener("click", (event) => copyMarkdown(event.currentTarget));
}
