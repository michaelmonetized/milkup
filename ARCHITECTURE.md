# Milkup Architecture

**Version:** 2.0 (WYSIWYG with TipTap + Convex)  
**Last Updated:** 2026-03-25  

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                   User Browser                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐         ┌──────────────────┐  │
│  │  TipTap Editor   │◄────────│  Toolbar Buttons │  │
│  │  (HTML model)    │         │  (Format cmds)   │  │
│  └────────┬─────────┘         └──────────────────┘  │
│           │                                          │
│           ├──onUpdate──────────────────────────────┐ │
│           │        htmlToMarkdown()                │ │
│           └────────────────────────┬────────────────┤ │
│                                    │                │ │
│  ┌─────────────────────────────────▼──────────────┐ │
│  │  Markdown State (React hook)                   │ │
│  │  - Current draft content                       │ │
│  │  - Published versions                          │ │
│  │  - Metadata                                    │ │
│  └──┬──────────────────────────────────────────┬──┘ │
│     │                                          │     │
│     ├─►localStorage (Save Draft)     (Load)◄──┤     │
│     │                                          │     │
│     └─►Preview pane                 Convex◄──┘     │
│     │  (renders markdown)            mutations     │
│     │                                              │
│     └─►Raw markdown (export)                       │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Media Picker Modal                          │  │
│  │  - Grid view (thumbnails)                    │  │
│  │  - useQuery(api.media.listMedia)            │  │
│  │  - On select: Insert ![](url) or !video[]() │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────┬──────────────────────────────────────────┘
          │
          │ Convex API calls
          │
          ▼
┌─────────────────────────────────────────────────────┐
│         Convex Backend (hustle-testing)             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Queries:                                            │
│  ├─ listMedia()          → All media items         │
│  ├─ listMediaByType(t)   → Filtered by type       │
│  ├─ searchMedia(q)       → Search by filename     │
│  └─ getMedia(id)         → Single item details    │
│                                                      │
│  Mutations:                                          │
│  ├─ uploadFile(blob)     → Save + return URL      │
│  ├─ registerMedia(meta)  → Add to media table     │
│  ├─ deleteMedia(id)      → Soft delete             │
│  └─ savePost(md)         → Store article text     │
│                                                      │
│  Storage:                                            │
│  ├─ File Storage (CDN)   → Video + image files    │
│  ├─ Database (posts)     → Article metadata       │
│  └─ Database (media)     → Media catalog          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Data Models

### 1. Media Item (Convex)

```typescript
{
  _id: Id<"media">,
  filename: string,          // "hero-image.jpg"
  type: "image" | "video",
  url: string,               // https://convex.cdn/...
  source: "convex" | "upload",
  uploadedAt: number,        // timestamp
  size?: number,             // bytes
  mimeType?: string,         // "image/jpeg"
  tags?: string[],           // ["hero", "home-page"]
  metadata?: {
    width?: number,
    height?: number,
    duration?: number,       // seconds (for video)
  }
}
```

### 2. Post (Convex, future)

```typescript
{
  _id: Id<"posts">,
  title: string,
  content: string,           // Raw markdown
  excerpt?: string,
  authorId: string,
  status: "draft" | "published",
  createdAt: number,
  updatedAt: number,
  publishedAt?: number,
  tags?: string[],
  featuredImage?: string,    // Media URL
  metadata?: {
    seoTitle?: string,
    seoDescription?: string,
  }
}
```

### 3. EditorState (React)

```typescript
{
  markdown: string,          // Current draft markdown
  isDirty: boolean,
  lastSaved: number,
  isSaving: boolean,
  error?: string,
  mediaPickerOpen: boolean,
}
```

---

## Component Hierarchy

```
App (Root)
├── ConvexProvider
│   └── EditorPage
│       ├── Toolbar
│       │   ├── ToolbarButton (Bold)
│       │   ├── ToolbarButton (Italic)
│       │   ├── ToolbarButton (H1)
│       │   ├── ToolbarButton (H2)
│       │   ├── ToolbarButton (H3)
│       │   ├── ToolbarButton (Bullets)
│       │   ├── ToolbarButton (Numbers)
│       │   ├── ToolbarButton (Quote)
│       │   ├── ToolbarButton (Code)
│       │   ├── ToolbarButton (Link)
│       │   └── ToolbarButton (Insert Media)
│       ├── RichEditor
│       │   ├── Toolbar (reused)
│       │   └── EditorContent (TipTap)
│       ├── Preview
│       │   └── Rendered HTML (markdown-it)
│       ├── RawMarkdown
│       │   └── <textarea readonly>
│       ├── Controls
│       │   ├── Save Draft button
│       │   ├── Load Draft button
│       │   └── Download button
│       └── MediaPicker
│           ├── TypeFilter (All/Images/Videos)
│           ├── SearchBox
│           ├── MediaGrid
│           │   └── MediaItem (thumbnail + filename)
│           └── UploadZone (future)
```

---

## Data Flow

### 1. User types in editor

```
User types "hello"
       ↓
TipTap input handler
       ↓
editor.getHTML() → "<p>hello</p>"
       ↓
onUpdate callback
       ↓
htmlToMarkdown("<p>hello</p>") → "hello"
       ↓
setMarkdown("hello")
       ↓
React re-render:
- Preview: markdown-it renders "hello"
- Raw markdown pane: displays "hello"
- isDirty = true
```

### 2. User clicks Bold button

```
User clicks Bold toolbar button
       ↓
editor.chain().focus().toggleBold().run()
       ↓
TipTap adds <strong> marks to selection
       ↓
editor.getHTML() → "<p><strong>hello</strong></p>"
       ↓
onUpdate hook (same as above)
       ↓
htmlToMarkdown() → "**hello**"
       ↓
Preview + raw markdown update
```

### 3. User pastes from Google Docs

```
User Ctrl+V (HTML on clipboard)
       ↓
paste event listener
       ↓
e.clipboardData.getData("text/html")
       ↓
htmlToMarkdown(html) → markdown
       ↓
editor.chain().focus().insertContent(markdown).run()
       ↓
TipTap parses markdown + inserts HTML nodes
       ↓
onUpdate fires (same flow as typing)
       ↓
Final markdown in state
```

### 4. User clicks "Insert Media"

```
User clicks "Insert Media" button
       ↓
setIsMediaPickerOpen(true)
       ↓
MediaPicker modal renders
       ↓
useQuery(api.media.listMedia) → Convex fetches items
       ↓
Display grid of media with thumbnails
       ↓
User clicks a video
       ↓
onSelect(url, "video")
       ↓
markdown += `\n\n!video[filename](${url})\n`
       ↓
setMarkdown(updated)
       ↓
Modal closes, editor shows video markdown
       ↓
Preview renders <video> tag
```

### 5. User clicks "Save Draft"

```
User clicks "Save Draft"
       ↓
localStorage.setItem('milkup_draft', JSON.stringify({
  content: markdown,
  timestamp: Date.now(),
  metadata: { ... }
}))
       ↓
Show toast: "Draft saved!"
       ↓
isDirty = false
       ↓
lastSaved = Date.now()
```

---

## Markdown Conversion Pipeline

### HTML → Markdown (Paste handling)

```
Google Docs HTML:
<h1 style="...">Title</h1>
<p>Some <strong>bold</strong> text</p>
<ul><li>Item 1</li><li>Item 2</li></ul>

     ↓ html-to-markdown converter

# Title
Some **bold** text

- Item 1
- Item 2
```

### Markdown → HTML (Preview rendering)

```
Raw markdown:
# Title
Some **bold** text

- Item 1
- Item 2

     ↓ markdown-it parser

<h1>Title</h1>
<p>Some <strong>bold</strong> text</p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

### TipTap HTML ↔ Markdown (Editor state)

```
Editor content (TipTap HTML):
<h1>Title</h1>
<p>Some <strong>bold</strong> text</p>

     ↓ getHTML()

Editor state → htmlToMarkdown()

     ↓

Raw markdown in React state:
# Title
Some **bold** text

     ↓ (when initializing editor)

markdownToHtml()

     ↓

TipTap editor.setContent(html)
```

---

## Convex Integration

### Query: listMedia

```typescript
// convex/media.ts
export const listMedia = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("media").collect()
  }
})

// Usage: components/MediaPicker.tsx
const allMedia = useQuery(api.media.listMedia)
```

### Query: listMediaByType

```typescript
export const listMediaByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("media")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect()
  }
})

// Usage in MediaPicker
const images = useQuery(api.media.listMediaByType, { type: "image" })
const videos = useQuery(api.media.listMediaByType, { type: "video" })
```

### Performance

- **Index on type field:** Fast filtering (O(1) lookup)
- **Real-time subscriptions:** Media picker updates when new files uploaded
- **Pagination:** Future enhancement for large media libraries

---

## State Management

### Editor state (React hooks)

```typescript
const [markdown, setMarkdown] = useState("")      // Main content
const [preview, setPreview] = useState("")        // Preview HTML
const [isDirty, setIsDirty] = useState(false)
const [lastSaved, setLastSaved] = useState(0)
const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### Convex state (useQuery)

```typescript
const allMedia = useQuery(api.media.listMedia)
const images = useQuery(api.media.listMediaByType, { type: "image" })
const videos = useQuery(api.media.listMediaByType, { type: "video" })
```

### localStorage persistence

```typescript
// Saving
const draft = {
  content: markdown,
  timestamp: Date.now(),
  metadata: { title: "", tags: [] }
}
localStorage.setItem('milkup_draft', JSON.stringify(draft))

// Loading
const saved = localStorage.getItem('milkup_draft')
if (saved) {
  const { content } = JSON.parse(saved)
  setMarkdown(content)
}
```

---

## Error Handling

### Try-catch at component level

```typescript
try {
  const html = editor.getHTML()
  const md = htmlToMarkdown(html)
  setMarkdown(md)
} catch (err) {
  setError(`Conversion error: ${err.message}`)
  console.error('htmlToMarkdown failed:', err)
}
```

### Convex mutation errors

```typescript
const savePost = useMutation(api.posts.createPost)

try {
  await savePost({ content: markdown, title: "" })
  setError(null)
} catch (err) {
  setError(`Failed to save: ${err.message}`)
}
```

### User feedback

- Inline error messages (red banner)
- Toast notifications (success/error)
- Fallback to localStorage if backend fails

---

## Security

### Input sanitization

- TipTap prevents XSS by default (content model is structured)
- htmlToMarkdown strips dangerous HTML (script tags, event handlers)
- Markdown is plain text (safe to store + display)

### File uploads

- Convex handles CORS + security
- Files stored in secure CDN
- Signed URLs with expiration (future)

### Authentication (future)

- Clerk OAuth integration
- Per-user access control
- Audit logs for post edits

---

## Performance Optimization

### Code splitting

- TipTap lazy-loaded (on first edit)
- MediaPicker modal async (opens only when clicked)
- Preview pane uses IntersectionObserver (render only in viewport)

### Rendering

- React.memo on Toolbar buttons (prevent re-renders)
- EditorContent isolated from other components
- MediaGrid uses virtualization for large libraries (future)

### Data fetching

- Convex real-time queries (auto-subscribe)
- No polling loops
- Pagination for large media libraries (future)

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Tested on:**
- Desktop: macOS Chrome, Firefox, Safari
- Mobile: iPhone Safari, Android Chrome
- Tablet: iPad Safari

---

## Deployment Architecture

```
Local Development
├── bun run dev (port 3000)
└── Convex dev server (auto)

Staging (optional)
├── Vercel preview deployment
└── Convex staging project

Production
├── Vercel (CDN + serverless)
├── Convex production deployment
└── Media CDN (Convex file storage)
```

---

## Future Enhancements

### Collaborative editing
- Yjs for CRDT-based collaboration
- WebSockets for real-time sync
- Presence indicators (who's editing)

### Advanced media
- Image cropping + resizing
- Video transcoding (WebM conversion)
- PDF preview + annotation

### Publishing workflow
- Scheduled posts
- Revision history
- Preview links (shareable drafts)

### SEO
- Meta description editor
- Open Graph preview
- XML sitemap generation

---

**Architecture v2.0** — WYSIWYG with TipTap + Convex  
Built for HustleLaunch customer blogs and modern web publishing.
