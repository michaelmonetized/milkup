import { Mark, markdownSchema } from "@milkdown/kit";
import { Plugin } from "@milkdown/ctx";

/**
 * Custom Milkdown plugin for video support
 * Parses: !video[alt](url)
 * Renders: <video controls preload="metadata">
 */

export const videoPlugin: Plugin = () => {
  return async (ctx) => {
    // Add video mark to schema (extending image-like syntax)
    // In practice, we extend the parser to recognize !video[alt](url) as a custom element
    
    ctx.node("video", () => {
      return {
        parseDOM: [
          {
            tag: "video",
            getAttrs: (dom) => {
              const element = dom as HTMLVideoElement;
              return {
                src: element.src,
                alt: element.title || "",
              };
            },
          },
        ],
        toDOM: (node) => {
          return [
            "video",
            {
              src: node.attrs.src,
              controls: "true",
              preload: "metadata",
              style: "max-width: 100%; margin: 12px 0; border-radius: 8px;",
              title: node.attrs.alt,
            },
          ];
        },
        atom: true,
        inline: false,
        group: "block",
        attrs: {
          src: { default: "" },
          alt: { default: "" },
        },
      };
    });

    // Parser for !video[alt](url) syntax
    ctx.parser.remove("image").before("paragraph", "video", () => {
      return {
        match: (source) => {
          const match = source.match(/!\[([^\]]*)\]\(([^)]+)\)/);
          return match ? match[0] : null;
        },
        parse: (source) => {
          const match = source.match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (!match) return null;

          const [full, alt, src] = match;

          // Check if this is a video URL or markdown
          const isVideo = src.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv)$/i);
          if (!isVideo) return null;

          return {
            type: "video",
            attrs: {
              src,
              alt: alt || "Video",
            },
          };
        },
      };
    });

    // Serializer for markdown output
    ctx.serializer.use((next, node) => {
      if (node.type.name === "video") {
        return `!video[${node.attrs.alt}](${node.attrs.src})`;
      }
      return next(node);
    });
  };
};

// Utility to check if URL is a video
export const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov|avi|flv|mkv)$/i.test(url);
};

// Utility to check if URL is an image
export const isImageUrl = (url: string): boolean => {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
};
