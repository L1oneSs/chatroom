import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  // Таблица для хранения рабочих областей
  workspaces: defineTable({
    // Название рабочей области
    name: v.string(),
    // Связь с таблицей users (пользователь, создавший рабочую область)
    userId: v.id("users"),
    // Код для доступа к рабочей области
    joinCode: v.string(),
  }),
  // Таблица для хранения участников рабочей области
  members: defineTable({
    // Пользователь, участник рабочей области
    userId: v.id("users"),
    // ID рабочей области
    workspaceId: v.id("workspaces"),
    // Роль в рабочей области
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    // Уникальность в рамках рабочей области
    .index("by_user_id", ["userId"])
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_id_user_id", ["workspaceId", "userId"]),
});

export default schema;
