import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetMemberProps {
  id: Id<"members">;
}

/**
 * Возвращает текущего участника рабочей области
 *
 * @param {UseGetMemberProps} props
 * @returns {{ data: Member | undefined, isLoading: boolean }}
 */
export const useGetMember = ({ id }: UseGetMemberProps) => {
  // Загружаем всех участников рабочей области
  const data = useQuery(api.members.getById, { id });

  // Состояние загрузки
  const isLoading = data === undefined;

  // Возвращаем объект с участниками и информацией о состоянии загрузки
  return { data, isLoading };
};
