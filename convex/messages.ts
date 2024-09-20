import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

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
const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) => {
  return ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique();
};

// Функция для получения пользователя
const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
  return ctx.db.get(userId);
};

// Функция для получения участника
const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => {
  return ctx.db.get(memberId);
};

// Функция для загрузки реакции на сообщение
const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) => {
  return ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
    .collect();
};

// Функкция для загрузки всех сообщений, которые являются ответами на сообщение messageId
const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", messageId)
    )
    .collect();

  // Если нет ответов, то на frontend нечего отображать
  if (messages.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  // Получаем последнее сообщение
  const lastMessage = messages[messages.length - 1];

  // Получаем ID пользователя, создавшего последнее сообщение
  const lastMessageMember = await populateMember(ctx, lastMessage.memberId);

  // Если нет последнего пользователя, отправившего сообщение, то на frontend нечего отображать
  if (!lastMessageMember) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  // Получаем пользователя, создавшего последнее сообщение
  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

  // Возвращаем информацию о последнем сообщении
  return {
    count: messages.length,
    image: lastMessageUser?.image,
    timestamp: lastMessage._creationTime,
    name: lastMessageUser?.name,
  };
};

// Функция для получения сообщения по ID
export const getById = query({
  args: {
    id: v.id("messages"),
  },

  handler: async (ctx, args) => {
    // Получаем ID текущего пользователя
    const userId = await auth.getUserId(ctx);

    // Проверяем, авторизован ли пользователь
    if (!userId) {
      return null;
    }

    // Получаем информацию о сообщении
    const message = await ctx.db.get(args.id);

    // Если сообщение не существует, то возвращаем null
    if (!message) {
      return null;
    }

    // Получаем информацию о участнике
    const member = await populateMember(ctx, message.memberId);

    // Если участник не существует, то возвращаем null
    if (!member) {
      return null;
    }

    // Получаем информацию о текущем участнике
    const currentMember = await getMember(ctx, message.workspaceId, userId);

    // Если участник не существует, то возвращаем null
    if (!currentMember) {
      return null;
    }

    // Получаем информацию о пользователе
    const user = await populateUser(ctx, member.userId);

    // Если пользователь не существует, то возвращаем null
    if (!user) {
      return null;
    }

    // Получаем реакции на сообщение
    const reactions = await populateReactions(ctx, message._id);

    // Группируем реакции
    const reactionsWithCounts = reactions.map((reaction) => {
      return {
        ...reaction,
        count: reactions.filter((r) => r.value === reaction.value).length,
      };
    });

    // Убираем дубликаты
    const dedupedReactions = reactionsWithCounts.reduce(
      (acc, reaction) => {
        // Проверяем, есть ли реакция с таким же значением в acc
        const existingReaction = acc.find((r) => r.value === reaction.value);

        // Если есть, то создаем новый сет и добавляем участника как поставившего реакцию
        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId])
          );
        } else {
          // Если нет, то добавляем реакцию
          acc.push({ ...reaction, memberIds: [reaction.memberId] });
        }

        // Возвращаем обновленный acc
        return acc;
      },
      [] as (Doc<"reactions"> & {
        count: number;
        memberIds: Id<"members">[];
      })[]
    );

    // Убираем свойство memberId из реакции
    const reactionsWithoutMemberIdProperty = dedupedReactions.map(
      ({ memberId, ...rest }) => rest
    );

    return {
      ...message,
      image: message.image
        ? await ctx.storage.getUrl(message.image)
        : undefined,
      user,
      member,
      reactions: reactionsWithoutMemberIdProperty,
    };
  },
});

// Функция для получения сообщений
export const get = query({
  args: {
    // Id канала, к которому может относиться сообщение
    channelId: v.optional(v.id("channels")),
    // Id личного чата, к которому может относиться сообщение
    conversationId: v.optional(v.id("conversations")),
    // Id родительского сообщения (для threads)
    parentMessageId: v.optional(v.id("messages")),
    // Настройка пагинации
    paginationOpts: paginationOptsValidator,
  },

  /**
   * Возвращает список сообщений, принадлежащих каналу, переписке (личному чату) или родительскому сообщению.
   * @param {{channelId?: Id<"channels">; conversationId?: Id<"conversations">; parentMessageId?: Id<"messages">}} args - Объект с ID канала, переписки (личного чата) или родительского сообщения.
   * @returns - Объект с загруженными сообщениями, информацией о состоянии загрузки и функцией loadMore.
   * @example
   * const {data, isLoading} = useGetMessages({ channelId: "channelId" });
   * if (isLoading) {
   *   return <div>Loading...</div>;
   * }
   * return (
   *   <div>
   *     {data.map((message) => (
   *       <div key={message._id}>{message.body}</div>
   *     ))}
   *   </div>
   * );
   */
  handler: async (ctx, args) => {
    // // Получаем ID текущего пользователя
    // const userId = await auth.getUserId(ctx);

    // // Проверяем, авторизован ли пользователь
    // if (!userId) {
    //   throw new Error("Unauthorized");
    // }

    // Получаем ID личного чата
    let _conversationId = args.conversationId;

    // Если нет ID личного чата и ID канала, то получаем ID родительского сообщения (для threads)
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      // Получаем ID родительского сообщения
      const parentMessage = await ctx.db.get(args.parentMessageId);

      // Если родительское сообщение не существует, то бросаем исключение
      if (!parentMessage) {
        throw new Error("Parent message not found");
      }

      // Обновляем ID личного чата
      _conversationId = parentMessage.conversationId;
    }

    // Получаем сообщения
    const results = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
        q
          .eq("channelId", args.channelId)
          .eq("parentMessageId", args.parentMessageId)
          .eq("conversationId", _conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    // Получаем информацию о пользователях и реакциях на сообщения
    return {
      ...results,
      // Загружаем информацию о пользователях и реакциях на сообщения
      page: (
        await Promise.all(
          results.page.map(async (message) => {
            // Получаем участника
            const member = await populateMember(ctx, message.memberId);
            // Получаем пользователя
            const user = member ? await populateUser(ctx, member.userId) : null;

            // Если нет участника или пользователя, то возвращаем null
            if (!member || !user) {
              return null;
            }

            // Получаем реакции
            const reactions = await populateReactions(ctx, message._id);
            // Получаем тред
            const thread = await populateThread(ctx, message._id);
            // Получаем изображение
            const image = message.image
              ? await ctx.storage.getUrl(message.image)
              : undefined;

            // Группируем реакции
            const reactionsWithCounts = reactions.map((reaction) => {
              return {
                ...reaction,
                count: reactions.filter((r) => r.value === reaction.value)
                  .length,
              };
            });

            // Убираем дубликаты
            const dedupedReactions = reactionsWithCounts.reduce(
              (acc, reaction) => {
                // Проверяем, есть ли реакция с таким же значением в acc
                const existingReaction = acc.find(
                  (r) => r.value === reaction.value
                );

                // Если есть, то создаем новый сет и добавляем участника как поставившего реакцию
                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, reaction.memberId])
                  );
                } else {
                  // Если нет, то добавляем реакцию
                  acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }

                // Возвращаем обновленный acc
                return acc;
              },
              [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
              })[]
            );

            // Убираем свойство memberId из реакции
            const reactionsWithoutMemberIdProperty = dedupedReactions.map(
              ({ memberId, ...rest }) => rest
            );

            // Возвращаем обновленное сообщение
            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionsWithoutMemberIdProperty,
              threadCount: thread.count,
              threadImage: thread.image,
              threadName: thread.name,
              threadTimestamp: thread.timestamp,
            };
          })
        )
      ).filter(
        (message): message is NonNullable<typeof message> => message !== null
      ),
    };
  },
});

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
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
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
    });

    // Возвращаем ID созданного сообщения
    return messageId;
  },
});

// Функция для обновления сообщения
export const update = mutation({
  args: {
    id: v.id("messages"),
    body: v.string(),
  },

  /**
   * Обновляет текст сообщения
   *
   * @param {{ id: Id<"messages">; body: string }} args - ID сообщения и новый текст
   * @returns ID обновленного сообщения
   * @throws Error - если пользователь не авторизован, сообщение не найдено,
   *                 или пользователь не является автором сообщения
   */
  handler: async (ctx, args) => {
    // Получаем ID текущего пользователя
    const userId = await auth.getUserId(ctx);

    // Проверяем, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Получаем сообщение
    const message = await ctx.db.get(args.id);

    // Проверяем, существует ли сообщение
    if (!message) {
      throw new Error("Message not found");
    }

    // Проверяем, является ли пользователь автором сообщения
    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || member._id !== message.memberId) {
      throw new Error("Member not found");
    }

    // Обновляем сообщение
    await ctx.db.patch(args.id, {
      body: args.body,
      updatedAt: Date.now(),
    });

    // Возвращаем ID обновленного сообщения
    return args.id;
  },
});

// Функция для удаления сообщения
export const remove = mutation({
  args: {
    id: v.id("messages"),
  },

  /**
   * Удаляет сообщение
   *
   * @throws {Error} - если пользователь не авторизован
   * @throws {Error} - если сообщение не существует
   * @throws {Error} - если пользователь не является автором сообщения
   * @returns {Id<"messages">} - ID удаленного сообщения
   */
  handler: async (ctx, args) => {
    // Получаем ID текущего пользователя
    const userId = await auth.getUserId(ctx);

    // Проверяем, авторизован ли пользователь
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Получаем сообщение
    const message = await ctx.db.get(args.id);

    // Проверяем, существует ли сообщение
    if (!message) {
      throw new Error("Message not found");
    }

    // Проверяем, является ли пользователь автором сообщения
    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || member._id !== message.memberId) {
      throw new Error("Member not found");
    }

    // Удаляем сообщение
    await ctx.db.delete(args.id);

    // Возвращаем ID удаленного сообщения
    return args.id;
  },
});
