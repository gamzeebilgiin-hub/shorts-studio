// Shorts Studio – scene-by-scene scripts.
// Loaded before app.js; uses the shared state, saveState, newId and activeChannelId from there.
// Each dialogue line may also carry a `bubble` layout, added by the bubble editor.

const LINE_KINDS = ["speech", "thought", "message"];

// Speech needs no label in the Markdown export; thoughts and messages are marked.
function kindSuffix(kind) {
  return kind === "speech" ? "" : ` (${t(`kind_${kind}`)})`;
}

let activeEpisodeId = null;

// ---------- data helpers ----------

function newScene() {
  return { id: newId(), duration: "", visual: "", lines: [], prompt: "", image: "" };
}

function sceneCount(episode) {
  return t("scenes", { count: episode.scenes.length });
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
  number.textContent = t("scene_n", { n: index + 1 });

  const duration = field("input", scene.duration, t("scene_time"), (value) => (scene.duration = value));
  duration.className = "scene-duration";

  const actions = document.createElement("div");
  actions.className = "idea-actions";
  actions.append(
    smallButton("↑", t("move_up"), () => moveScene(episode, index, -1)),
    smallButton("↓", t("move_down"), () => moveScene(episode, index, 1)),
    smallButton(t("delete"), t("delete_scene"), () => deleteScene(episode, scene.id))
  );

  head.append(number, duration, actions);

  const visual = field("textarea", scene.visual, t("visual_placeholder"), (value) => (scene.visual = value));

  const lines = document.createElement("div");
  lines.className = "scene-lines";
  scene.lines.forEach((line, lineIndex) => lines.append(renderLine(scene, line, lineIndex)));

  const addLine = smallButton(t("add_line"), t("add_line_title"), () => {
    scene.lines.push({ speaker: "", kind: "speech", text: "" });
    saveState();
    renderEpisodeEditor();
  });
  addLine.classList.add("add-line");

  const prompt = field("textarea", scene.prompt, t("image_prompt"), (value) => (scene.prompt = value));
  const image = field("input", scene.image, t("image_file_placeholder"), (value) => (scene.image = value));

  card.append(
    head,
    label(t("visual"), visual),
    label(t("dialogue"), lines, addLine),
    label(t("image_prompt"), prompt),
    label(t("image_file"), image)
  );
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

  const speaker = field("input", line.speaker, t("who"), (value) => (line.speaker = value));
  speaker.className = "line-speaker";

  const kind = document.createElement("select");
  for (const option of LINE_KINDS) kind.append(new Option(t(`kind_${option}`), option));
  kind.value = line.kind;
  kind.addEventListener("change", () => {
    line.kind = kind.value;
    saveState();
  });

  const text = field("input", line.text, t("line"), (value) => (line.text = value));
  text.className = "line-text";

  const remove = smallButton("×", t("delete_line"), () => {
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
  if (!confirm(t("confirm_delete_scene"))) return;
  episode.scenes = episode.scenes.filter((scene) => scene.id !== sceneId);
  saveState();
  renderScripts();
}

function deleteEpisode() {
  const episode = activeEpisode();
  if (!episode || !confirm(t("confirm_delete_episode", { title: episode.title }))) return;
  state.episodes = state.episodes.filter((item) => item.id !== episode.id);
  state.posts = state.posts.filter((post) => post.episodeId !== episode.id);
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
  out.push(`${t("channel")}: ${channelNameById(episode.channelId)} · ${sceneCount(episode)}`, "");
  if (episode.notes.trim()) out.push(episode.notes.trim(), "");

  out.push(
    `## ${t("md_scenes")}`,
    "",
    `| # | ${t("md_time")} | ${t("visual")} | ${t("dialogue")} |`,
    "| --- | --- | --- | --- |"
  );
  episode.scenes.forEach((scene, index) => {
    const dialogue = scene.lines
      .filter((line) => line.text.trim())
      .map((line) => `**${cell(line.speaker || "?")}${kindSuffix(line.kind)}:** “${cell(line.text)}”`)
      .join("<br>");
    out.push(`| ${index + 1} | ${cell(scene.duration)} | ${cell(scene.visual)} | ${dialogue} |`);
  });

  const prompts = episode.scenes.map((scene, index) => ({ scene, index })).filter(({ scene }) => scene.prompt.trim());
  if (prompts.length) {
    out.push("", `## ${t("md_prompts")}`);
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
    button.textContent = t("copied");
  } catch (error) {
    console.warn("Clipboard not available", error);
    button.textContent = t("copy_failed");
  }
  setTimeout(() => (button.textContent = t("copy_markdown")), 1500);
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
