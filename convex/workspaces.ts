import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

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
}

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

    // Добавляем нового участника рабочей области (создателя в качестве администратора)
    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin",
    });

    // Возвращаем идентификатор созданной рабочей области
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

    // Если пользователь не состоит в рабочих пространствах, возвращаем null
    if (!member) {
      return null;
    }

    // Если пользователь состоит в рабочих пространствах, возвращаем рабочую область
    return await ctx.db.get(args.id);
  },
});
