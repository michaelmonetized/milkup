import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listMedia = query({
  args: {},
  handler: async (ctx) => {
    const media = await ctx.db.query("media").collect();
    return media;
  },
});

export const listMediaByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    const media = await ctx.db
      .query("media")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
    return media;
  },
});

export const registerMedia = mutation({
  args: {
    filename: v.string(),
    type: v.string(),
    url: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("media", {
      filename: args.filename,
      type: args.type,
      url: args.url,
      source: args.source,
      uploadedAt: Date.now(),
    });
    return id;
  },
});

export const listPublicMedia = query({
  args: {},
  handler: async (ctx) => {
    // In a real app, we'd scan /public/ directly
    // For now, return pre-registered public media
    const media = await ctx.db
      .query("media")
      .withIndex("by_source", (q) => q.eq("source", "public"))
      .collect();
    return media;
  },
});
