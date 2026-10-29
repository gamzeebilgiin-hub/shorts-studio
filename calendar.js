// Shorts Studio – publishing calendar.
// Each post is one episode on one platform at a date and time. When every post of an
// episode is marked as posted, the idea it came from moves to "Published".

const PLATFORMS = ["YouTube", "Instagram", "TikTok"];

let calendarMonth = startOfMonth(new Date());
let selectedDay = dayKey(new Date());

// ---------- dates ----------

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Local calendar day as YYYY-MM-DD (toISOString would shift to UTC).
function dayKey(date) {
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ---------- data helpers ----------

function episodeById(id) {
  return state.episodes.find((episode) => episode.id === id) ?? null;
}

function visiblePosts() {
  return state.posts.filter((post) => {
    const episode = episodeById(post.episodeId);
    return episode && (activeChannelId === null || episode.channelId === activeChannelId);
  });
}

function postsOn(day) {
  return visiblePosts()
    .filter((post) => post.date === day)
    .sort((a, b) => a.time.localeCompare(b.time));
}

function syncIdeaStatus(episodeId) {
  const episode = episodeById(episodeId);
  const idea = episode?.ideaId && state.ideas.find((item) => item.id === episode.ideaId);
  if (!idea) return;
  const posts = state.posts.filter((post) => post.episodeId === episodeId);
  if (posts.length && posts.every((post) => post.status === "posted")) idea.status = "Published";
  else if (idea.status === "Published") idea.status = "Ready";
}

// ---------- rendering ----------

function renderCalendar() {
  const episodes = state.episodes.filter((episode) => activeChannelId === null || episode.channelId === activeChannelId);
  const episodeSelect = $("post-episode");
  const previous = episodeSelect.value;
  episodeSelect.replaceChildren(...episodes.map((episode) => new Option(episode.title, episode.id)));
  if (episodes.some((episode) => episode.id === previous)) episodeSelect.value = previous;
  $("post-form").querySelector("button[type=submit]").disabled = episodes.length === 0;
  $("post-no-episodes").hidden = episodes.length > 0;

  renderMonth();
  renderDay();
}

function renderMonth() {
  $("calendar-title").textContent = calendarMonth.toLocaleDateString(locale(), { month: "long", year: "numeric" });

  // Weekday names in the current language, Monday first (1 January 2024 was a Monday).
  const grid = $("calendar-grid");
  const cells = Array.from({ length: 7 }, (_, index) => {
    const head = document.createElement("div");
    head.className = "weekday";
    head.textContent = new Date(2024, 0, 1 + index).toLocaleDateString(locale(), { weekday: "short" });
    return head;
  });

  // Monday-first grid: pad with the days before the 1st.
  const offset = (calendarMonth.getDay() + 6) % 7;
  const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1 - offset);
  const today = dayKey(new Date());

  for (let i = 0; i < 42; i++) {
    const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
    const key = dayKey(date);

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "day";
    cell.classList.toggle("is-outside", date.getMonth() !== calendarMonth.getMonth());
    cell.classList.toggle("is-today", key === today);
    cell.classList.toggle("is-selected", key === selectedDay);
    cell.addEventListener("click", () => {
      selectedDay = key;
      $("post-date").value = key;
      renderMonth();
      renderDay();
    });

    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = date.getDate();
    cell.append(number);

    for (const post of postsOn(key)) {
      const dot = document.createElement("span");
      dot.className = `post-dot platform-${post.platform.toLowerCase()}`;
      dot.classList.toggle("is-posted", post.status === "posted");
      dot.title = `${post.platform} · ${episodeById(post.episodeId).title}`;
      cell.append(dot);
    }

    cells.push(cell);
  }

  grid.replaceChildren(...cells);
}

function renderDay() {
  const date = new Date(`${selectedDay}T00:00`);
  $("day-title").textContent = date.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" });

  const posts = postsOn(selectedDay);
  $("day-empty").hidden = posts.length > 0;
  $("day-posts").replaceChildren(
    ...posts.map((post) => {
      const episode = episodeById(post.episodeId);
      const item = document.createElement("li");
      item.className = "card day-post";
      item.classList.toggle("is-posted", post.status === "posted");

      const tag = document.createElement("span");
      tag.className = `tag platform-tag platform-${post.platform.toLowerCase()}`;
      tag.textContent = post.platform;

      const text = document.createElement("div");
      text.className = "day-post-text";
      const title = document.createElement("strong");
      title.textContent = episode.title;
      const meta = document.createElement("span");
      meta.className = "muted";
      meta.textContent = `${post.time || t("any_time")} · ${channelNameById(episode.channelId)}`;
      text.append(title, meta);

      const actions = document.createElement("div");
      actions.className = "idea-actions";

      const posted = document.createElement("label");
      posted.className = "posted-toggle";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = post.status === "posted";
      box.addEventListener("change", () => {
        post.status = box.checked ? "posted" : "planned";
        syncIdeaStatus(post.episodeId);
        saveState();
        render();
      });
      posted.append(box, ` ${t("posted")}`);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "link-button";
      remove.textContent = t("delete");
      remove.addEventListener("click", () => {
        if (!confirm(t("confirm_delete_post"))) return;
        state.posts = state.posts.filter((item) => item.id !== post.id);
        syncIdeaStatus(post.episodeId);
        saveState();
        render();
      });

      actions.append(posted, remove);
      item.append(tag, text, actions);
      return item;
    })
  );
}

// ---------- events ----------

function initCalendar() {
  $("post-date").value = selectedDay;

  $("post-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const episodeId = $("post-episode").value;
    const date = $("post-date").value;
    const platforms = [...document.querySelectorAll("#post-platforms input:checked")].map((box) => box.value);
    if (!episodeId || !date || platforms.length === 0) return;

    for (const platform of platforms) {
      state.posts.push({ id: newId(), episodeId, platform, date, time: $("post-time").value, status: "planned" });
    }
    syncIdeaStatus(episodeId);
    saveState();

    selectedDay = date;
    calendarMonth = startOfMonth(new Date(`${date}T00:00`));
    render();
  });

  $("calendar-prev").addEventListener("click", () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    renderMonth();
  });

  $("calendar-next").addEventListener("click", () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    renderMonth();
  });

  $("calendar-today").addEventListener("click", () => {
    calendarMonth = startOfMonth(new Date());
    selectedDay = dayKey(new Date());
    $("post-date").value = selectedDay;
    renderMonth();
    renderDay();
  });
}
