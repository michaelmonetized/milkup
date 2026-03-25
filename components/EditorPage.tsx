"use client";

import { useState } from "react";
import MediaPicker from "./MediaPicker";
import { RichEditor } from "./RichEditor";
import { Save } from "lucide-react";

export default function EditorPage() {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [markdown, setMarkdown] = useState(
    "# Welcome to Milkup\n\nStart editing or insert media using the toolbar above."
  );

  const handleMediaSelect = (url: string, type: "image" | "video") => {
    // Insert markdown
    if (type === "video") {
      setMarkdown((prev) => prev + `\n\n![Video](${url})\n`);
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🥛 Milkup</h1>
          <p className="text-slate-400">
            WYSIWYG editor with TipTap + Convex media storage
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setIsMediaPickerOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
          >
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
          {/* Rich Editor */}
          <div>
            <h2 className="text-lg font-semibold mb-3">✏️ Editor</h2>
            <RichEditor
              markdown={markdown}
              onChange={setMarkdown}
              onInsertMedia={() => setIsMediaPickerOpen(true)}
            />
          </div>

          {/* Raw Markdown Output */}
          <div>
            <h2 className="text-lg font-semibold mb-3">📝 Markdown</h2>
            <div className="bg-slate-800 border border-slate-700 rounded p-4 text-slate-100 font-mono text-sm whitespace-pre-wrap break-words h-96 overflow-y-auto">
              {markdown}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded p-4">
          <h3 className="font-semibold mb-2">💡 Features:</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>✨ WYSIWYG editing with TipTap toolbar</li>
            <li>🎨 Auto-paste from Google Docs/Word (HTML→Markdown)</li>
            <li>📸 Media picker with Convex Cloud integration</li>
            <li>💾 Save/Load drafts locally</li>
            <li>🔄 Live markdown sync</li>
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
