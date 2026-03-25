import { query } from "./_generated/server";
import { v } from "convex/values";

export const listMedia = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("media").collect();
  },
});

export const listMediaByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("media")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});
