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

// Функция для получения канала по идентификатору
export const getById = query({
  args: {
    id: v.id("channels"),
  },

  /**
   * Возвращает канал по идентификатору, если пользователь, вызвавший
   * этот мутатор, состоит в рабочей области, к которой принадлежит
   * канал.
   *
   * @param {Id<"channels">} args.id - идентификатор канала
   * @returns {Doc<"channels">} - канал, или null, если пользователь
   * не состоит в рабочей области, к которой принадлежит канал.
   */
  handler: async (ctx, args) => {
    // Получаем идентификатор пользователя, вызвавшего этот мутатор
    const userId = await auth.getUserId(ctx);

    // Если пользователь не авторизован, возвращаем null
    if (!userId) {
      return null;
    }

    // Получаем канал по идентификатору
    const channel = await ctx.db.get(args.id);

    // Если канал не существует, возвращаем null
    if (!channel) {
      return null;
    }

    // Проверяем, является ли пользователь участником рабочей области, в которой находится канал
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique();

    // Если пользователь не состоит в рабочем пространстве, возвращаем null
    if (!member) {
      return null;
    }

    // Возвращаем канал
    return channel;
  },
});

// Функция для обновления имени канала
export const update = mutation({
  args: {
    id: v.id("channels"),
    name: v.string(),
  },

  /**
   * Обновляет имя канала.
   *
   * @param {UpdateChannelArgs} args - Объект с ID канала и новым именем.
   * @returns - ID канала, если обновление прошло успешно.
   * @throws {Error} - Если пользователь не авторизован,
   *   канал не существует,
   *   или пользователь не является администратором рабочей области,
   *   в которой находится канал.
   */
  handler: async (ctx, args) => {
    // Получаем идентификатор пользователя, вызвавшего этот мутатор
    const userId = await auth.getUserId(ctx);

    // Проверка, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Получаем канал по идентификатору
    const channel = await ctx.db.get(args.id);

    // Проверка, существует ли канал
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Проверяем, является ли пользователь участником рабочей области, в которой находится канал
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique();

    // Проверка, является ли пользователь администратором рабочей области, в которой находится канал
    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Обновляем имя канала
    await ctx.db.patch(args.id, { name: args.name });

    // Возвращаем ID канала
    return args.id;
  },
});


// Функция для удаления канала  
export const remove = mutation({
  args: {
    id: v.id("channels"),
  },

  /**
   * Удаляет канал
   *
   * @param {Id<"channels">} id - ID канала
   *
   * @throws {Error} если пользователь не авторизован
   * @throws {Error} если канал не существует
   * @throws {Error} если пользователь не является администратором
   *
   * @returns {Id<"channels">} ID канала
   */
  handler: async (ctx, args) => {

    // Получаем идентификатор пользователя, вызвавшего этот мутатор
    const userId = await auth.getUserId(ctx);

    // Проверка, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Получаем канал по идентификатору
    const channel = await ctx.db.get(args.id);

    // Проверка, существует ли канал
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Проверяем, является ли пользователь участником рабочей области, в которой находится канал
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique();

    // Проверка, является ли пользователь администратором рабочей области, в которой находится канал
    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Удаляем канал
    await ctx.db.delete(args.id);

    // Возвращаем ID канала
    return args.id;
  },
});