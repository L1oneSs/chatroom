import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";
import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";

/**
 * Hook, который возвращает состояние и функции для управления панелью
 * со списком сообщений, отображаемых в правом сайдбаре.
 *
 * @returns {{ onOpenMessage: (messageId: string) => void, onClose: () => void, parentMessageId: string | null }}
 */
export const usePanel = () => {
  // Состояние родительского сообщения
  const [parentMessageId, setParentMessageId] = useParentMessageId();

  // Состояние ID профиля
  const [profileMemberId, setProfileMemberId] = useProfileMemberId();

  /**
   * Открывает панель со списком сообщений,
   * отображая сообщения, связанные с переданным сообщением.
   *
   * @param {string} messageId - ID сообщения, которое будет
   *                             отображаться в панели.
   */
  const onOpenMessage = (messageId: string) => {
    setParentMessageId(messageId);
    setProfileMemberId(null);
  };

  /**
   * Открывает панель с профилем участника,
   * отображая информацию о переданном пользователе.
   *
   * @param {string} memberId - ID участника, чей профиль
   *                            будет отображаться в панели.
   */
    const onOpenProfile = (memberId: string) => {
      setProfileMemberId(memberId);
      setParentMessageId(null);
    };

  /**
   * Закрывает панель со списком сообщений,
   * обнуляя ID родительского сообщения.
   */
  const onClose = () => {
    setParentMessageId(null);
    setProfileMemberId(null);
  };

  return { onOpenMessage, onClose, parentMessageId, profileMemberId, onOpenProfile };
};
