# Shorts Studio 

A web app for planning and producing AI-assisted short videos for YouTube Shorts, Instagram Reels and TikTok.

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
- [ ] Publishing calendar

## How to run

No installation needed. Download the repository and open `index.html` in your browser. Your data is saved in the browser on your own computer: text in localStorage, scene images in IndexedDB.

## License

MIT, see [LICENSE](LICENSE).
