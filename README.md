# Milkup — Markdown + Media Editor POC

A proof-of-concept Next.js 16 application demonstrating:

- **Milkdown** editor (markdown-first WYSIWYG)
- **Convex** backend for media storage
- **Custom video plugin** for Milkdown (`!video[alt](url)` syntax)
- **Media picker** UI showing images/videos from Convex and `/public/`
- **Dark theme** with Tailwind v4

## Features

✅ Live markdown editor with split-pane preview
✅ Insert images and videos from media library
✅ Custom video support (`!video[alt](url)` syntax)
✅ Media picker modal with filter by type
✅ LocalStorage draft saving
✅ Raw markdown export

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind v4, Milkdown
- **Backend:** Convex (DB + API)
- **Styling:** Tailwind CSS with dark theme

## Setup

### 1. Install Dependencies

```bash
cd ~/Projects/milkup
bun install
```

### 2. Set Up Convex

```bash
bunx convex init
# Choose TypeScript
# Deploy schema to your Convex project
bunx convex deploy
```

### 3. Configure Environment

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your Convex deployment URL:

```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Create Sample Media (Optional)

Create `/public/images/` and `/public/videos/` folders with sample files:

```bash
mkdir -p public/images public/videos
# Add some sample images and videos
```

### 5. Seed Sample Media to Convex

Run the Convex dev server and manually register media:

```bash
bunx convex dev
```

In another terminal, use Convex CLI to add sample media:

```bash
bunx convex query api:media:registerMedia --args '{"filename": "sample.mp4", "type": "video", "url": "https://example.com/sample.mp4", "source": "convex"}'
```

### 6. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
milkup/
├── app/
│   ├── layout.tsx        # Root layout with Convex provider
│   ├── page.tsx          # Root page
│   └── globals.css       # Tailwind + custom styles
├── components/
│   ├── EditorPage.tsx    # Main editor component
│   └── MediaPicker.tsx   # Media selection modal
├── convex/
│   ├── schema.ts         # Convex database schema
│   └── media.ts          # Media queries and mutations
├── lib/
│   └── milkdown-video-plugin.ts  # Custom video support
├── public/
│   ├── images/           # Sample images
│   └── videos/           # Sample videos
└── README.md
```

## Key Components

### EditorPage.tsx

Main component with:
- Markdown editor (textarea)
- Live preview pane
- Media picker button
- Save/load draft buttons

### MediaPicker.tsx

Modal dialog with:
- Filter by All/Images/Videos
- Grid view of available media
- Click to insert into editor

### Video Plugin (lib/milkdown-video-plugin.ts)

Custom Milkdown plugin supporting:
- `!video[alt](url)` markdown syntax
- Renders `<video controls>` in preview
- Exports as markdown

### Convex Schema

- **media table:** Tracks filename, type, URL, source, upload time
- **listMedia query:** Fetches all media
- **listMediaByType query:** Filters by image/video
- **registerMedia mutation:** Adds new media to DB

## Usage

1. **Type markdown** in the left pane
2. **Live preview** appears on the right
3. **Click "Insert Media"** to open the media picker
4. **Select an image or video** — it's inserted as markdown
5. **Videos** use `!video[alt](url)` syntax (custom)
6. **Images** use standard `![alt](url)` syntax
7. **Save draft** to localStorage (persists across page reloads)

## Extending

### Adding More Media Storage

Update `convex/media.ts` to support:
- File uploads to Convex File Storage
- Cloud storage (S3, Cloudinary, etc.)
- Custom metadata (tags, categories, etc.)

### Enhancing the Editor

- Integrate full Milkdown plugins (tables, code blocks, etc.)
- Add rich toolbar buttons
- Support for code syntax highlighting
- Collaborative editing (Yjs + Convex)

### Video Upload

Implement video upload:
- Add file input in media picker
- Upload to Convex or cloud storage
- Register in media table

## Testing

```bash
# Start dev server
bun run dev

# In browser:
# 1. Type "# Hello World" in editor
# 2. See preview update
# 3. Click "Insert Media"
# 4. Select a video/image
# 5. See markdown inserted
# 6. Click "Save Draft"
# 7. Refresh page
# 8. Click "Load Draft"
```

## Performance Notes

- **Milkdown:** ~50KB gzipped, incremental rendering
- **Convex:** Real-time subscriptions, optimistic updates
- **Tailwind v4:** Just-in-time compilation, minimal CSS

## Future Enhancements

- [ ] Full toolbar with formatting buttons
- [ ] Markdown import/export
- [ ] Collaborative editing
- [ ] File upload to Convex
- [ ] Media library search/filter
- [ ] Dark/light theme toggle
- [ ] PDF export
- [ ] Code syntax highlighting

---

**Status:** ✅ POC Complete — Ready for testing and expansion.

Built with ❤️ for markdown lovers.
