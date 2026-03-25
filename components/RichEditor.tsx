"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Toolbar } from "./Toolbar";
import { htmlToMarkdown, markdownToHtml } from "@/lib/converters";

interface RichEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  onInsertMedia: () => void;
}

export function RichEditor({
  markdown,
  onChange,
  onInsertMedia,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          languageClassPrefix: "language-",
        },
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        autolink: true,
        openOnClick: false,
      }),
    ],
    content: markdownToHtml(markdown),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const md = htmlToMarkdown(html);
      onChange(md);
    },
  });

  return (
    <div className="w-full">
      <Toolbar editor={editor} onInsertMedia={onInsertMedia} />
      <EditorContent
        editor={editor}
        className="w-full h-96 bg-slate-800 border border-slate-700 rounded p-4 text-slate-100 overflow-y-auto focus:outline-none focus:border-blue-500 prose prose-invert prose-sm max-w-none"
      />
    </div>
  );
}
