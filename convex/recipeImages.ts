import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add an image to a recipe
export const addRecipeImage = mutation({
  args: {
    recipeId: v.id("recipes"),
    uploadThingKey: v.string(),
    uploadThingUrl: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    caption: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const { recipeId, ...imageData } = args;

    const imageId = await ctx.db.insert("recipeImages", {
      recipeId,
      ...imageData,
      mimeType: imageData.mimeType ?? "image/jpeg",
      createdAt: Date.now(),
    });

    return imageId;
  },
});

// Get all images for a recipe
export const getRecipeImages = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("recipeImages")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    return images.sort((a, b) => a.order - b.order);
  },
});

// Delete an image
export const deleteRecipeImage = mutation({
  args: {
    imageId: v.id("recipeImages"),
    recipeId: v.id("recipes"),
    userId: v.id("users"), // For authorization
  },
  handler: async (ctx, args) => {
    // Check if user owns the recipe
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    if (recipe.userId !== args.userId) {
      throw new Error("Unauthorized: You don't own this recipe");
    }

    // Check if image exists
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }
    if (image.recipeId !== args.recipeId) {
      throw new Error("Image doesn't belong to this recipe");
    }

    // Delete the image
    await ctx.db.delete(args.imageId);

    // If this was the cover image, remove it from recipe
    if (recipe.coverImageId === args.imageId) {
      await ctx.db.patch(args.recipeId, {
        coverImageId: undefined,
      });
    }

    return { success: true };
  },
});

// Update image order
export const updateImageOrder = mutation({
  args: {
    imageId: v.id("recipeImages"),
    recipeId: v.id("recipes"),
    userId: v.id("users"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if user owns the recipe
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    if (recipe.userId !== args.userId) {
      throw new Error("Unauthorized: You don't own this recipe");
    }

    // Update the image order
    await ctx.db.patch(args.imageId, {
      order: args.newOrder,
    });

    return { success: true };
  },
});

// Set cover image
export const setCoverImage = mutation({
  args: {
    recipeId: v.id("recipes"),
    imageId: v.id("recipeImages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if user owns the recipe
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    if (recipe.userId !== args.userId) {
      throw new Error("Unauthorized: You don't own this recipe");
    }

    // Check if image belongs to this recipe
    const image = await ctx.db.get(args.imageId);
    if (!image || image.recipeId !== args.recipeId) {
      throw new Error("Image doesn't belong to this recipe");
    }

    // Set as cover image
    await ctx.db.patch(args.recipeId, {
      coverImageId: args.imageId,
    });

    return { success: true };
  },
});
