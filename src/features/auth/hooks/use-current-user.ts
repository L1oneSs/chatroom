import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

/**
 * Загружает авторизированного пользователя из Convex
 *
 * @returns Документ пользователя + состояние загрузки или null, если пользователь не авторизирован
 */

export const useCurrentUser = () => {
    const data = useQuery(api.users.current);
    const isLoading = data === undefined;
    return { data, isLoading };
}