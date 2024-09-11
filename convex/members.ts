import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

// Функция для получения пользователя
const populateUser = (ctx: QueryCtx, id: Id<"users">) => {
  return ctx.db.get(id);
};

// Функция для получения списка участников
export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
  },

  /**
   * Функция-обработчик для получения списка участников
   *
   * @param ctx - контекст запроса
   * (Серверный код получает запрос
   *  и создает объект ctx, который содержит информацию о запросе и окружении.)
   * @param args - аргументы запроса
   * @returns массив участников
   */
  handler: async (ctx, args) => {
    // Получение идентификатора пользователя
    const userId = await auth.getUserId(ctx);

    // Проверка, авторизован ли пользователь
    if (!userId) {
      return [];
    }

    // Получение текущего участника рабочей области
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    // Проверка, есть ли участник
    if (!member) {
      return [];
    }

    // Получение списка участников
    const data = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    const members = [];

    // Для каждого участника получаем его информацию как пользователя
    for (const member of data) {
      const user = await populateUser(ctx, member.userId);

      // Если пользователь существует, добавляем его
      if (user) {
        members.push({
          ...member,
          user,
        });
      }
    }

    // Возвращаем список участников
    return members;
  },
});

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
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    // Проверка, есть ли участник
    if (!member) {
      return null;
    }

    return member;
  },
});
