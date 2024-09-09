import { v } from "convex/values";
import { query } from "./_generated/server";
import { auth } from "./auth";


// Получение текущего участника рабочей области
export const current = query({
    args: {
        // id рабочей области
        workspaceId: v.id("workspaces"),
    },

    /**
     * Получает текущего участника рабочей области
     *
     * @param args.workspaceId - id рабочей области
     * @returns текущий участник, если пользователь состоит в ней, или null, если нет
     */
    handler: async (ctx, args) => {
        // Получение идентификатора пользователя
        const userId = await auth.getUserId(ctx);

        // Проверка, авторизован ли пользователь
        if (!userId) {
            return null;
        }

        // Получение текущего участника рабочей области
        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => 
            q.eq("workspaceId", args.workspaceId).eq("userId", userId)).unique();


        // Проверка, есть ли участник
        if (!member){
            return null;
        }

        return member;
    }
})