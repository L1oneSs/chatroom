import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetWorkspaceInfoProps {
  id: Id<"workspaces">;
}

/**
 * Загружает информацию о рабочей области по ее ID.
 *
 * @param {UseGetWorkspaceProps} props - Объект с ID рабочей области.
 * @returns - Объект с загруженной рабочей областью и информацией о состоянии загрузки.
 * @example
 * const { data, isLoading } = useGetWorkspace({ id: "workspaceId" });
 * if (isLoading) {
 *   return <div>Loading...</div>;
 * }
 * return (
 *   <div>
 *     <h2>{data.name}</h2>
 *   </div>
 * );
 */
export const useGetWorkspaceInfo = ({ id }: UseGetWorkspaceInfoProps) => {
  const data = useQuery(api.workspaces.getInfoById, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
};
