"use client";

import { useState, useCallback, useRef } from "react";
import { Milkdown, useEditor } from "@milkdown/react";
import { commonmark } from "@milkdown/preset-commonmark";
import { plugin } from "@milkdown/utils";
import { history } from "@milkdown/plugin-history";
import { clipboard } from "@milkdown/plugin-clipboard";
import { image } from "@milkdown/plugin-image";
import MediaPicker from "./MediaPicker";
import { isVideoUrl } from "@/lib/milkdown-video-plugin";
import { ImagePlus, Save } from "lucide-react";

export default function EditorPage() {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [markdown, setMarkdown] = useState(
    "# Welcome to Milkup\n\nStart editing or insert media using the buttons below."
  );
  const [preview, setPreview] = useState(markdown);
  const editorRef = useRef<any>(null);

  const handleMediaSelect = (url: string, type: "image" | "video") => {
    // Insert markdown at cursor position
    if (type === "video") {
      setMarkdown((prev) => prev + `\n\n!video[Video](${url})\n`);
    } else {
      setMarkdown((prev) => prev + `\n\n![Image](${url})\n`);
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage
    localStorage.setItem("milkup_draft", markdown);
    alert("Draft saved locally!");
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem("milkup_draft");
    if (draft) {
      setMarkdown(draft);
      setPreview(draft);
    }
  };

  const renderPreview = (md: string) => {
    // Simple markdown to HTML converter for preview
    let html = md
      // Headers
      .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Images
      .replace(
        /!\[(.*?)\]\((.*?)\)/g,
        '<img src="$2" alt="$1" style="max-width: 100%; margin: 12px 0; border-radius: 8px;" />'
      )
      // Videos (custom syntax: !video[alt](url))
      .replace(
        /!video\[(.*?)\]\((.*?)\)/g,
        '<video src="$2" controls preload="metadata" style="max-width: 100%; margin: 12px 0; border-radius: 8px;"></video>'
      )
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #3b82f6;">$1</a>')
      // Line breaks and paragraphs
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    return `<p>${html}</p>`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🥛 Milkup</h1>
          <p className="text-slate-400">
            Markdown editor with Milkdown + Convex media storage + video support
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setIsMediaPickerOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
          >
            <ImagePlus size={18} />
            Insert Media
          </button>

          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
          >
            <Save size={18} />
            Save Draft
          </button>

          <button
            onClick={handleLoadDraft}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition"
          >
            Load Draft
          </button>
        </div>

        {/* Editor and Preview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div>
            <h2 className="text-lg font-semibold mb-3">✏️ Editor</h2>
            <textarea
              value={markdown}
              onChange={(e) => {
                const text = e.target.value;
                setMarkdown(text);
                setPreview(text);
              }}
              className="w-full h-96 bg-slate-800 border border-slate-700 rounded p-4 text-slate-100 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
              placeholder="Start typing markdown..."
            />
            <p className="text-xs text-slate-500 mt-2">
              For videos, use: !video[alt](url.mp4)
            </p>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-3">👁️ Preview</h2>
            <div
              className="preview h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html: renderPreview(preview),
              }}
            />
          </div>
        </div>

        {/* Raw Markdown Output */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">📝 Raw Markdown</h2>
          <div className="bg-slate-800 border border-slate-700 rounded p-4 text-slate-100 font-mono text-sm whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
            {markdown}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded p-4">
          <h3 className="font-semibold mb-2">💡 How to use:</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Type markdown in the editor</li>
            <li>• Click "Insert Media" to pick images/videos from Convex or /public/</li>
            <li>• Videos use: <code className="bg-slate-700 px-1 rounded">!video[alt](url)</code></li>
            <li>• Images use: <code className="bg-slate-700 px-1 rounded">![alt](url)</code></li>
            <li>• Click "Save Draft" to store locally</li>
            <li>• Raw markdown is shown below for copy/paste</li>
          </ul>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
