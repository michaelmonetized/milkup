"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { X } from "lucide-react";

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, type: "image" | "video") => void;
}

export default function MediaPicker({
  isOpen,
  onClose,
  onSelect,
}: MediaPickerProps) {
  const [selectedType, setSelectedType] = useState<"all" | "image" | "video">(
    "all"
  );

  // Fetch all media from Convex
  const allMedia: any[] = useQuery(api.media.listMedia) ?? [];

  const filteredMedia = allMedia.filter((m: any) => {
    if (selectedType === "all") return true;
    return m.type === selectedType;
  });

  if (!isOpen) return null;

  const handleSelect = (url: string, type: string) => {
    const mediaType =
      type === "video" ? ("video" as const) : ("image" as const);
    onSelect(url, mediaType);
    onClose();
  };

  const getThumbnail = (url: string, type: string) => {
    if (type === "video") {
      return (
        <video
          src={url}
          className="w-full h-20 object-cover rounded"
          preload="metadata"
        />
      );
    }
    return (
      <img src={url} alt="media" className="w-full h-20 object-cover rounded" />
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Select Media</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-4 py-2 rounded transition ${
              selectedType === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType("image")}
            className={`px-4 py-2 rounded transition ${
              selectedType === "image"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setSelectedType("video")}
            className={`px-4 py-2 rounded transition ${
              selectedType === "video"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Videos
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No media found. Seed some data in Convex dashboard!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMedia.map((media) => (
                <div
                  key={media._id}
                  onClick={() => handleSelect(media.url, media.type)}
                  className="cursor-pointer hover:opacity-80 transition"
                >
                  {getThumbnail(media.url, media.type)}
                  <p className="text-xs mt-1 truncate text-slate-300">
                    {media.filename}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
