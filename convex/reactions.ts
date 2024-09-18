import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

/**
 * @description
 * Возвращает участника рабочей области, если он существует,
 * или undefined, если его не существует.
 *
 * @param {QueryCtx} ctx - контекст запроса Convex.
 * @param {Id<"workspaces">} workspaceId - ID рабочей области.
 * @param {Id<"users">} userId - ID пользователя.
 *
 * @returns {Promise<Member | undefined>}
 */
const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) => {
  return ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique();
};

// Фнкция для проставления реакции
export const toggle = mutation({
  args: { messageId: v.id("messages"), value: v.string() },
  handler: async (ctx, args) => {

    // Получаем ID текущего пользователя
    const userId = await auth.getUserId(ctx);

    // Проверяем, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Получаем сообщение
    const message = await ctx.db.get(args.messageId);

    // Проверяем, существует ли сообщение
    if (!message) {
      throw new Error("Message not found");
    }

    // Получаем участника рабочей области
    const member = await getMember(ctx, message.workspaceId, userId);

    // Проверяем, является ли пользователь участником рабочей области
    if (!member) {
      throw new Error("Unauthorized");
    }

    // Проверяем, есть ли реакция от пользователя на сообщение
    const exsitingMessageReactionFromUser = await ctx.db
      .query("reactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("memberId"), member._id),
          q.eq(q.field("value"), args.value)
        )
      )
      .first();

    // Если реакция от пользователя на сообщение существует, то удаляем ее (если пользователь заново выбрал ту же реакцию на данное сообщение)
    if (exsitingMessageReactionFromUser) {
      await ctx.db.delete(exsitingMessageReactionFromUser._id);

      return exsitingMessageReactionFromUser._id;
    // Если реакция от пользователя на сообщение не существует, то создаем ее
    } else {
      const newReactionId = await ctx.db.insert("reactions", {
        value: args.value,
        memberId: member._id,
        messageId: message._id,
        workspaceId: message.workspaceId,
      });

      return newReactionId;
    }
  },
});
