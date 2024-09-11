import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetChannelsProps {
    workspaceId: Id<"workspaces">;
}

/**
 * Загружает список каналов в указанной рабочей области.
 *
 * @param {UseGetChannelsProps} props - Объект с ID рабочей области.
 * @returns - Объект с загруженными каналами и информацией о состоянии загрузки
 * @example
 * const { data, isLoading } = useGetChannels({ workspaceId });
 * if (isLoading) {
 *   return <div>Loading...</div>;
 * }
 * return (
 *   <ul>
 *     {data.map(channel => (
 *       <li key={channel._id}>{channel.name}</li>
 *     ))}
 *   </ul>
 * );
 */
export const useGetChannels = ({ workspaceId }: UseGetChannelsProps) => {
    const data = useQuery(api.channels.get, { workspaceId });
    const isLoading = data === undefined;
    return { data, isLoading };
}