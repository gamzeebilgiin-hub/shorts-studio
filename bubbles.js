// Shorts Studio – speech bubble editor.
// Places each scene's dialogue lines as bubbles on the scene image and exports a finished PNG.
// Scene images are kept in IndexedDB (they are too large for localStorage); bubble layout lives
// on each dialogue line in the shared state.

let bubbleEpisodeId = null;
let bubbleSceneId = null;
let selectedLine = null;
let currentImage = null; // HTMLImageElement for the open scene, or null
let dragging = null; // { line, dx, dy } while a bubble is being moved

// ---------- image storage (IndexedDB) ----------

const imageDb = new Promise((resolve, reject) => {
  const request = indexedDB.open("shorts-studio-images", 1);
  request.onupgradeneeded = () => request.result.createObjectStore("images");
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

async function imageStore(mode) {
  return (await imageDb).transaction("images", mode).objectStore("images");
}

async function saveSceneImage(sceneId, blob) {
  const store = await imageStore("readwrite");
  await new Promise((resolve, reject) => {
    const request = store.put(blob, sceneId);
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
}

async function loadSceneImage(sceneId) {
  const store = await imageStore("readonly");
  const blob = await new Promise((resolve, reject) => {
    const request = store.get(sceneId);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
  if (!blob) return null;

  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("Could not read the image file"));
    image.src = URL.createObjectURL(blob);
  });
  return image;
}

// ---------- bubble layout ----------

function bubbleSettings(line, index) {
  line.bubble ??= {
    x: index % 2 === 0 ? 0.06 : 0.4,
    y: 0.05 + index * 0.14,
    w: 0.54,
    size: 0.042,
    tail: index % 2 === 0 ? "left" : "right",
  };
  return line.bubble;
}

function wrapText(ctx, text, maxWidth) {
  const rows = [];
  for (const paragraph of text.split("\n")) {
    let row = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = row ? `${row} ${word}` : word;
      if (row && ctx.measureText(candidate).width > maxWidth) {
        rows.push(row);
        row = word;
      } else {
        row = candidate;
      }
    }
    rows.push(row);
  }
  return rows;
}

// Works out where a bubble sits, in pixels of an image `width` × `height`.
function bubbleBox(ctx, line, index, width, height) {
  const settings = bubbleSettings(line, index);
  const font = settings.size * width;
  ctx.font = `600 ${font}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

  const padX = font * 0.7;
  const padY = font * 0.5;
  const boxWidth = settings.w * width;
  const rows = wrapText(ctx, line.text.trim() || "…", boxWidth - padX * 2);
  const lineHeight = font * 1.25;

  return {
    x: settings.x * width,
    y: settings.y * height,
    w: boxWidth,
    h: rows.length * lineHeight + padY * 2,
    rows,
    font,
    lineHeight,
    padY,
    settings,
  };
}

function drawBubble(ctx, line, box) {
  const { x, y, w, h, font, settings } = box;
  const stroke = Math.max(2, font * 0.09);
  const tailSide = settings.tail;

  if (line.kind === "message") {
    // Phone message: incoming (left) grey, outgoing (right) blue, no outline.
    const outgoing = tailSide === "right";
    ctx.fillStyle = outgoing ? "#2f7cf6" : "#e9e9eb";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, font * 0.9);
    ctx.fill();
    drawRows(ctx, box, outgoing ? "#ffffff" : "#111111");
    return;
  }

  const shapes = [];
  if (line.kind === "thought") {
    shapes.push((c) => c.roundRect(x, y, w, h, Math.min(h / 2, font * 2)));
    if (tailSide !== "none") {
      const direction = tailSide === "left" ? -1 : 1;
      const baseX = x + w / 2 + direction * w * 0.2;
      shapes.push((c) => c.arc(baseX + direction * font * 0.3, y + h + font * 0.55, font * 0.38, 0, Math.PI * 2));
      shapes.push((c) => c.arc(baseX + direction * font * 0.9, y + h + font * 1.25, font * 0.22, 0, Math.PI * 2));
    }
  } else {
    shapes.push((c) => c.roundRect(x, y, w, h, Math.min(h / 2, font * 1.4)));
    if (tailSide !== "none") {
      const direction = tailSide === "left" ? -1 : 1;
      const baseX = x + w / 2 + direction * w * 0.22;
      shapes.push((c) => {
        c.moveTo(baseX - font * 0.45, y + h - stroke);
        c.lineTo(baseX + direction * font * 0.9, y + h + font * 1.1);
        c.lineTo(baseX + font * 0.45, y + h - stroke);
        c.closePath();
      });
    }
  }

  // Stroke every part first, then fill them all: the fill hides the inner seams,
  // so the bubble and its tail read as one outlined shape.
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke * 2;
  ctx.strokeStyle = "#111111";
  for (const shape of shapes) {
    ctx.beginPath();
    shape(ctx);
    ctx.stroke();
  }
  ctx.fillStyle = "#ffffff";
  for (const shape of shapes) {
    ctx.beginPath();
    shape(ctx);
    ctx.fill();
  }

  drawRows(ctx, box, "#111111", line.kind === "thought");
}

function drawRows(ctx, box, color, italic = false) {
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${italic ? "italic " : ""}600 ${box.font}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  box.rows.forEach((row, index) => {
    ctx.fillText(row, box.x + box.w / 2, box.y + box.padY + box.lineHeight * (index + 0.5));
  });
}

function drawScene(ctx, scene, image, { showSelection }) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const lines = scene.lines.filter((line) => line.text.trim());
  lines.forEach((line, index) => {
    const box = bubbleBox(ctx, line, index, width, height);
    drawBubble(ctx, line, box);
    if (showSelection && line === selectedLine) {
      ctx.setLineDash([width * 0.01, width * 0.008]);
      ctx.lineWidth = Math.max(2, width * 0.003);
      ctx.strokeStyle = "#fb8c4b";
      ctx.strokeRect(box.x - 6, box.y - 6, box.w + 12, box.h + 12);
      ctx.setLineDash([]);
    }
  });
}

// ---------- rendering ----------

function bubbleEpisode() {
  return state.episodes.find((episode) => episode.id === bubbleEpisodeId) ?? null;
}

function bubbleScene() {
  return bubbleEpisode()?.scenes.find((scene) => scene.id === bubbleSceneId) ?? null;
}

function renderBubbles() {
  const episodeSelect = $("bubble-episode");
  const episodes = state.episodes.filter((episode) => activeChannelId === null || episode.channelId === activeChannelId);
  if (!episodes.some((episode) => episode.id === bubbleEpisodeId)) {
    bubbleEpisodeId = episodes[0]?.id ?? null;
    bubbleSceneId = null;
  }
  episodeSelect.replaceChildren(...episodes.map((episode) => new Option(episode.title, episode.id)));
  episodeSelect.value = bubbleEpisodeId ?? "";
  $("bubble-empty").hidden = episodes.length > 0;
  $("bubble-workspace").hidden = episodes.length === 0;

  const episode = bubbleEpisode();
  if (!episode) return;
  if (!episode.scenes.some((scene) => scene.id === bubbleSceneId)) {
    bubbleSceneId = episode.scenes[0]?.id ?? null;
    loadCurrentImage();
  }

  $("bubble-scenes").replaceChildren(
    ...episode.scenes.map((scene, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "scene-chip";
      button.classList.toggle("is-active", scene.id === bubbleSceneId);
      button.textContent = index + 1;
      button.title = scene.visual || `Scene ${index + 1}`;
      button.addEventListener("click", () => {
        bubbleSceneId = scene.id;
        selectedLine = null;
        renderBubbles();
        loadCurrentImage();
      });
      return button;
    })
  );

  renderStage();
  renderBubbleControls();
}

async function loadCurrentImage() {
  const sceneId = bubbleSceneId;
  currentImage = null;
  renderStage();
  if (!sceneId) return;
  try {
    const image = await loadSceneImage(sceneId);
    if (sceneId !== bubbleSceneId) return; // another scene was opened meanwhile
    currentImage = image;
  } catch (error) {
    console.warn("Could not load scene image", error);
  }
  renderStage();
}

function renderStage() {
  const canvas = $("bubble-canvas");
  const scene = bubbleScene();
  const hasImage = Boolean(scene && currentImage);
  canvas.hidden = !hasImage;
  $("bubble-no-image").hidden = hasImage || !scene;
  $("bubble-export").disabled = !hasImage;
  if (!hasImage) return;

  canvas.width = currentImage.naturalWidth;
  canvas.height = currentImage.naturalHeight;
  drawScene(canvas.getContext("2d"), scene, currentImage, { showSelection: true });
}

function renderBubbleControls() {
  const scene = bubbleScene();
  const lines = scene ? scene.lines.filter((line) => line.text.trim()) : [];
  $("bubble-no-lines").hidden = !scene || lines.length > 0;

  $("bubble-lines").replaceChildren(
    ...lines.map((line) => {
      const item = document.createElement("li");
      item.classList.toggle("is-active", line === selectedLine);
      item.textContent = `${line.speaker || "?"} (${line.kind}): ${line.text}`;
      item.addEventListener("click", () => selectLine(line));
      return item;
    })
  );

  const controls = $("bubble-controls");
  controls.hidden = !selectedLine;
  if (!selectedLine) return;
  const settings = bubbleSettings(selectedLine, lines.indexOf(selectedLine));
  $("bubble-width").value = Math.round(settings.w * 100);
  $("bubble-size").value = Math.round(settings.size * 1000);
  $("bubble-tail").value = settings.tail;
}

function selectLine(line) {
  selectedLine = line;
  renderStage();
  renderBubbleControls();
}

// ---------- dragging ----------

function canvasPoint(event) {
  const canvas = $("bubble-canvas");
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function bubbleAt(point) {
  const canvas = $("bubble-canvas");
  const ctx = canvas.getContext("2d");
  const lines = bubbleScene().lines.filter((line) => line.text.trim());
  for (let index = lines.length - 1; index >= 0; index--) {
    const box = bubbleBox(ctx, lines[index], index, canvas.width, canvas.height);
    if (point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h) {
      return { line: lines[index], box };
    }
  }
  return null;
}

function startDrag(event) {
  if (!currentImage) return;
  const point = canvasPoint(event);
  const hit = bubbleAt(point);
  if (!hit) {
    selectLine(null);
    return;
  }
  dragging = { line: hit.line, dx: point.x - hit.box.x, dy: point.y - hit.box.y };
  event.currentTarget.setPointerCapture(event.pointerId);
  selectLine(hit.line);
}

function moveDrag(event) {
  if (!dragging) return;
  const canvas = $("bubble-canvas");
  const point = canvasPoint(event);
  const settings = dragging.line.bubble;
  settings.x = Math.min(Math.max((point.x - dragging.dx) / canvas.width, 0), 1 - settings.w);
  settings.y = Math.min(Math.max((point.y - dragging.dy) / canvas.height, 0), 0.97);
  renderStage();
}

function endDrag() {
  if (!dragging) return;
  dragging = null;
  saveState();
}

// ---------- export ----------

function exportFileName(scene) {
  const episode = bubbleEpisode();
  const index = episode.scenes.indexOf(scene) + 1;
  const base = scene.image.trim().replace(/\.[a-z0-9]+$/i, "") || `${String(index).padStart(2, "0")}-scene`;
  return `${base}-bubbles.png`;
}

function exportScene() {
  const scene = bubbleScene();
  if (!scene || !currentImage) return;

  const canvas = document.createElement("canvas");
  canvas.width = currentImage.naturalWidth;
  canvas.height = currentImage.naturalHeight;
  drawScene(canvas.getContext("2d"), scene, currentImage, { showSelection: false });

  canvas.toBlob((blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = exportFileName(scene);
    link.click();
    URL.revokeObjectURL(link.href);
  }, "image/png");
}

// ---------- events ----------

function updateSelected(changes) {
  if (!selectedLine) return;
  Object.assign(selectedLine.bubble, changes);
  if (selectedLine.bubble.x + selectedLine.bubble.w > 1) selectedLine.bubble.x = 1 - selectedLine.bubble.w;
  saveState();
  renderStage();
}

function initBubbles() {
  $("bubble-episode").addEventListener("change", (event) => {
    bubbleEpisodeId = event.target.value;
    bubbleSceneId = null;
    selectedLine = null;
    renderBubbles();
  });

  $("bubble-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const scene = bubbleScene();
    event.target.value = "";
    if (!file || !scene) return;
    try {
      await saveSceneImage(scene.id, file);
    } catch (error) {
      console.warn("Could not save scene image", error);
      alert("The image could not be saved in this browser.");
      return;
    }
    if (!scene.image.trim()) {
      scene.image = file.name;
      saveState();
    }
    loadCurrentImage();
  });

  const canvas = $("bubble-canvas");
  canvas.addEventListener("pointerdown", startDrag);
  canvas.addEventListener("pointermove", moveDrag);
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  $("bubble-width").addEventListener("input", (event) => updateSelected({ w: event.target.value / 100 }));
  $("bubble-size").addEventListener("input", (event) => updateSelected({ size: event.target.value / 1000 }));
  $("bubble-tail").addEventListener("change", (event) => updateSelected({ tail: event.target.value }));
  $("bubble-export").addEventListener("click", exportScene);
}
