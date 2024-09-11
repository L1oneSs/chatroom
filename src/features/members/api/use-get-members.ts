import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetMembersProps {
  workspaceId: Id<"workspaces">;
}

/**
 * Возвращает текущего участника рабочей области
 *
 * @param {UseGetMembersProps} props
 * @returns {{ data: Member | undefined, isLoading: boolean }}
 */
export const UseGetMembers = ({ workspaceId }: UseGetMembersProps) => {
  // Загружаем всех участников рабочей области
  const data = useQuery(api.members.get, { workspaceId });

  // Состояние загрузки
  const isLoading = data === undefined;

  // Возвращаем объект с участниками и информацией о состоянии загрузки
  return { data, isLoading };
};
