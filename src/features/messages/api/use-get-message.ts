import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetMessageProps {
  id: Id<"messages">;
};

/**
 * Возвращает сообщение по его ID.
 *
 * @param {UseGetMessageProps} props - Объект с ID сообщения.
 * @returns - Объект с загруженным сообщением и информацией о состоянии загрузки.
 * @example
 * const { data, isLoading } = useGetMessage({ id: "messageId" });
 * if (isLoading) {
 *   return <div>Loading...</div>;
 * }
 * return (
 *   <div>
 *     <h2>{data.body}</h2>
 *   </div>
 * );
 */
export const useGetMessage = ({ id }: UseGetMessageProps) => {

  // Загружаем сообщение
  const data = useQuery(api.messages.getById, { id });

  // Состояние загрузки
  const isLoading = data === undefined;

  // Возвращаем объект с сообщением и информацией о состоянии загрузки
  return { data, isLoading };
};
