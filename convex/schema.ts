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
    // Нахождение участника рабочей области по ID пользователя и ID рабочей области
    .index("by_user_id", ["userId"])
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_id_user_id", ["workspaceId", "userId"]),

  // Таблица для хранения каналов
  channels: defineTable({
    // Название канала
    name: v.string(),
    // ID рабочей области, к которой принадлежит канал
    workspaceId: v.id("workspaces"),
    // Нахождение канала по ID рабочей области
  }).index("by_workspace_id", ["workspaceId"]),
});

export default schema;
