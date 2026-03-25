"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { X } from "lucide-react";

interface Media {
  _id: string;
  filename: string;
  type: string;
  url: string;
  source: string;
  uploadedAt: number;
}

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
  const allMedia = (useQuery(api.media.listMedia) ?? []) as Media[];

  const filteredMedia = allMedia.filter((m: Media) => {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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

        {filteredMedia.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No media found. Upload some first!
          </div>
        ) : (
          <div className="media-grid">
            {filteredMedia.map((media: Media) => (
              <div
                key={media._id}
                onClick={() => handleSelect(media.url, media.type)}
                className="media-item"
              >
                {getThumbnail(media.url, media.type)}
                <p className="media-filename">{media.filename}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
