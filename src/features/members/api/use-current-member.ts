import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseCurrentMemberProps {
  workspaceId: Id<"workspaces">;
}

/**
 * Возвращает текущего участника рабочей области
 *
 * @param {UseCurrentMemberProps} props
 * @returns {{ data: Member | undefined, isLoading: boolean }}
 */
export const useCurrentMember = ({ workspaceId }: UseCurrentMemberProps) => {
  // Загружаем текущего участника рабочей области
  const data = useQuery(api.members.current, { workspaceId });

  // Состояние загрузки
  const isLoading = data === undefined;

  // Возвращаем объект с текущим участником и информацией о состоянии загрузки
  return { data, isLoading };
};
