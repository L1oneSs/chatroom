import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const create = mutation({
  args: {
    name: v.string(),
  },

  /**
   * Создает новую рабочую область с указанным именем
   * и ассоциирует ее с пользователем, который вызвал этот мутатор.
   *
   * @param args.name - имя новой рабочей области
   * @returns id созданной рабочей области
   */
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const joinCode = "123456";

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode,
    });

    
    return workspaceId;
  },
});

export const get = query({
  args: {},

  /**
   * Получает все рабочие пространства
   *
   * @returns Все рабочие пространства
   */
  handler: async (ctx) => {
    return await ctx.db.query("workspaces").collect();
  },
});
