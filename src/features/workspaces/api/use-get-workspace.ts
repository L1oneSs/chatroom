import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetWorkspaceProps {
  id: Id<"workspaces">;
}

/**
 * Загружает рабочую область по ее ID.
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
export const useGetWorkspace = ({ id }: UseGetWorkspaceProps) => {
  const data = useQuery(api.workspaces.getById, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
};
