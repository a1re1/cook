import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Create a new recipe
export const createRecipe = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    content: v.string(), // BlockNote JSON
    searchableText: v.string(), // Extracted plain text
    prepTimeMinutes: v.optional(v.number()),
    cookTimeMinutes: v.optional(v.number()),
    servings: v.optional(v.number()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    isDraft: v.boolean(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const slug = generateSlug(args.title);

    // Check if slug already exists for this user
    const existing = await ctx.db
      .query("recipes")
      .withIndex("by_user_and_slug", (q) =>
        q.eq("userId", args.userId).eq("slug", slug)
      )
      .first();

    // If slug exists, append a number
    let finalSlug = slug;
    if (existing) {
      let counter = 1;
      while (
        await ctx.db
          .query("recipes")
          .withIndex("by_user_and_slug", (q) =>
            q.eq("userId", args.userId).eq("slug", `${slug}-${counter}`)
          )
          .first()
      ) {
        counter++;
      }
      finalSlug = `${slug}-${counter}`;
    }

    const now = Date.now();
    const totalTimeMinutes =
      (args.prepTimeMinutes ?? 0) + (args.cookTimeMinutes ?? 0);

    const recipeId = await ctx.db.insert("recipes", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      slug: finalSlug,
      content: args.content,
      searchableText: args.searchableText,
      prepTimeMinutes: args.prepTimeMinutes,
      cookTimeMinutes: args.cookTimeMinutes,
      totalTimeMinutes: totalTimeMinutes || undefined,
      servings: args.servings,
      difficulty: args.difficulty,
      categories: args.categories,
      tags: args.tags,
      isDraft: args.isDraft,
      isPublic: args.isPublic,
      createdAt: now,
      updatedAt: now,
      publishedAt: !args.isDraft ? now : undefined,
    });

    return recipeId;
  },
});

// Update an existing recipe
export const updateRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    userId: v.id("users"), // For authorization
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    searchableText: v.optional(v.string()),
    prepTimeMinutes: v.optional(v.number()),
    cookTimeMinutes: v.optional(v.number()),
    servings: v.optional(v.number()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    categories: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    coverImageId: v.optional(v.id("recipeImages")),
    isDraft: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { recipeId, userId, ...updates } = args;

    // Check if recipe exists and user owns it
    const recipe = await ctx.db.get(recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    if (recipe.userId !== userId) {
      throw new Error("Unauthorized: You don't own this recipe");
    }

    // Update slug if title changed
    let slug = recipe.slug;
    if (updates.title && updates.title !== recipe.title) {
      slug = generateSlug(updates.title);

      // Check if new slug already exists
      const existing = await ctx.db
        .query("recipes")
        .withIndex("by_user_and_slug", (q) =>
          q.eq("userId", userId).eq("slug", slug)
        )
        .first();

      if (existing && existing._id !== recipeId) {
        let counter = 1;
        while (
          await ctx.db
            .query("recipes")
            .withIndex("by_user_and_slug", (q) =>
              q.eq("userId", userId).eq("slug", `${slug}-${counter}`)
            )
            .first()
        ) {
          counter++;
        }
        slug = `${slug}-${counter}`;
      }
    }

    // Calculate total time if prep or cook time changed
    let totalTimeMinutes = recipe.totalTimeMinutes;
    if (updates.prepTimeMinutes !== undefined || updates.cookTimeMinutes !== undefined) {
      const prepTime = updates.prepTimeMinutes ?? recipe.prepTimeMinutes ?? 0;
      const cookTime = updates.cookTimeMinutes ?? recipe.cookTimeMinutes ?? 0;
      totalTimeMinutes = prepTime + cookTime || undefined;
    }

    await ctx.db.patch(recipeId, {
      ...updates,
      slug,
      totalTimeMinutes,
      updatedAt: Date.now(),
    });

    return recipeId;
  },
});

// Delete a recipe
export const deleteRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    userId: v.id("users"), // For authorization
  },
  handler: async (ctx, args) => {
    // Check if recipe exists and user owns it
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    if (recipe.userId !== args.userId) {
      throw new Error("Unauthorized: You don't own this recipe");
    }

    // Delete all associated images
    const images = await ctx.db
      .query("recipeImages")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    for (const image of images) {
      await ctx.db.delete(image._id);
    }

    // Delete favorites
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    for (const favorite of favorites) {
      await ctx.db.delete(favorite._id);
    }

    // Delete collection associations
    const collectionRecipes = await ctx.db
      .query("collectionRecipes")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    for (const collectionRecipe of collectionRecipes) {
      await ctx.db.delete(collectionRecipe._id);
    }

    // Delete the recipe
    await ctx.db.delete(args.recipeId);

    return { success: true };
  },
});

// Publish a draft recipe
export const publishRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if recipe exists and user owns it
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    if (recipe.userId !== args.userId) {
      throw new Error("Unauthorized: You don't own this recipe");
    }

    await ctx.db.patch(args.recipeId, {
      isDraft: false,
      isPublic: true,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.recipeId;
  },
});

// Unpublish a recipe (make it private)
export const unpublishRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if recipe exists and user owns it
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    if (recipe.userId !== args.userId) {
      throw new Error("Unauthorized: You don't own this recipe");
    }

    await ctx.db.patch(args.recipeId, {
      isPublic: false,
      updatedAt: Date.now(),
    });

    return args.recipeId;
  },
});
