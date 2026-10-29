// Shorts Studio – interface languages.
// Loaded first. t(key, params) returns the text for the current language, falling back to English.
// Static text in index.html is marked with data-i18n, data-i18n-placeholder, data-i18n-title and
// data-i18n-aria attributes; applyTranslations() fills them in.

const LANGUAGE_KEY = "shorts-studio:language";

const LANGUAGES = {
  en: { name: "English", locale: "en-GB" },
  tr: { name: "Türkçe", locale: "tr-TR" },
  es: { name: "Español", locale: "es-ES" },
  de: { name: "Deutsch", locale: "de-DE" },
  fr: { name: "Français", locale: "fr-FR" },
  pt: { name: "Português", locale: "pt-BR" },
};

const TRANSLATIONS = {
  en: {
    tab_ideas: "Idea bank", tab_scripts: "Scripts", tab_bubbles: "Bubbles", tab_characters: "Characters",
    tab_calendar: "Calendar", coming_soon: "Coming soon", language: "Language",
    channels: "Channels", new_channel: "New channel name", add: "Add", all_channels: "All channels",
    delete_channel: "Delete channel", unknown_channel: "Unknown channel",
    add_channel_first: "Add a channel first",
    new_idea: "New idea", idea_title: "Idea title", idea_notes: "Hook, story, notes…", save_idea: "Save idea",
    all_statuses: "All statuses", ideas_one: "{count} idea", ideas_other: "{count} ideas",
    ideas_empty: "No ideas yet. Add a channel, then write your first idea.",
    write_script: "Write script", open_script: "Open script", delete: "Delete",
    status_Idea: "Idea", status_Scripting: "Scripting", status_Ready: "Ready", status_Published: "Published",
    confirm_delete_channel: "Delete “{name}”?",
    confirm_delete_channel_all: "Delete “{name}” with its {ideas} idea(s) and {episodes} episode(s)?",
    confirm_delete_idea: "Delete this idea?",
    new_episode: "New episode title", channel: "Channel", create_episode: "Create episode",
    episodes_empty: "No episodes yet. Create one above, or use “Write script” on an idea.",
    episode_title: "Episode title", episode_notes: "Format, character continuity, editing notes…",
    copy_markdown: "Copy Markdown", copied: "Copied!", copy_failed: "Copy failed – use Download",
    download_md: "Download .md", delete_episode: "Delete episode", add_scene: "+ Add scene",
    scenes_one: "{count} scene", scenes_other: "{count} scenes", scene_n: "Scene {n}",
    scene_time: "Time, e.g. 0–3 s", move_up: "Move up", move_down: "Move down", delete_scene: "Delete scene",
    visual: "Visual", visual_placeholder: "What we see in this scene", dialogue: "Dialogue",
    add_line: "+ Add line", add_line_title: "Add a dialogue, thought or message line",
    image_prompt: "Image prompt", image_file: "Image file",
    image_file_placeholder: "Image file name, e.g. 01-secret-plan.png",
    who: "Who", line: "Line", delete_line: "Delete line",
    kind_speech: "speech", kind_thought: "thought", kind_message: "message",
    confirm_delete_scene: "Delete this scene?",
    confirm_delete_episode: "Delete “{title}” with all its scenes and scheduled posts?",
    md_scenes: "Scenes", md_time: "Time", md_prompts: "Image prompts",
    bubbles_empty: "No episodes yet. Write a script first, then place its dialogue here.",
    episode: "Episode", bubbles_no_image: "Choose the scene image on the right to start placing bubbles.",
    choose_image: "Choose scene image", bubbles_title: "Bubbles",
    bubbles_no_lines: "This scene has no dialogue yet. Add lines in Scripts.",
    bubbles_drag: "Drag a bubble on the image to move it.",
    width: "Width", text_size: "Text size", tail: "Tail / side", left: "Left", right: "Right", none: "None",
    download_png: "Download PNG", image_save_failed: "The image could not be saved in this browser.",
    schedule_post: "Schedule a post", post_no_episodes: "Write an episode in Scripts first, then schedule it here.",
    date: "Date", time: "Time", schedule: "Schedule", prev_month: "Previous month", next_month: "Next month",
    today: "Today", posted: "Posted", day_empty: "Nothing scheduled for this day.", any_time: "Any time",
    confirm_delete_post: "Delete this post from the calendar?",
  },

  tr: {
    tab_ideas: "Fikir bankası", tab_scripts: "Senaryolar", tab_bubbles: "Balonlar", tab_characters: "Karakterler",
    tab_calendar: "Takvim", coming_soon: "Yakında", language: "Dil",
    channels: "Kanallar", new_channel: "Yeni kanal adı", add: "Ekle", all_channels: "Tüm kanallar",
    delete_channel: "Kanalı sil", unknown_channel: "Bilinmeyen kanal",
    add_channel_first: "Önce kanal ekle",
    new_idea: "Yeni fikir", idea_title: "Fikir başlığı", idea_notes: "Kanca, hikâye, notlar…", save_idea: "Fikri kaydet",
    all_statuses: "Tüm durumlar", ideas_one: "{count} fikir", ideas_other: "{count} fikir",
    ideas_empty: "Henüz fikir yok. Önce bir kanal ekle, sonra ilk fikrini yaz.",
    write_script: "Senaryo yaz", open_script: "Senaryoyu aç", delete: "Sil",
    status_Idea: "Fikir", status_Scripting: "Senaryo", status_Ready: "Hazır", status_Published: "Yayında",
    confirm_delete_channel: "“{name}” silinsin mi?",
    confirm_delete_channel_all: "“{name}”, {ideas} fikri ve {episodes} bölümüyle birlikte silinsin mi?",
    confirm_delete_idea: "Bu fikir silinsin mi?",
    new_episode: "Yeni bölüm başlığı", channel: "Kanal", create_episode: "Bölüm oluştur",
    episodes_empty: "Henüz bölüm yok. Yukarıdan oluştur ya da bir fikirde “Senaryo yaz”a bas.",
    episode_title: "Bölüm başlığı", episode_notes: "Biçim, karakter sürekliliği, kurgu notları…",
    copy_markdown: "Markdown kopyala", copied: "Kopyalandı!", copy_failed: "Kopyalanamadı – İndir'i kullan",
    download_md: ".md indir", delete_episode: "Bölümü sil", add_scene: "+ Sahne ekle",
    scenes_one: "{count} sahne", scenes_other: "{count} sahne", scene_n: "Sahne {n}",
    scene_time: "Süre, örn. 0–3 sn", move_up: "Yukarı taşı", move_down: "Aşağı taşı", delete_scene: "Sahneyi sil",
    visual: "Görüntü", visual_placeholder: "Bu sahnede ne görüyoruz", dialogue: "Diyalog",
    add_line: "+ Satır ekle", add_line_title: "Konuşma, iç ses ya da mesaj satırı ekle",
    image_prompt: "Görsel prompt'u", image_file: "Görsel dosyası",
    image_file_placeholder: "Görsel dosya adı, örn. 01-gizli-plan.png",
    who: "Kim", line: "Satır", delete_line: "Satırı sil",
    kind_speech: "konuşma", kind_thought: "iç ses", kind_message: "mesaj",
    confirm_delete_scene: "Bu sahne silinsin mi?",
    confirm_delete_episode: "“{title}” tüm sahneleri ve planlı paylaşımlarıyla birlikte silinsin mi?",
    md_scenes: "Sahneler", md_time: "Süre", md_prompts: "Görsel prompt'ları",
    bubbles_empty: "Henüz bölüm yok. Önce bir senaryo yaz, sonra diyaloglarını buraya yerleştir.",
    episode: "Bölüm", bubbles_no_image: "Balon yerleştirmeye başlamak için sağdan sahne görselini seç.",
    choose_image: "Sahne görseli seç", bubbles_title: "Balonlar",
    bubbles_no_lines: "Bu sahnede henüz diyalog yok. Senaryolar'dan satır ekle.",
    bubbles_drag: "Taşımak için görseldeki balonu sürükle.",
    width: "Genişlik", text_size: "Yazı boyutu", tail: "Kuyruk / yön", left: "Sol", right: "Sağ", none: "Yok",
    download_png: "PNG indir", image_save_failed: "Görsel bu tarayıcıya kaydedilemedi.",
    schedule_post: "Paylaşım planla", post_no_episodes: "Önce Senaryolar'da bir bölüm yaz, sonra burada planla.",
    date: "Tarih", time: "Saat", schedule: "Planla", prev_month: "Önceki ay", next_month: "Sonraki ay",
    today: "Bugün", posted: "Paylaşıldı", day_empty: "Bu gün için plan yok.", any_time: "Herhangi bir saat",
    confirm_delete_post: "Bu paylaşım takvimden silinsin mi?",
  },

  es: {
    tab_ideas: "Banco de ideas", tab_scripts: "Guiones", tab_bubbles: "Bocadillos", tab_characters: "Personajes",
    tab_calendar: "Calendario", coming_soon: "Próximamente", language: "Idioma",
    channels: "Canales", new_channel: "Nombre del nuevo canal", add: "Añadir", all_channels: "Todos los canales",
    delete_channel: "Eliminar canal", unknown_channel: "Canal desconocido",
    add_channel_first: "Primero añade un canal",
    new_idea: "Nueva idea", idea_title: "Título de la idea", idea_notes: "Gancho, historia, notas…", save_idea: "Guardar idea",
    all_statuses: "Todos los estados", ideas_one: "{count} idea", ideas_other: "{count} ideas",
    ideas_empty: "Aún no hay ideas. Añade un canal y escribe tu primera idea.",
    write_script: "Escribir guion", open_script: "Abrir guion", delete: "Eliminar",
    status_Idea: "Idea", status_Scripting: "Guion", status_Ready: "Lista", status_Published: "Publicada",
    confirm_delete_channel: "¿Eliminar «{name}»?",
    confirm_delete_channel_all: "¿Eliminar «{name}» con sus {ideas} idea(s) y {episodes} episodio(s)?",
    confirm_delete_idea: "¿Eliminar esta idea?",
    new_episode: "Título del nuevo episodio", channel: "Canal", create_episode: "Crear episodio",
    episodes_empty: "Aún no hay episodios. Crea uno arriba o usa «Escribir guion» en una idea.",
    episode_title: "Título del episodio", episode_notes: "Formato, continuidad de personajes, notas de edición…",
    copy_markdown: "Copiar Markdown", copied: "¡Copiado!", copy_failed: "No se pudo copiar: usa Descargar",
    download_md: "Descargar .md", delete_episode: "Eliminar episodio", add_scene: "+ Añadir escena",
    scenes_one: "{count} escena", scenes_other: "{count} escenas", scene_n: "Escena {n}",
    scene_time: "Tiempo, p. ej. 0–3 s", move_up: "Subir", move_down: "Bajar", delete_scene: "Eliminar escena",
    visual: "Imagen", visual_placeholder: "Qué vemos en esta escena", dialogue: "Diálogo",
    add_line: "+ Añadir línea", add_line_title: "Añadir una línea de diálogo, pensamiento o mensaje",
    image_prompt: "Prompt de imagen", image_file: "Archivo de imagen",
    image_file_placeholder: "Nombre del archivo, p. ej. 01-plan-secreto.png",
    who: "Quién", line: "Línea", delete_line: "Eliminar línea",
    kind_speech: "diálogo", kind_thought: "pensamiento", kind_message: "mensaje",
    confirm_delete_scene: "¿Eliminar esta escena?",
    confirm_delete_episode: "¿Eliminar «{title}» con todas sus escenas y publicaciones programadas?",
    md_scenes: "Escenas", md_time: "Tiempo", md_prompts: "Prompts de imagen",
    bubbles_empty: "Aún no hay episodios. Escribe un guion y luego coloca aquí sus diálogos.",
    episode: "Episodio", bubbles_no_image: "Elige la imagen de la escena a la derecha para empezar a colocar bocadillos.",
    choose_image: "Elegir imagen de la escena", bubbles_title: "Bocadillos",
    bubbles_no_lines: "Esta escena aún no tiene diálogo. Añade líneas en Guiones.",
    bubbles_drag: "Arrastra un bocadillo sobre la imagen para moverlo.",
    width: "Ancho", text_size: "Tamaño del texto", tail: "Cola / lado", left: "Izquierda", right: "Derecha", none: "Ninguna",
    download_png: "Descargar PNG", image_save_failed: "No se pudo guardar la imagen en este navegador.",
    schedule_post: "Programar una publicación", post_no_episodes: "Primero escribe un episodio en Guiones y luego prográmalo aquí.",
    date: "Fecha", time: "Hora", schedule: "Programar", prev_month: "Mes anterior", next_month: "Mes siguiente",
    today: "Hoy", posted: "Publicado", day_empty: "No hay nada programado para este día.", any_time: "Cualquier hora",
    confirm_delete_post: "¿Eliminar esta publicación del calendario?",
  },

  de: {
    tab_ideas: "Ideenbank", tab_scripts: "Skripte", tab_bubbles: "Sprechblasen", tab_characters: "Figuren",
    tab_calendar: "Kalender", coming_soon: "Demnächst", language: "Sprache",
    channels: "Kanäle", new_channel: "Name des neuen Kanals", add: "Hinzufügen", all_channels: "Alle Kanäle",
    delete_channel: "Kanal löschen", unknown_channel: "Unbekannter Kanal",
    add_channel_first: "Zuerst einen Kanal anlegen",
    new_idea: "Neue Idee", idea_title: "Titel der Idee", idea_notes: "Hook, Story, Notizen…", save_idea: "Idee speichern",
    all_statuses: "Alle Status", ideas_one: "{count} Idee", ideas_other: "{count} Ideen",
    ideas_empty: "Noch keine Ideen. Lege einen Kanal an und schreibe deine erste Idee.",
    write_script: "Skript schreiben", open_script: "Skript öffnen", delete: "Löschen",
    status_Idea: "Idee", status_Scripting: "Im Skript", status_Ready: "Bereit", status_Published: "Veröffentlicht",
    confirm_delete_channel: "„{name}“ löschen?",
    confirm_delete_channel_all: "„{name}“ mit {ideas} Idee(n) und {episodes} Folge(n) löschen?",
    confirm_delete_idea: "Diese Idee löschen?",
    new_episode: "Titel der neuen Folge", channel: "Kanal", create_episode: "Folge erstellen",
    episodes_empty: "Noch keine Folgen. Erstelle oben eine oder nutze „Skript schreiben“ bei einer Idee.",
    episode_title: "Titel der Folge", episode_notes: "Format, Figurenkontinuität, Schnittnotizen…",
    copy_markdown: "Markdown kopieren", copied: "Kopiert!", copy_failed: "Kopieren fehlgeschlagen – nutze Herunterladen",
    download_md: ".md herunterladen", delete_episode: "Folge löschen", add_scene: "+ Szene hinzufügen",
    scenes_one: "{count} Szene", scenes_other: "{count} Szenen", scene_n: "Szene {n}",
    scene_time: "Zeit, z. B. 0–3 s", move_up: "Nach oben", move_down: "Nach unten", delete_scene: "Szene löschen",
    visual: "Bild", visual_placeholder: "Was wir in dieser Szene sehen", dialogue: "Dialog",
    add_line: "+ Zeile hinzufügen", add_line_title: "Dialog-, Gedanken- oder Nachrichtenzeile hinzufügen",
    image_prompt: "Bild-Prompt", image_file: "Bilddatei",
    image_file_placeholder: "Dateiname, z. B. 01-geheimer-plan.png",
    who: "Wer", line: "Zeile", delete_line: "Zeile löschen",
    kind_speech: "Rede", kind_thought: "Gedanke", kind_message: "Nachricht",
    confirm_delete_scene: "Diese Szene löschen?",
    confirm_delete_episode: "„{title}“ mit allen Szenen und geplanten Beiträgen löschen?",
    md_scenes: "Szenen", md_time: "Zeit", md_prompts: "Bild-Prompts",
    bubbles_empty: "Noch keine Folgen. Schreibe zuerst ein Skript und platziere dann hier die Dialoge.",
    episode: "Folge", bubbles_no_image: "Wähle rechts das Szenenbild, um Sprechblasen zu platzieren.",
    choose_image: "Szenenbild wählen", bubbles_title: "Sprechblasen",
    bubbles_no_lines: "Diese Szene hat noch keinen Dialog. Füge Zeilen unter Skripte hinzu.",
    bubbles_drag: "Ziehe eine Sprechblase auf dem Bild, um sie zu verschieben.",
    width: "Breite", text_size: "Textgröße", tail: "Spitze / Seite", left: "Links", right: "Rechts", none: "Keine",
    download_png: "PNG herunterladen", image_save_failed: "Das Bild konnte in diesem Browser nicht gespeichert werden.",
    schedule_post: "Beitrag planen", post_no_episodes: "Schreibe zuerst eine Folge unter Skripte und plane sie dann hier.",
    date: "Datum", time: "Uhrzeit", schedule: "Planen", prev_month: "Vorheriger Monat", next_month: "Nächster Monat",
    today: "Heute", posted: "Gepostet", day_empty: "Für diesen Tag ist nichts geplant.", any_time: "Beliebige Zeit",
    confirm_delete_post: "Diesen Beitrag aus dem Kalender löschen?",
  },

  fr: {
    tab_ideas: "Banque d'idées", tab_scripts: "Scripts", tab_bubbles: "Bulles", tab_characters: "Personnages",
    tab_calendar: "Calendrier", coming_soon: "Bientôt", language: "Langue",
    channels: "Chaînes", new_channel: "Nom de la nouvelle chaîne", add: "Ajouter", all_channels: "Toutes les chaînes",
    delete_channel: "Supprimer la chaîne", unknown_channel: "Chaîne inconnue",
    add_channel_first: "Ajoute d'abord une chaîne",
    new_idea: "Nouvelle idée", idea_title: "Titre de l'idée", idea_notes: "Accroche, histoire, notes…", save_idea: "Enregistrer l'idée",
    all_statuses: "Tous les statuts", ideas_one: "{count} idée", ideas_other: "{count} idées",
    ideas_empty: "Aucune idée pour l'instant. Ajoute une chaîne, puis écris ta première idée.",
    write_script: "Écrire le script", open_script: "Ouvrir le script", delete: "Supprimer",
    status_Idea: "Idée", status_Scripting: "Écriture", status_Ready: "Prêt", status_Published: "Publié",
    confirm_delete_channel: "Supprimer « {name} » ?",
    confirm_delete_channel_all: "Supprimer « {name} » avec ses {ideas} idée(s) et {episodes} épisode(s) ?",
    confirm_delete_idea: "Supprimer cette idée ?",
    new_episode: "Titre du nouvel épisode", channel: "Chaîne", create_episode: "Créer l'épisode",
    episodes_empty: "Aucun épisode pour l'instant. Crées-en un ci-dessus ou utilise « Écrire le script » sur une idée.",
    episode_title: "Titre de l'épisode", episode_notes: "Format, continuité des personnages, notes de montage…",
    copy_markdown: "Copier en Markdown", copied: "Copié !", copy_failed: "Échec de la copie – utilise Télécharger",
    download_md: "Télécharger .md", delete_episode: "Supprimer l'épisode", add_scene: "+ Ajouter une scène",
    scenes_one: "{count} scène", scenes_other: "{count} scènes", scene_n: "Scène {n}",
    scene_time: "Durée, ex. 0–3 s", move_up: "Monter", move_down: "Descendre", delete_scene: "Supprimer la scène",
    visual: "Visuel", visual_placeholder: "Ce que l'on voit dans cette scène", dialogue: "Dialogue",
    add_line: "+ Ajouter une réplique", add_line_title: "Ajouter une réplique, une pensée ou un message",
    image_prompt: "Prompt d'image", image_file: "Fichier image",
    image_file_placeholder: "Nom du fichier, ex. 01-plan-secret.png",
    who: "Qui", line: "Réplique", delete_line: "Supprimer la réplique",
    kind_speech: "parole", kind_thought: "pensée", kind_message: "message",
    confirm_delete_scene: "Supprimer cette scène ?",
    confirm_delete_episode: "Supprimer « {title} » avec toutes ses scènes et publications prévues ?",
    md_scenes: "Scènes", md_time: "Durée", md_prompts: "Prompts d'image",
    bubbles_empty: "Aucun épisode pour l'instant. Écris d'abord un script, puis place ses dialogues ici.",
    episode: "Épisode", bubbles_no_image: "Choisis l'image de la scène à droite pour commencer à placer les bulles.",
    choose_image: "Choisir l'image de la scène", bubbles_title: "Bulles",
    bubbles_no_lines: "Cette scène n'a pas encore de dialogue. Ajoute des répliques dans Scripts.",
    bubbles_drag: "Fais glisser une bulle sur l'image pour la déplacer.",
    width: "Largeur", text_size: "Taille du texte", tail: "Pointe / côté", left: "Gauche", right: "Droite", none: "Aucune",
    download_png: "Télécharger le PNG", image_save_failed: "Impossible d'enregistrer l'image dans ce navigateur.",
    schedule_post: "Planifier une publication", post_no_episodes: "Écris d'abord un épisode dans Scripts, puis planifie-le ici.",
    date: "Date", time: "Heure", schedule: "Planifier", prev_month: "Mois précédent", next_month: "Mois suivant",
    today: "Aujourd'hui", posted: "Publié", day_empty: "Rien de prévu ce jour-là.", any_time: "N'importe quelle heure",
    confirm_delete_post: "Supprimer cette publication du calendrier ?",
  },

  pt: {
    tab_ideas: "Banco de ideias", tab_scripts: "Roteiros", tab_bubbles: "Balões", tab_characters: "Personagens",
    tab_calendar: "Calendário", coming_soon: "Em breve", language: "Idioma",
    channels: "Canais", new_channel: "Nome do novo canal", add: "Adicionar", all_channels: "Todos os canais",
    delete_channel: "Excluir canal", unknown_channel: "Canal desconhecido",
    add_channel_first: "Adicione um canal primeiro",
    new_idea: "Nova ideia", idea_title: "Título da ideia", idea_notes: "Gancho, história, notas…", save_idea: "Salvar ideia",
    all_statuses: "Todos os status", ideas_one: "{count} ideia", ideas_other: "{count} ideias",
    ideas_empty: "Ainda não há ideias. Adicione um canal e escreva sua primeira ideia.",
    write_script: "Escrever roteiro", open_script: "Abrir roteiro", delete: "Excluir",
    status_Idea: "Ideia", status_Scripting: "Roteiro", status_Ready: "Pronto", status_Published: "Publicado",
    confirm_delete_channel: "Excluir “{name}”?",
    confirm_delete_channel_all: "Excluir “{name}” com {ideas} ideia(s) e {episodes} episódio(s)?",
    confirm_delete_idea: "Excluir esta ideia?",
    new_episode: "Título do novo episódio", channel: "Canal", create_episode: "Criar episódio",
    episodes_empty: "Ainda não há episódios. Crie um acima ou use “Escrever roteiro” em uma ideia.",
    episode_title: "Título do episódio", episode_notes: "Formato, continuidade dos personagens, notas de edição…",
    copy_markdown: "Copiar Markdown", copied: "Copiado!", copy_failed: "Falha ao copiar – use Baixar",
    download_md: "Baixar .md", delete_episode: "Excluir episódio", add_scene: "+ Adicionar cena",
    scenes_one: "{count} cena", scenes_other: "{count} cenas", scene_n: "Cena {n}",
    scene_time: "Tempo, ex. 0–3 s", move_up: "Mover para cima", move_down: "Mover para baixo", delete_scene: "Excluir cena",
    visual: "Visual", visual_placeholder: "O que vemos nesta cena", dialogue: "Diálogo",
    add_line: "+ Adicionar fala", add_line_title: "Adicionar fala, pensamento ou mensagem",
    image_prompt: "Prompt da imagem", image_file: "Arquivo de imagem",
    image_file_placeholder: "Nome do arquivo, ex. 01-plano-secreto.png",
    who: "Quem", line: "Fala", delete_line: "Excluir fala",
    kind_speech: "fala", kind_thought: "pensamento", kind_message: "mensagem",
    confirm_delete_scene: "Excluir esta cena?",
    confirm_delete_episode: "Excluir “{title}” com todas as cenas e publicações agendadas?",
    md_scenes: "Cenas", md_time: "Tempo", md_prompts: "Prompts de imagem",
    bubbles_empty: "Ainda não há episódios. Escreva um roteiro e depois posicione os diálogos aqui.",
    episode: "Episódio", bubbles_no_image: "Escolha a imagem da cena à direita para começar a posicionar balões.",
    choose_image: "Escolher imagem da cena", bubbles_title: "Balões",
    bubbles_no_lines: "Esta cena ainda não tem diálogo. Adicione falas em Roteiros.",
    bubbles_drag: "Arraste um balão na imagem para movê-lo.",
    width: "Largura", text_size: "Tamanho do texto", tail: "Rabicho / lado", left: "Esquerda", right: "Direita", none: "Nenhum",
    download_png: "Baixar PNG", image_save_failed: "Não foi possível salvar a imagem neste navegador.",
    schedule_post: "Agendar publicação", post_no_episodes: "Primeiro escreva um episódio em Roteiros e depois agende aqui.",
    date: "Data", time: "Hora", schedule: "Agendar", prev_month: "Mês anterior", next_month: "Próximo mês",
    today: "Hoje", posted: "Publicado", day_empty: "Nada agendado para este dia.", any_time: "Qualquer horário",
    confirm_delete_post: "Excluir esta publicação do calendário?",
  },
};

let currentLanguage = detectLanguage();

function detectLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved && LANGUAGES[saved]) return saved;
  } catch (error) {
    console.warn("Could not read language setting", error);
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const code = tag?.slice(0, 2).toLowerCase();
    if (LANGUAGES[code]) return code;
  }
  return "en";
}

function locale() {
  return LANGUAGES[currentLanguage].locale;
}

// t("ideas", { count: 3 }) picks ideas_one / ideas_other by the language's plural rules.
function t(key, params = {}) {
  const table = TRANSLATIONS[currentLanguage];
  let name = key;
  if ("count" in params) {
    const rule = new Intl.PluralRules(locale()).select(params.count);
    name = `${key}_${rule}` in table || `${key}_${rule}` in TRANSLATIONS.en ? `${key}_${rule}` : `${key}_other`;
  }
  const text = table[name] ?? TRANSLATIONS.en[name] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, param) => (param in params ? params[param] : match));
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  for (const element of document.querySelectorAll("[data-i18n]")) element.textContent = t(element.dataset.i18n);
  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) element.placeholder = t(element.dataset.i18nPlaceholder);
  for (const element of document.querySelectorAll("[data-i18n-title]")) element.title = t(element.dataset.i18nTitle);
  for (const element of document.querySelectorAll("[data-i18n-aria]")) element.setAttribute("aria-label", t(element.dataset.i18nAria));
}

function setLanguage(code) {
  if (!LANGUAGES[code]) return;
  currentLanguage = code;
  try {
    localStorage.setItem(LANGUAGE_KEY, code);
  } catch (error) {
    console.warn("Could not save language setting", error);
  }
  applyTranslations();
}
