import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (synced from WorkOS)
  users: defineTable({
    workosId: v.string(), // WorkOS user ID
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workos_id", ["workosId"])
    .index("by_email", ["email"]),

  // Main recipes table
  recipes: defineTable({
    // Basic info
    userId: v.id("users"), // Owner of the recipe
    title: v.string(),
    description: v.string(),
    slug: v.string(), // URL-friendly version of title

    // Recipe metadata
    prepTimeMinutes: v.optional(v.number()),
    cookTimeMinutes: v.optional(v.number()),
    totalTimeMinutes: v.optional(v.number()), // Computed field
    servings: v.optional(v.number()),
    difficulty: v.optional(v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    )),

    // Content - stored as BlockNote JSON structure
    // This is the flexible, block-based content
    content: v.string(), // JSON stringified BlockNote content

    // Searchable plain text version (extracted from content)
    searchableText: v.string(),

    // Categories and tags
    categories: v.array(v.string()), // e.g., ["breakfast", "vegetarian"]
    tags: v.array(v.string()), // e.g., ["quick", "healthy", "gluten-free"]

    // Images
    coverImageId: v.optional(v.id("recipeImages")),

    // Visibility and status
    isPublic: v.boolean(),
    isDraft: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"])
    .index("by_user_and_slug", ["userId", "slug"])
    .index("by_created_at", ["createdAt"])
    .index("by_published_at", ["publishedAt"])
    // Full-text search index
    .searchIndex("search_recipes", {
      searchField: "searchableText",
      filterFields: ["userId", "isPublic", "isDraft"],
    }),

  // Recipe images (UploadThing URLs)
  recipeImages: defineTable({
    recipeId: v.id("recipes"),
    uploadThingKey: v.string(), // UploadThing file key
    uploadThingUrl: v.string(), // Full URL to image
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    caption: v.optional(v.string()),
    order: v.number(), // For sorting multiple images
    createdAt: v.number(),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_recipe_and_order", ["recipeId", "order"]),

  // Categories (predefined + user-created)
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    isSystem: v.boolean(), // true for predefined categories
    userId: v.optional(v.id("users")), // null for system categories
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_user", ["userId"]),

  // Tags (user-created, flexible)
  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    userId: v.id("users"),
    usageCount: v.number(), // Track popularity
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_user", ["userId"])
    .index("by_usage_count", ["usageCount"]),

  // User favorites/bookmarks
  favorites: defineTable({
    userId: v.id("users"),
    recipeId: v.id("recipes"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_recipe", ["recipeId"])
    .index("by_user_and_recipe", ["userId", "recipeId"]),

  // Recipe collections/cookbooks
  collections: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    coverImageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Junction table for recipes in collections
  collectionRecipes: defineTable({
    collectionId: v.id("collections"),
    recipeId: v.id("recipes"),
    order: v.number(),
    addedAt: v.number(),
  })
    .index("by_collection", ["collectionId"])
    .index("by_recipe", ["recipeId"])
    .index("by_collection_and_order", ["collectionId", "order"]),
});
