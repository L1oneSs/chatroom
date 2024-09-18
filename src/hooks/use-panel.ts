import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";

/**
 * Hook, который возвращает состояние и функции для управления панелью
 * со списком сообщений, отображаемых в правом сайдбаре.
 *
 * @returns {{ onOpenMessage: (messageId: string) => void, onClose: () => void, parentMessageId: string | null }}
 */
export const usePanel = () => {
  // Состояние родительского сообщения
  const [parentMessageId, setParentMessageId] = useParentMessageId();

  /**
   * Открывает панель со списком сообщений,
   * отображая сообщения, связанные с переданным сообщением.
   *
   * @param {string} messageId - ID сообщения, которое будет
   *                             отображаться в панели.
   */
  const onOpenMessage = (messageId: string) => {
    setParentMessageId(messageId);
  };

  /**
   * Закрывает панель со списком сообщений,
   * обнуляя ID родительского сообщения.
   */
  const onClose = () => {
    setParentMessageId(null);
  };

  return { onOpenMessage, onClose, parentMessageId };
};
