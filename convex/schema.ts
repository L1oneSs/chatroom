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

  // Таблица для хранения личных сообщений (личный чат)
  conversations: defineTable({
    // ID рабочей области, в которой было создано сообщение
    workspaceId: v.id("workspaces"),
    // ID первого участника (пользователя) в переписке
    memberOneId: v.id("members"),
    // ID второго участника (пользователя) в переписке
    memberTwoId: v.id("members"),
    // Нахождение переписки по ID рабочей области
  }).index("by_workspace_id", ["workspaceId"]),

  // Таблица для хранения сообщений
  messages: defineTable({
    // Текст сообщения
    body: v.string(),
    // Изображение в сообщении (если есть)
    image: v.optional(v.id("_storage")),
    // ID пользователя, создавшего сообщение
    memberId: v.id("members"),
    // ID рабочей области, в которой было создано сообщение
    workspaceId: v.id("workspaces"),
    // ID канала, в котором было создано сообщение (если есть)
    channelId: v.optional(v.id("channels")),
    // ID родительского сообщения
    parentMessageId: v.optional(v.id("messages")),
    // Дата создания (обновления) сообщения
    updatedAt: v.optional(v.number()),
    // ID переписки (личного чата)
    conversationId: v.optional(v.id("conversations")),
    // Нахождение сообщения по ID рабочей области, ID пользователя, ID канала и ID родительского сообщения
  }).index("by_workspace_id", ["workspaceId"]).index("by_member_id", ["memberId"]).index("by_channel_id", ["channelId"]).index("by_conversation_id", ["conversationId"]).index("by_parent_message_id", ["parentMessageId"]).index("by_channel_id_parent_message_id_conversation_id", ["channelId", "parentMessageId", "conversationId"]),

  // Таблица для хранения реакций
  reactions: defineTable({
    // ID рабочей области
    workspaceId: v.id("workspaces"),
    // ID сообщения (сообщения, в котором была создана реакция)
    messageId: v.id("messages"),
    // ID пользователя, поставившего реакцию
    memberId: v.id("members"),
    // Реакция
    value: v.string(),
    // Нахождение реакции по ID рабочей области, ID сообщения и ID пользователя
  }).index("by_workspace_id", ["workspaceId"]).index("by_message_id", ["messageId"]).index("by_member_id", ["memberId"]),
});

export default schema;
