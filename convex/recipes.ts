import { query } from "./_generated/server";
import { v } from "convex/values";

// Get a single recipe by ID
export const getRecipe = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) return null;

    // Get the author
    const author = await ctx.db.get(recipe.userId);

    // Get cover image if exists
    const coverImage = recipe.coverImageId
      ? await ctx.db.get(recipe.coverImageId)
      : null;

    // Get all images
    const images = await ctx.db
      .query("recipeImages")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    return {
      ...recipe,
      author,
      coverImage,
      images: images.sort((a, b) => a.order - b.order),
    };
  },
});

// Get recipes by user
export const getRecipesByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit + offset);

    return recipes.slice(offset);
  },
});

// Get public recipes (for browse/home page)
export const getPublicRecipes = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    const recipes = await ctx.db
      .query("recipes")
      .filter((q) => q.and(q.eq(q.field("isPublic"), true), q.eq(q.field("isDraft"), false)))
      .order("desc")
      .take(limit + offset);

    // Get authors for each recipe
    const recipesWithAuthors = await Promise.all(
      recipes.slice(offset).map(async (recipe) => {
        const author = await ctx.db.get(recipe.userId);
        const coverImage = recipe.coverImageId
          ? await ctx.db.get(recipe.coverImageId)
          : null;
        return {
          ...recipe,
          author,
          coverImage,
        };
      })
    );

    return recipesWithAuthors;
  },
});

// Search recipes (full-text search)
export const searchRecipes = query({
  args: {
    searchTerm: v.string(),
    userId: v.optional(v.id("users")),
    includePublic: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const results = await ctx.db
      .query("recipes")
      .withSearchIndex("search_recipes", (q) =>
        q.search("searchableText", args.searchTerm)
      )
      .take(limit);

    // Filter by user or public visibility
    let filteredResults = results;

    if (args.userId) {
      filteredResults = filteredResults.filter(
        (recipe) => recipe.userId === args.userId
      );
    } else if (args.includePublic) {
      filteredResults = filteredResults.filter(
        (recipe) => recipe.isPublic && !recipe.isDraft
      );
    }

    // Get authors and cover images
    const recipesWithDetails = await Promise.all(
      filteredResults.map(async (recipe) => {
        const author = await ctx.db.get(recipe.userId);
        const coverImage = recipe.coverImageId
          ? await ctx.db.get(recipe.coverImageId)
          : null;
        return {
          ...recipe,
          author,
          coverImage,
        };
      })
    );

    return recipesWithDetails;
  },
});

// Get recipes by category
export const getRecipesByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    const recipes = await ctx.db
      .query("recipes")
      .filter((q) =>
        q.and(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("isDraft"), false)
        )
      )
      .collect();

    // Filter by category (since categories is an array)
    const filtered = recipes.filter((recipe) =>
      recipe.categories.includes(args.category)
    );

    // Sort by created date and paginate
    const sorted = filtered.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    const paginated = sorted.slice(offset, offset + limit);

    // Get authors and cover images
    const recipesWithDetails = await Promise.all(
      paginated.map(async (recipe) => {
        const author = await ctx.db.get(recipe.userId);
        const coverImage = recipe.coverImageId
          ? await ctx.db.get(recipe.coverImageId)
          : null;
        return {
          ...recipe,
          author,
          coverImage,
        };
      })
    );

    return recipesWithDetails;
  },
});

// Get recipe by slug
export const getRecipeBySlug = query({
  args: { slug: v.string(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let recipe;

    if (args.userId) {
      // Get by user and slug
      recipe = await ctx.db
        .query("recipes")
        .withIndex("by_user_and_slug", (q) =>
          q.eq("userId", args.userId).eq("slug", args.slug)
        )
        .first();
    } else {
      // Get by slug only
      recipe = await ctx.db
        .query("recipes")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .filter((q) => q.and(q.eq(q.field("isPublic"), true), q.eq(q.field("isDraft"), false)))
        .first();
    }

    if (!recipe) return null;

    // Get the author
    const author = await ctx.db.get(recipe.userId);

    // Get all images
    const images = await ctx.db
      .query("recipeImages")
      .withIndex("by_recipe", (q) => q.eq("recipeId", recipe._id))
      .collect();

    const coverImage = recipe.coverImageId
      ? await ctx.db.get(recipe.coverImageId)
      : null;

    return {
      ...recipe,
      author,
      coverImage,
      images: images.sort((a, b) => a.order - b.order),
    };
  },
});
