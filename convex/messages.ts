import { v } from 'convex/values';
import {mutation, QueryCtx} from './_generated/server';
import { auth } from './auth';
import { Id } from './_generated/dataModel';

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
const getMember = async (ctx: QueryCtx, workspaceId: Id<"workspaces">, userId: Id<"users">) => {

    return ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", workspaceId).eq("userId", userId)).unique();
}

// Функция для создания сообщения
export const create = mutation({
    args: {
        body: v.string(),
        image: v.optional(v.id("_storage")),
        workspaceId: v.id("workspaces"),
        channelId: v.optional(v.id("channels")),
        parentMessageId: v.optional(v.id("messages")),
        conversationId: v.optional(v.id("conversations")),
    },
    /**
     * @description
     * Создает сообщение в рабочей области
     *
     * @throws {Error} - если пользователь не авторизован
     * @throws {Error} - если пользователь не состоит в рабочей области
     * @throws {Error} - если родительское сообщение не существует
     *
     * @returns {Promise<Id<"messages">>} - ID созданного сообщения
     */
    handler: async (ctx, args) => {
        
        // Получаем ID текущего пользователя
        const userId = await auth.getUserId(ctx);

        // Проверяем, авторизован ли пользователь
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Получаем участника рабочей области
        const member = await getMember(ctx, args.workspaceId, userId);

        // Проверяем, является ли пользователь участником рабочей области
        if (!member) {
            throw new Error("Unauthorized");
        }

        // Получаем ID личного чата
        let _conversationId = args.conversationId;

        // Может быть только когда мы создаем thread переписку 1:1
        if(!args.conversationId && !args.channelId && args.parentMessageId){
            const parrentMessage = await ctx.db.get(args.parentMessageId);

            // Проверяем, существует ли родительское сообщение
            if (!parrentMessage) {
                throw new Error("Parent message not found");
            }

            // Устанавливаем ID личного чата как ID личного чата родительского сообщения
            _conversationId = parrentMessage.conversationId;
        }

        // Создаем сообщение
        const messageId = await ctx.db.insert("messages", {
            body: args.body,
            image: args.image,
            memberId: member._id,
            workspaceId: args.workspaceId,
            channelId: args.channelId,
            conversationId: _conversationId,
            parentMessageId: args.parentMessageId,
            updatedAt: Date.now(),
        });

        // Возвращаем ID созданного сообщения
        return messageId;
    }
})