import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  media: defineTable({
    filename: v.string(),
    type: v.string(), // "image" | "video"
    url: v.string(),
    source: v.string(), // "convex" | "public"
    uploadedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_source", ["source"]),
});
