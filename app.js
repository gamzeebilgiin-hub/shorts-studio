// Shorts Studio – shared state, channels and the idea bank.
// All data lives in the browser's localStorage, so the app works without a server.

const STORAGE_KEY = "shorts-studio:v1";
const STATUSES = ["Idea", "Scripting", "Ready", "Published"];

const state = loadState();
let activeChannelId = null; // null means "All channels"

// ---------- storage ----------

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.channels) && Array.isArray(saved.ideas)) {
      saved.episodes ??= [];
      saved.posts ??= [];
      return saved;
    }
  } catch (error) {
    console.warn("Could not read saved data", error);
  }
  return { channels: [], ideas: [], episodes: [], posts: [] };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save data", error);
  }
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- elements ----------

const $ = (id) => document.getElementById(id);
const channelList = $("channel-list");
const channelForm = $("channel-form");
const channelName = $("channel-name");
const ideaForm = $("idea-form");
const ideaTitle = $("idea-title");
const ideaNotes = $("idea-notes");
const ideaChannel = $("idea-channel");
const filterStatus = $("filter-status");
const ideaList = $("idea-list");
const ideaCount = $("idea-count");
const emptyState = $("empty-state");

for (const status of STATUSES) {
  filterStatus.append(new Option(status, status));
}

// ---------- rendering ----------

function channelNameById(id) {
  return state.channels.find((channel) => channel.id === id)?.name ?? "Unknown channel";
}

function renderChannels() {
  channelList.replaceChildren();

  const all = document.createElement("li");
  all.textContent = "All channels";
  all.classList.toggle("is-active", activeChannelId === null);
  all.addEventListener("click", () => selectChannel(null));
  channelList.append(all);

  for (const channel of state.channels) {
    const item = document.createElement("li");
    item.classList.toggle("is-active", activeChannelId === channel.id);
    item.addEventListener("click", () => selectChannel(channel.id));

    const label = document.createElement("span");
    label.textContent = channel.name;

    const remove = document.createElement("button");
    remove.className = "link-button";
    remove.textContent = "×";
    remove.title = "Delete channel";
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteChannel(channel.id);
    });

    item.append(label, remove);
    channelList.append(item);
  }

  ideaChannel.replaceChildren();
  for (const channel of state.channels) {
    ideaChannel.append(new Option(channel.name, channel.id));
  }
  if (activeChannelId) ideaChannel.value = activeChannelId;
  ideaForm.querySelector("button[type=submit]").disabled = state.channels.length === 0;
}

function renderIdeas() {
  const statusFilter = filterStatus.value;
  const visible = state.ideas
    .filter((idea) => activeChannelId === null || idea.channelId === activeChannelId)
    .filter((idea) => !statusFilter || idea.status === statusFilter)
    .sort((a, b) => b.createdAt - a.createdAt);

  ideaList.replaceChildren(...visible.map(renderIdea));
  ideaCount.textContent = `${visible.length} idea${visible.length === 1 ? "" : "s"}`;
  emptyState.hidden = visible.length > 0;
}

function renderIdea(idea) {
  const item = document.createElement("li");
  item.className = "card idea";

  const head = document.createElement("div");
  head.className = "idea-head";

  const title = document.createElement("span");
  title.className = "idea-title";
  title.textContent = idea.title;

  const actions = document.createElement("div");
  actions.className = "idea-actions";

  const status = document.createElement("select");
  for (const option of STATUSES) status.append(new Option(option, option));
  status.value = idea.status;
  status.addEventListener("change", () => updateIdea(idea.id, { status: status.value }));

  const episode = state.episodes.find((item) => item.ideaId === idea.id);
  const script = document.createElement("button");
  script.className = "link-button";
  script.textContent = episode ? "Open script" : "Write script";
  script.addEventListener("click", () => openScriptForIdea(idea));

  const remove = document.createElement("button");
  remove.className = "link-button";
  remove.textContent = "Delete";
  remove.addEventListener("click", () => deleteIdea(idea.id));

  actions.append(status, script, remove);
  head.append(title, actions);
  item.append(head);

  if (idea.notes) {
    const notes = document.createElement("p");
    notes.className = "idea-notes muted";
    notes.textContent = idea.notes;
    item.append(notes);
  }

  const tags = document.createElement("div");
  tags.className = "tags";
  for (const text of [channelNameById(idea.channelId), ...idea.platforms]) {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  }
  item.append(tags);

  return item;
}

function render() {
  renderChannels();
  renderIdeas();
  renderScripts();
  renderBubbles();
  renderCalendar();
}

function showView(name) {
  for (const tab of document.querySelectorAll(".tab[data-view]")) {
    tab.classList.toggle("is-active", tab.dataset.view === name);
    $(`view-${tab.dataset.view}`).hidden = tab.dataset.view !== name;
  }
  // Scripts may have changed since the bubble editor was last drawn.
  if (name === "bubbles") renderBubbles();
}

// ---------- actions ----------

function openScriptForIdea(idea) {
  const existing = state.episodes.find((episode) => episode.ideaId === idea.id);
  if (existing) {
    activeEpisodeId = existing.id;
  } else {
    createEpisode({ title: idea.title, channelId: idea.channelId, ideaId: idea.id });
    if (idea.status === "Idea") idea.status = "Scripting";
    saveState();
  }
  render();
  showView("scripts");
}

function selectChannel(id) {
  activeChannelId = id;
  if (id !== null && activeEpisode()?.channelId !== id) activeEpisodeId = null;
  render();
}

function addChannel(name) {
  const channel = { id: newId(), name };
  state.channels.push(channel);
  activeChannelId = channel.id;
  saveState();
  render();
}

function deleteChannel(id) {
  const ideaTotal = state.ideas.filter((idea) => idea.channelId === id).length;
  const episodeTotal = state.episodes.filter((episode) => episode.channelId === id).length;
  const message =
    ideaTotal || episodeTotal
      ? `Delete "${channelNameById(id)}" with its ${ideaTotal} idea(s) and ${episodeTotal} episode(s)?`
      : `Delete "${channelNameById(id)}"?`;
  if (!confirm(message)) return;

  state.channels = state.channels.filter((channel) => channel.id !== id);
  state.ideas = state.ideas.filter((idea) => idea.channelId !== id);
  state.episodes = state.episodes.filter((episode) => episode.channelId !== id);
  state.posts = state.posts.filter((post) => episodeById(post.episodeId));
  if (!activeEpisode()) activeEpisodeId = null;
  if (activeChannelId === id) activeChannelId = null;
  saveState();
  render();
}

function addIdea(idea) {
  state.ideas.push({ id: newId(), status: "Idea", createdAt: Date.now(), ...idea });
  saveState();
  renderIdeas();
}

function updateIdea(id, changes) {
  const idea = state.ideas.find((item) => item.id === id);
  if (!idea) return;
  Object.assign(idea, changes);
  saveState();
  renderIdeas();
}

function deleteIdea(id) {
  if (!confirm("Delete this idea?")) return;
  state.ideas = state.ideas.filter((idea) => idea.id !== id);
  saveState();
  renderIdeas();
}

// ---------- events ----------

channelForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = channelName.value.trim();
  if (!name) return;
  addChannel(name);
  channelForm.reset();
});

ideaForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = ideaTitle.value.trim();
  if (!title || !ideaChannel.value) return;

  const platforms = [...ideaForm.querySelectorAll(".platforms input:checked")].map((box) => box.value);
  addIdea({ title, notes: ideaNotes.value.trim(), channelId: ideaChannel.value, platforms });

  ideaTitle.value = "";
  ideaNotes.value = "";
  ideaTitle.focus();
});

filterStatus.addEventListener("change", renderIdeas);

for (const tab of document.querySelectorAll(".tab[data-view]")) {
  tab.addEventListener("click", () => showView(tab.dataset.view));
}

initScripts();
initBubbles();
initCalendar();
render();
