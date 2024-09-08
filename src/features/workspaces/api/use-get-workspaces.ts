import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

/**
 * Загружает список рабочих пространств.
 *
 * @returns Список рабочих пространств и состояние загрузки
 * @example
 * const { data, isLoading } = useGetWorkspaces();
 * if (isLoading) {
 *   return <div>Loading...</div>;
 * }
 * return (
 *   <ul>
 *     {data.map(workspace => (
 *       <li key={workspace._id}>{workspace.name}</li>
 *     ))}
 *   </ul>
 * );
 */
export const usseGetWorkspaces = () => {
    const data = useQuery(api.workspaces.get);
    const isLoading = data === undefined;
    return { data, isLoading };
}