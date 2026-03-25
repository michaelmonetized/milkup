"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isVideoUrl, isImageUrl } from "@/lib/milkdown-video-plugin";
import { X } from "lucide-react";

interface Media {
  _id: string;
  filename: string;
  type: string;
  url: string;
  source: string;
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
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [selectedType, setSelectedType] = useState<"all" | "image" | "video">(
    "all"
  );

  const allMedia = useQuery(api.media.listMedia);

  useEffect(() => {
    if (allMedia) {
      setMediaList(allMedia);

      if (selectedType === "all") {
        setFilteredMedia(allMedia);
      } else {
        setFilteredMedia(
          allMedia.filter((m) =>
            selectedType === "image" ? isImageUrl(m.url) : isVideoUrl(m.url)
          )
        );
      }
    }
  }, [allMedia, selectedType]);

  if (!isOpen) return null;

  const handleSelect = (media: Media) => {
    const type = isVideoUrl(media.url)
      ? ("video" as const)
      : ("image" as const);
    onSelect(media.url, type);
    onClose();
  };

  const getThumbnail = (url: string) => {
    if (isVideoUrl(url)) {
      return (
        <video
          src={url}
          className="w-full h-20 object-cover rounded"
          preload="metadata"
        />
      );
    }
    if (isImageUrl(url)) {
      return <img src={url} alt="media" className="w-full h-20 object-cover rounded" />;
    }
    return (
      <div className="w-full h-20 bg-slate-700 rounded flex items-center justify-center text-xs">
        No preview
      </div>
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
            {filteredMedia.map((media) => (
              <div
                key={media._id}
                onClick={() => handleSelect(media)}
                className="media-item"
              >
                {getThumbnail(media.url)}
                <p className="media-filename">{media.filename}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
