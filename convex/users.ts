import { auth } from "./auth";
import { query } from "./_generated/server";

export const current = query({
  args: {},

  /**
   * Функция-обработчик проверяет, авторизован ли пользователь,
   * и возвращает его документ, если да, или null, если нет.
   *
   * @param ctx - контекст запроса
   * (Серверный код получает запрос
   *  и создает объект ctx, который содержит информацию о запросе и окружении.)
   * @returns текущий пользователь
   */
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);

    if (userId === null) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});
