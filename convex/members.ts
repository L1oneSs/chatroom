import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

// Функция для получения пользователя
const populateUser = (ctx: QueryCtx, id: Id<"users">) => {
  return ctx.db.get(id);
};

export const getById = query({
  args: {
    id: v.id("members"),
  },

  handler: async (ctx, args) => {
    // Получение идентификатора пользователя
    const userId = await auth.getUserId(ctx);

    // Проверка, авторизован ли пользователь
    if (!userId) {
      return null;
    }

    // Получение участника
    const member = await ctx.db.get(args.id);

    // Проверка, есть ли участник
    if (!member) {
      return null;
    }

    // Получение текущего участника
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      );

    // Если нет текущего участника, возвращаем null, т.к. пользователь не является участником рабочей области
    if (!currentMember) {
      return null;
    }

    // Получение пользователя
    const user = await populateUser(ctx, member.userId);

    // Проверка, существует ли пользователь
    if (!user) {
      return null;
    }

    // Возвращение пользователя
    return {
      ...member,
      user,
    };
  },
});

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

export const update = mutation({
  args: {
    id: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },

  /**
   * Обновляет роль участника
   *
   * @param args.id - id участника
   * @param args.role - новая роль (admin или member)
   *
   * @throws {Error} Unauthorized - если пользователь не авторизован
   * @throws {Error} Member not found - если участник с id не существует
   * @throws {Error} Unauthorized - если у пользователя нет прав администратора
   * @returns id обновленного участника
   */
  handler: async (ctx, args) => {
    // Получение идентификатора пользователя
    const userId = await auth.getUserId(ctx);

    // Проверка, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Получение текущего участника
    const member = await ctx.db.get(args.id);

    // Проверка, есть ли участник
    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember || currentMember.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Обновление роли участника
    await ctx.db.patch(args.id, {
      role: args.role,
    });

    return args.id;
  },
});

// Функция для удаления участника
export const remove = mutation({
  args: {
    id: v.id("members"),
  },

    /**
     * Удаляет участника
     *
     * @param args.id - id участника
     *
     * @throws {Error} Unauthorized - если пользователь не авторизован
     * @throws {Error} Member not found - если участник с id не существует
     * @throws {Error} Unauthorized - если у пользователя нет прав администратора
     * @throws {Error} Admin cannot be deleted - если пытаемся удалить администратора
     * @throws {Error} Cannot delete yourself - если пытаемся удалить самого себя
     *
     * @returns id удаленного участника
     */
  handler: async (ctx, args) => {
    // Получение идентификатора пользователя
    const userId = await auth.getUserId(ctx);

    // Проверка, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Получение текущего участника
    const member = await ctx.db.get(args.id);

    // Проверка, есть ли участник
    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember) {
      throw new Error("Unauthorized");
    }

    // Проверка на администратора
    if(member.role === "admin"){
      throw new Error("Admin cannot be deleted");
    }

    // Невозможность удалить самого себя
    if (currentMember._id === args.id && currentMember.role === "admin") {
      throw new Error("Cannot delete yourself");
    }

    // Удаление сообщений, реакции и бесед, связанных с участником
    const [messages, reactions, conversations] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
        .collect(),
      ctx.db
        .query("reactions")
        .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) => q.or(q.eq(q.field("memberOneId"), member._id), q.eq(q.field("memberTwoId"), member._id)))
        .collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    // Удаление участника
    await ctx.db.delete(args.id);


    return args.id;
  },
});
