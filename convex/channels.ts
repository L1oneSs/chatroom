import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Функция для создания канала
export const create = mutation({
  args: {
    name: v.string(),
    workspaceId: v.id("workspaces"),
  },

  /**
   * Создает новый канал
   *
   * Требует, чтобы пользователь был аутентифицирован и имел роль "admin" в указанной
   * рабочей области.
   *
   * Insert a new channel with the given name and workspaceId into the channels table.
   * Returns the id of the newly created channel.
   *
   * @throws {Error} if the user is unauthorized or if the workspace does not exist.
   */
  handler: async (ctx, args) => {
    // Получаем идентификатор пользователя, вызвавшего этот мутатор
    const userId = await auth.getUserId(ctx);

    // Проверяем, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Смотрим, есть ли среди участников рабочей области текущий пользователь
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    // Если пользователь не состоит в рабочих пространствах, возвращается ошибка
    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Создание имени нового канала
    const parsedName = args.name.replace(/\s+/g, "-").toLowerCase();

    // Создание нового канала
    const channelId = await ctx.db.insert("channels", {
      name: parsedName,
      workspaceId: args.workspaceId,
    });

    // Возвращаем ID созданного канала
    return channelId;
  },
});

// Функция для получения каналов
export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
  },

  /**
   * Функция-обработчик для получения каналов
   *
   * @param ctx - контекст запроса
   * (Серверный код получает запрос
   *  и создает объект ctx, который содержит информацию о запросе и окружении.)
   * @param args - аргументы запроса
   * @returns массив каналов
   */
  handler: async (ctx, args) => {
    // Получение идентификатора пользователя, вызвавшего этот мутатор
    const userId = await auth.getUserId(ctx);

    // Проверка, авторизован ли пользователь
    if (!userId) {
      return [];
    }

    // Смотрим, есть ли среди участников рабочей области текущий пользователь
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    // Если пользователь не состоит в рабочем пространстве, возвращается ошибка
    if (!member) {
      return [];
    }

    // Получение списка каналов
    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    // Возвращаем список каналов
    return channels;
  },
});
