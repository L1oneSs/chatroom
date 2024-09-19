import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { auth } from "./auth";

// Функция для создания или получения беседы 1:1
export const createOrGet = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("members"),
  },

  handler: async (ctx, args) => {
    // Получаем идентификатор пользователя
    const userId = await auth.getUserId(ctx);

    // Проверяем, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Получение текущего участника
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    // Получение второго участника
    const otherMember = await ctx.db.get(args.memberId);

    // Проверка, есть ли участники
    if (!currentMember || !otherMember) {
      throw new Error("Member not found");
    }

    // Проверка, существует ли беседа
    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("memberOneId"), currentMember._id),
            q.eq(q.field("memberTwoId"), otherMember._id)
          ),
          q.and(
            q.eq(q.field("memberOneId"), otherMember._id),
            q.eq(q.field("memberTwoId"), currentMember._id)
          )
        )
      )
      .unique();

    // Если беседа существует, возвращаем ее
    if(existingConversation) {
        return existingConversation._id;
    }

    // Если беседы не существует, создаем ее
    const conversationId = await ctx.db.insert("conversations", {
      workspaceId: args.workspaceId,
      memberOneId: currentMember._id,
      memberTwoId: otherMember._id,
    });

    // Возвращаем Id созданной беседы
    return conversationId;
  },
});
