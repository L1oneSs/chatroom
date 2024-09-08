import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  workspaces: defineTable({
    // Название рабочей области
    name: v.string(),
    // Связь с таблицей users (пользователь, создавший рабочую область)
    userId: v.id("users"),
    // Код для доступа к рабочей области
    joinCode: v.string(),
  }),
});

export default schema;
