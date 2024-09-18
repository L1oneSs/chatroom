import { usePaginatedQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

// Количество сообщений, загружаемых за раз (для пагинации)
const BATCH_SIZE = 20;

interface UseGetMessagesProps{
    channelId?: Id<"channels">;
    conversationId?: Id<"conversations">;
    parentMessageId?: Id<"messages">;
}

// Тип возвращаемого значения хука useGetMessages
export type GetMessagesReturnType = typeof api.messages.get._returnType["page"];

/**
 * Hook, который загружает сообщения, принадлежащие каналу, переписке (личному чату) или родительскому сообщению.
 * @param {{channelId?: Id<"channels">; conversationId?: Id<"conversations">; parentMessageId?: Id<"messages">}} props - Объект с ID канала, переписки (личного чата) или родительского сообщения.
 * @returns - Объект с загруженными сообщениями, информацией о состоянии загрузки и функцией loadMore.
 * @example
 * const { data, isLoading } = useGetMessages({ channelId: "channelId" });
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

export const useGetMessages = ({
    channelId,
    conversationId,
    parentMessageId
}: UseGetMessagesProps) => {
    
    // Загружаем сообщения
    const {results, status, loadMore} = usePaginatedQuery(
        api.messages.get,
        {
            channelId, 
            conversationId,
            parentMessageId,
        },
        {
            initialNumItems: BATCH_SIZE,
        }
    );

    return {
        results,
        status,
        loadMore: () => loadMore(BATCH_SIZE),
    };
}