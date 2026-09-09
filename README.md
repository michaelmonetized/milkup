# Milkup

WYSIWYG markdown editor. TipTap in the browser. Convex for media. Not Milkdown.

The product on HEAD is a Next.js app with a TipTap toolbar, HTML→markdown paste, a Convex media picker, and localStorage drafts. README used to sell a Milkdown textarea POC. That code is gone.

## Stack

- **Editor:** TipTap (`@tiptap/react` + starter-kit, image, link)
- **App:** Next.js 16, React 19, Tailwind
- **Media:** Convex (`convex/media.ts`)
- **Runtime:** Bun

## Run

```bash
bun install
bunx next dev
```

Convex queries need `NEXT_PUBLIC_CONVEX_URL`. See `CONVEX_SETUP.md` if the picker is empty.

## Layout

```
app/            Next.js shell
components/     EditorPage, RichEditor, Toolbar, MediaPicker
convex/         media schema + listMedia
lib/converters.ts
```

There is no Milkdown package. `lib/milkdown-video-plugin.ts` is gone. Do not add it back.

## Honest limits

- Drafts are localStorage, not multiplayer.
- Media picker is empty until Convex is deployed and files exist.
- This is an editor, not a published writing product.
