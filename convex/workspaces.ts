import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Функция для присоединения к рабочей области
export const join = mutation({
  args: {
    joinCode: v.string(),
    workspaceId: v.id("workspaces"),
  },

  /**
   * Обработчик для присоединения к рабочей области
   *
   * @throws {Error} если пользователь не авторизован
   * @throws {Error} если рабочей области не существует
   * @throws {Error} если код для присоединения к рабочей области не
   *   соответствует коду, хранящемуся в Convex
   * @throws {Error} если пользователь уже является активным участником
   *   этой рабочей области
   * @returns {string} идентификатор созданного документа-участника
   */
  handler: async (ctx, args) => {
    // Получаем идентификатор пользователя, вызвавшего этот мутатор
    const userId = await auth.getUserId(ctx);

    // Проверяем, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Получаем рабочую область по ID
    const workspace = await ctx.db.get(args.workspaceId);

    // Проверяем, существует ли рабочая область
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Проверяем, совпадает ли код для присоединения к рабочей области
    if (workspace.joinCode !== args.joinCode.toLowerCase()) {
      throw new Error("Invalid join code");
    }

    // Проверяем, не является ли пользователь уже участником рабочей области
    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    // Если пользователь уже состоит в рабочих пространствах, возвращается ошибка
    if (existingMember) {
      throw new Error("Already an active member of this workspace");
    }

    // Иначе присоединяемся к рабочей области
    await ctx.db.insert("members", {
      userId,
      workspaceId: workspace._id,
      role: "member",
    });

    // Возвращаем идентификатор рабочей области
    return workspace._id;
  },
});

// Функция для создания нового кода для присоединения
export const newJoinCode = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },

  /**
   * Создает новый код для присоединения к рабочей области
   *
   * Требует, чтобы пользователь был аутентифицирован и имел роль "admin" в указанной
   * рабочей области.
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

    // Смотрим, в каких рабочих пространствах пользователь состоит
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    // Если пользователь не состоит в рабочих пространствах, возвращаем ошибку
    if (!member) {
      throw new Error("Unauthorized");
    }

    // Генерируем случайный код
    const code = generateCode();

    await ctx.db.patch(args.workspaceId, {
      joinCode: code,
    });

    return args.workspaceId;
  },
});

/**
 * Генерирует случайный 6-значный алфавитно-цифровой код,
 * который мы используем в качестве кода для присоединения к рабочей области.
 *
 * @returns Случайный 6-значный алфавитно-цифровой код.
 */
const generateCode = () => {
  const code = Array.from(
    { length: 6 },
    () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join("");

  return code;
};

export const create = mutation({
  args: {
    name: v.string(),
  },

  /**
   * Создает новую рабочую область с указанным именем
   * и ассоциирует ее с пользователем, который вызвал этот мутатор.
   * Добавляет нового участника рабочей области (с ролью admin)
   *
   * @param args.name - имя новой рабочей области
   * @returns id созданной рабочей области
   */
  handler: async (ctx, args) => {
    // Получаем идентификатор пользователя, вызвавшего этот мутатор
    const userId = await auth.getUserId(ctx);

    // Проверяем, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const joinCode = generateCode();

    // Создаем новую рабочую область
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode,
    });

    // Добавление нового участника рабочей области (создателя в качестве администратора)
    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin",
    });

    // Создание канала "general" в рабочей области
    await ctx.db.insert("channels", {
      name: "general",
      workspaceId,
    });

    // Возвращается идентификатор созданной рабочей области
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
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return [];
    }

    // Смотрим, в каких рабочих пространствах пользователь состоит
    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    // Идентификаторы пространств, в которых состоит пользователь
    const workspaceIds = members.map((member) => member.workspaceId);

    const workspaces = [];

    // Получаем пространства, в которых состоит пользователь
    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);

      if (workspace) {
        workspaces.push(workspace);
      }
    }

    return workspaces;
  },
});

// Получение информации о рабочей области
export const getInfoById = query({
  args: {
    id: v.id("workspaces"),
  },

  /**
   * Возвращает информацию о рабочей области
   *
   * @returns объект с полями:
   *   - name: название рабочей области
   *   - isMember: является ли пользователь участником рабочей области
   */
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    // Смотрим, состоит ли пользователь в рабочей области
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    // Получаем рабочую область
    const workspace = await ctx.db.get(args.id);

    // Возвращаем информацию
    return {
      name: workspace?.name,
      isMember: !!member,
    };
  },
});

// Получение рабочуей области по идентификатору
export const getById = query({
  args: {
    id: v.id("workspaces"),
  },

  /**
   * Получает рабочую область по ее ID
   *
   * @param args.id - ID рабочей области
   * @returns - рабочая область, если пользователь состоит в ней, или null, если нет
   */
  handler: async (ctx, args) => {
    // Проверяем, авторизован ли пользователь
    const userId = await auth.getUserId(ctx);
    // Если пользователь не авторизован, возвращаем null
    if (!userId) {
      return null;
    }

    // Смотрим, в каких рабочих пространствах пользователь состоит
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    // Если пользователь не состоит в рабочих пространствах, возвращаем null
    if (!member) {
      return null;
    }

    // Если пользователь состоит в рабочих пространствах, возвращаем рабочую область
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string(),
  },

  /**
   * Обновляет имя существующей рабочей области.
   *
   * @param args.id - ID рабочей области
   * @param args.name - новое имя рабочей области
   * @throws Error - если пользователь не авторизирован или
   *                 не является администратором рабочей области
   */
  handler: async (ctx, args) => {
    // Проверяем, авторизован ли пользователь
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Смотрим, в каких рабочих пространствах пользователь состоит
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    // Если пользователь не состоит в рабочих пространствах, возвращаем ошибку
    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Обновляем имя рабочей области
    await ctx.db.patch(args.id, { name: args.name });

    // Возвращаем ID обновленной рабочей области
    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const [members, channels, conversations, messages, reactions] = await Promise.all([
      ctx.db
        .query("members")
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
        .collect(),

      ctx.db
        .query("channels")
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
        .collect(),

      ctx.db
        .query("conversations")
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
        .collect(),

      ctx.db
        .query("messages")
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
        .collect(),

      ctx.db
        .query("reactions")
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
        .collect(),
    ]);

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    for (const channel of channels) {
      await ctx.db.delete(channel._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
