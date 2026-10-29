# Shorts Studio 

A web app for planning and producing AI-assisted short videos for YouTube Shorts, Instagram Reels and TikTok.

**Live app:** https://gamzeebilgiin-hub.github.io/shorts-studio/

## Why

I run several AI-assisted short-form video projects: four Shorts channels and an illustrated story series. Each episode has 15–20 vertical scenes, and each scene needs a script line, an image prompt, consistent character designs, and speech, thought or text-message bubbles.

Today I manage all of this with Claude Code in folders and Markdown files. Shorts Studio turns that workflow into one tool.

## Planned features

- **Idea bank:** collect and sort video ideas per channel
- **Scene-by-scene scripts:** write each episode as a list of scenes with dialogue and image prompts
- **Character cards:** keep faces, hair and outfits consistent across episodes
- **Speech bubble editor:** place speech, thought and message bubbles on generated images and export finished scene sets
- **Publishing calendar:** plan posts for YouTube Shorts, Instagram Reels and TikTok, and track each episode's status

## Status

Early development. The production workflow already exists; the app is being built step by step with Claude Code.

- [x] Idea bank: channels, ideas, platforms, status and filtering
- [x] Scene-by-scene scripts: episodes, scenes with time, visual, dialogue lines (speech, thought, message), image prompt and file name; reorder scenes; export to Markdown
- [ ] Character cards
- [x] Speech bubble editor: load a scene image, drag each dialogue line as a speech, thought or phone-message bubble, adjust width, text size and tail side, and download the finished PNG at full resolution
- [x] Publishing calendar: schedule an episode on YouTube, Instagram and TikTok at a date and time, see the month at a glance, mark posts as posted (the idea moves to "Published" when every post is out)

## Get help from Claude

Each scene has a **✨ Get help** button that suggests the scene's visual, dialogue lines and image prompt, using the episode's other scenes as context.

- **With your own Anthropic API key** (AI settings in the top bar), the scene is written directly with Claude (`claude-opus-5-5`). The key is stored only in your browser and sent only to Anthropic; usage is billed to your API account.
- **Without a key**, you get a ready-made request to paste into Claude or ChatGPT; paste the answer back and press Apply.

## Languages

The interface is available in English, Türkçe, Español, Deutsch, Français and Português. It opens in your browser's language and you can switch it from the menu in the top bar; dates and weekdays follow the chosen language.

## How to run

No installation needed. Open the [live app](https://gamzeebilgiin-hub.github.io/shorts-studio/), or download the repository and open `index.html` in your browser. Your data is saved in the browser on your own computer: text in localStorage, scene images in IndexedDB.

## License

MIT, see [LICENSE](LICENSE).
