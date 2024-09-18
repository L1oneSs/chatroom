import {useQueryState} from "nuqs"

/**
 * Hook, который возвращает ID родительского сообщения из URL.
 * 
 * @returns {string | null} ID родительского сообщения.
 * @example localhost:3000/messages?parentMessageId=321 => "321"
 */
export const useParentMessageId = () => {
    return useQueryState("parentMessageId")
};