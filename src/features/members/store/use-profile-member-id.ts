import {useQueryState} from "nuqs"

/**
 * Hook, который возвращает ID участника при нажатии на его аватар.
 * 
 * @returns {string | null} ID участника
 * @example localhost:3000/messages?profileMemberId=321 => "321"
 * 
 */
export const useProfileMemberId = () => {
    return useQueryState("profileMemberId");
};