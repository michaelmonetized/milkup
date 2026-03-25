# Milkup — WYSIWYG Editor Build Plan

**Project:** Milkup v2 — Word-like rich text editor with Convex + media management  
**Timeline:** 3-4 hours (POC → production)  
**Status:** In progress (subagent building)  
**Repository:** https://github.com/michaelmonetized/milkup  

---

## ⚠️ CONSTRAINTS & SECURITY

**DO NOT USE:**
- ❌ Next.js 15.x (CVE early 2026)
- ❌ React 18.x (CVE early 2026)

**MUST USE:**
- ✅ Next.js 14.2.0 or later (LTS branch)
- ✅ React 19.0.0 or later (latest with security patches)

**Apply this constraint to ALL future projects** (Milkup, HurleyUS, HustleLaunch clients, etc).

---

## Overview

Milkup is a **modern web editor** replacing textarea-based editors on HustleLaunch client websites. Features:

✅ **WYSIWYG interface** — Click toolbar buttons (no markdown syntax)  
✅ **Smart paste** — Word, Google Docs, websites → auto-markdown conversion  
✅ **Media management** — Integrated Convex-backed media picker  
✅ **Markdown export** — Always outputs clean markdown (behind the scenes)  
✅ **Customer blogs** — Foundation for HustleLaunch client blog platforms  

---

## Use Cases

### 1. Replace Existing Editors
- **Current state:** Many HustleLaunch sites use basic textarea editors
- **Problem:** Non-technical users struggle with markdown syntax
- **Solution:** Milkup WYSIWYG eliminates markdown learning curve

### 2. Customer-Managed Blogs
- **Future feature:** HustleLaunch clients manage their own blog content
- **UI:** Drag-drop media, click-to-format toolbar, instant preview
- **Backend:** Convex stores posts + media, Next.js serves frontend

### 3. Email/Newsletter Composition
- **Use case:** Paste newsletter template from Google Docs → auto-formats
- **Output:** Clean markdown for email service or website publishing

---

## Architecture

### Stack
```
Frontend:  Next.js 15 + React 18 + TypeScript + Tailwind v4
Editor:    TipTap (rich text) + html-to-markdown converter
Backend:   Convex (media storage + queries)
Styling:   Lucide icons + dark theme (Slate-900)
```

### Data Flow
```
User action
    ↓
TipTap editor (HTML content model)
    ↓
onUpdate hook: getHTML() → htmlToMarkdown()
    ↓
Raw markdown (state)
    ↓
Convex mutation (save) OR localStorage (draft)
    ↓
Preview pane renders markdown
```

### File Structure
```
milkup/
├── app/
│   ├── layout.tsx              # Root layout + Convex provider
│   ├── page.tsx                # Home page
│   └── globals.css             # Tailwind + TipTap theme
├── components/
│   ├── EditorPage.tsx          # Main page (editor + preview + controls)
│   ├── RichEditor.tsx          # TipTap editor wrapper (NEW)
│   ├── Toolbar.tsx             # Toolbar buttons (NEW)
│   ├── MediaPicker.tsx         # Media selection modal
│   └── PasteHandler.tsx        # Paste event listener (NEW)
├── lib/
│   ├── converters.ts           # htmlToMarkdown, markdownToHtml (NEW)
│   └── milkdown-video-plugin.ts # Video URL detection
├── convex/
│   ├── schema.ts               # Media table schema (NEW)
│   └── media.ts                # Queries + mutations (NEW)
├── public/
│   └── images/, videos/        # Sample media
├── .env.local                  # NEXT_PUBLIC_CONVEX_URL (updated)
└── README.md, BUILDPLAN.md
```

---

## Features (Detailed Spec)

### 1. Rich Text Editor (TipTap)

**Extensions:**
```typescript
StarterKit         // Headings, paragraphs, lists, blockquote, code block, horizontal rule
Image              // Image insertion (base64 + URLs)
Link               // Hyperlinks (clickable)
CustomVideo        // Custom !video[](url) syntax
```

**Editor behavior:**
- Content model: HTML (internal)
- Output: Always markdown
- Real-time updates: onUpdate → markdown state
- Undo/redo: Built into TipTap

**Toolbar buttons:**
| Button | Command | Markdown Effect |
|--------|---------|-----------------|
| **B** | toggleBold() | `**text**` |
| *I* | toggleItalic() | `*text*` |
| H1 | toggleHeading(level:1) | `# Heading` |
| H2 | toggleHeading(level:2) | `## Heading` |
| H3 | toggleHeading(level:3) | `### Heading` |
| • | toggleBulletList() | `- Item` |
| 1. | toggleOrderedList() | `1. Item` |
| > | toggleBlockquote() | `> Quote` |
| <> | toggleCodeBlock() | ` ```code``` ` |
| 🔗 | setLink() | `[text](url)` |
| 🖼️ | insertImage() | `![alt](url)` |
| 📹 | insertMedia() | `!video[alt](url)` |

**Styling:**
- Dark theme: Slate-900 background, slate-100 text
- Active buttons: Blue-600 highlight
- Rounded corners: 8px
- Responsive: Works on mobile + tablet

---

### 2. Paste Support (HTML → Markdown)

**Detection:**
```typescript
document.addEventListener('paste', async (e) => {
  const html = e.clipboardData?.getData('text/html')
  if (html) {
    const markdown = htmlToMarkdown(html)
    editor.chain().focus().insertContent(markdown).run()
  }
})
```

**Sources supported:**
- ✅ Google Docs (tables, lists, headings, images)
- ✅ Microsoft Word (formatting, images)
- ✅ LibreOffice (ODF → HTML)
- ✅ Notion (rich text blocks)
- ✅ Websites (HTML copy-paste)
- ✅ PDFs (text + basic formatting)

**Conversion library:** `html-to-markdown`
- Converts `<b>`, `<strong>` → `**text**`
- Converts `<h1>` → `# Heading`
- Converts `<ul>`, `<li>` → `- Item`
- Converts `<a>` → `[text](url)`
- Converts `<img>` → `![alt](url)`
- Converts `<table>` → markdown table

**Example:**
```html
<!-- User pastes this from Google Docs -->
<p><b>Project Status:</b></p>
<ul>
  <li>Design: <i>In progress</i></li>
  <li>Development: <b>Complete</b></li>
</ul>
```
↓
```markdown
**Project Status:**

- Design: *In progress*
- Development: **Complete**
```

---

### 3. Media Management

**Storage:** Convex File Storage + CDN

**Media table schema:**
```typescript
{
  filename: string,      // "hero-image.jpg"
  type: string,          // "image" | "video"
  url: string,           // CDN URL
  source: string,        // "convex" | "upload"
  uploadedAt: number,    // timestamp
  mimeType?: string,     // "image/jpeg", "video/mp4"
  size?: number,         // bytes
}
```

**Queries:**
```typescript
listMedia()                    // All media items
listMediaByType(type)          // Filter by image/video
searchMedia(query)             // Search by filename
getMedia(id)                   // Single item
```

**Mutations:**
```typescript
uploadFile(file)               // Upload + return URL
registerMedia(metadata)        // Add to media table
deleteMedia(id)                // Remove (soft delete)
updateMedia(id, metadata)      // Edit metadata
```

**Media picker UX:**
- Grid view (thumbnails)
- Filter tabs: All / Images / Videos
- Search box (by filename)
- Click to insert: `![filename](url)` or `!video[filename](url)`
- Drag-and-drop support (future)

---

### 4. Draft Management

**LocalStorage:**
```typescript
// Save
localStorage.setItem('milkup_draft_content', markdown)
localStorage.setItem('milkup_draft_timestamp', Date.now())

// Load
const draft = localStorage.getItem('milkup_draft_content')
```

**Convex integration (future):**
```typescript
// Save to backend
mutation savePost(title, content) {
  return await ctx.db.insert('posts', { title, content, updatedAt: Date.now() })
}
```

---

### 5. Preview & Export

**Live preview pane:**
- Shows rendered markdown (HTML)
- Real-time updates (no debounce)
- Same dark theme as editor

**Raw markdown export:**
- Copy button (in footer)
- Download as .md file (future)
- API endpoint (future): `/api/posts/{id}/markdown`

**Markdown output:**
- Always clean (no HTML tags)
- Readable for archival
- Compatible with any markdown parser (GitHub, Hugo, etc)

---

## Implementation Details

### Phase 1: TipTap Integration (2 hours)

**Files to create/update:**

1. **lib/converters.ts** (NEW)
```typescript
import { convert } from 'html-to-markdown'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

export function htmlToMarkdown(html: string): string {
  return convert(html)
}

export function markdownToHtml(markdown: string): string {
  return md.render(markdown)
}
```

2. **components/Toolbar.tsx** (NEW)
```typescript
import { Editor } from '@tiptap/react'
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Link, ImagePlus } from 'lucide-react'

export function Toolbar({ editor, onInsertMedia }: ToolbarProps) {
  const buttons = [
    { icon: Bold, command: 'toggleBold', label: 'Bold' },
    { icon: Italic, command: 'toggleItalic', label: 'Italic' },
    // ... more buttons
  ]

  return (
    <div className='flex gap-1 mb-4 p-2 bg-slate-800 rounded'>
      {buttons.map(btn => (
        <button
          key={btn.label}
          onClick={() => editor?.chain().focus()[btn.command]().run()}
          className={editor?.isActive(btn.command) ? 'bg-blue-600' : 'bg-slate-700'}
        >
          <btn.icon size={18} />
        </button>
      ))}
      <button onClick={onInsertMedia} className='bg-green-600'>
        <ImagePlus size={18} />
      </button>
    </div>
  )
}
```

3. **components/RichEditor.tsx** (NEW)
```typescript
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Toolbar } from './Toolbar'
import { htmlToMarkdown, markdownToHtml } from '@/lib/converters'

export function RichEditor({ markdown, onChange, onInsertMedia }) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: markdownToHtml(markdown),
    onUpdate: ({ editor }) => {
      onChange(htmlToMarkdown(editor.getHTML()))
    },
  })

  return (
    <>
      <Toolbar editor={editor} onInsertMedia={onInsertMedia} />
      <EditorContent editor={editor} className='editor-pane' />
    </>
  )
}
```

4. **components/EditorPage.tsx** (UPDATE)
```typescript
// Replace:
// <textarea onChange={...} />
// 
// With:
// <RichEditor markdown={markdown} onChange={setMarkdown} onInsertMedia={() => setIsMediaPickerOpen(true)} />
```

### Phase 2: Convex Integration (1.5 hours)

1. **Initialize Convex:**
```bash
cd ~/Projects/milkup
bunx convex init --team hustle-testing --project milkup --yes
```

2. **convex/schema.ts** (NEW)
```typescript
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  media: defineTable({
    filename: v.string(),
    type: v.string(),
    url: v.string(),
    source: v.string(),
    uploadedAt: v.number(),
  })
    .index('by_type', ['type'])
    .index('by_source', ['source']),
})
```

3. **convex/media.ts** (NEW)
```typescript
import { query } from './_generated/server'
import { v } from 'convex/values'

export const listMedia = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('media').collect()
  },
})

export const listMediaByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('media')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .collect()
  },
})
```

4. **Deploy schema:**
```bash
bunx convex deploy
```

5. **Update .env.local:**
```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

6. **Update components/MediaPicker.tsx:**
```typescript
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function MediaPicker({ isOpen, onClose, onSelect }) {
  const allMedia = useQuery(api.media.listMedia) // From Convex
  // ... rest of component
}
```

### Phase 3: Testing & Polish (1 hour)

**Manual testing checklist:**
- [ ] Editor loads with toolbar visible
- [ ] Clicking Bold button → text becomes `**bold**` in markdown
- [ ] Clicking H1 button → text becomes `# Heading` in markdown
- [ ] Typing → preview updates in real-time
- [ ] Paste from Google Docs → HTML auto-converts to markdown
- [ ] Click "Insert Media" → modal opens
- [ ] Select image → inserts `![filename](url)` markdown
- [ ] Select video → inserts `!video[filename](url)` markdown
- [ ] Save Draft → persists to localStorage
- [ ] Load Draft → restores from localStorage
- [ ] Raw markdown pane shows clean markdown output

**Build verification:**
```bash
bun install          # All deps resolve
bunx next build      # Production build succeeds
bun run dev          # Dev server starts on :3000
```

---

## Dependencies

### New packages (Phase 1-2)
```json
{
  "@tiptap/react": "^2.0.0",
  "@tiptap/core": "^2.0.0",
  "@tiptap/starter-kit": "^2.0.0",
  "@tiptap/extension-image": "^2.0.0",
  "@tiptap/extension-link": "^2.0.0",
  "html-to-markdown": "^1.7.3",
  "markdown-it": "^14.0.0",
  "convex": "^1.18.0",
  "@convex/react": "^1.18.0"
}
```

### Existing packages (keep)
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "next": "^16.0.0",
  "tailwindcss": "^3.4.14",
  "lucide-react": "^0.468.0"
}
```

⚠️ **CRITICAL:** Do NOT use Next.js 15 or React 18 — both have CVEs from early 2026.
- Next.js 16.x (latest, Vercel-ready, all security patches)
- React 19.0.0 (latest, all security patches)
Use these versions for all future projects. **Vercel supports Next.js latest.**

### Size impact
- TipTap: ~150KB gzipped
- html-to-markdown: ~50KB
- Convex: ~100KB
- **Total new:** ~300KB (split across chunks)

---

## Deployment

### Development
```bash
bun install
bunx convex init --team hustle-testing --project milkup --yes
bunx convex deploy
bun run dev          # http://localhost:3000
```

### Production (Vercel)
```bash
git push
# Vercel auto-deploys on push
# Environment variables: NEXT_PUBLIC_CONVEX_URL (from Convex)
```

### Environment variables needed
```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## Future Enhancements

### Short-term (Next sprint)
- [ ] Drag-and-drop media upload
- [ ] Image resizing in editor
- [ ] Table support
- [ ] Code syntax highlighting
- [ ] Collaborative editing (Yjs + Convex)

### Medium-term (v2)
- [ ] Markdown import (parse .md files)
- [ ] PDF export
- [ ] Scheduled publishing
- [ ] Revision history
- [ ] Comments/annotations

### Long-term (v3)
- [ ] Customer blog platform (full CMS)
- [ ] Multi-user workspaces
- [ ] Version control integration
- [ ] SEO metadata editor
- [ ] Email newsletter templates

---

## Success Criteria

✅ **Functional**
- [ ] Editor loads without errors
- [ ] All toolbar buttons work
- [ ] Paste converts HTML to markdown
- [ ] Media picker inserts markdown
- [ ] Save/Load draft works
- [ ] Preview updates in real-time

✅ **Performance**
- [ ] First load: <3s
- [ ] Typing lag: <100ms
- [ ] Paste processing: <500ms
- [ ] Media grid render: <1s

✅ **Quality**
- [ ] No console errors
- [ ] TypeScript strict mode (no any)
- [ ] Responsive on mobile
- [ ] Dark theme consistent
- [ ] Accessibility (keyboard nav, ARIA labels)

✅ **Documentation**
- [ ] README.md updated
- [ ] API docs for Convex queries/mutations
- [ ] Deployment guide
- [ ] Contributing guidelines

---

## Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | TipTap setup + Toolbar + Paste | 2h | IN PROGRESS |
| 2 | Convex integration + MediaPicker | 1.5h | IN PROGRESS |
| 3 | Testing + Polish + Docs | 1h | PENDING |
| **Total** | **Complete build** | **4.5h** | **On track** |

---

## Contact & Updates

**Repository:** https://github.com/michaelmonetized/milkup  
**Issues:** Track bugs and feature requests in GitHub Issues  
**Discussions:** Use GitHub Discussions for architecture decisions  

Build status updates posted to #milkup channel on HustleLaunch Slack.

---

**Last updated:** 2026-03-25 06:24 EDT  
**Owner:** Michael Hurley (@michaelh_rley)  
**Status:** 🔨 In Development
