import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetChannelProps {
    id: Id<"channels">;
}

/**
 * Загружает определенный канал в указанной рабочей области.
 *
 * @param {UseGetChannelsProps} props - Объект с ID рабочей области.
 * @returns - Объект с загруженным каналом и информацией о состоянии загрузки

 */
export const useGetChannel = ({ id }: UseGetChannelProps) => {
    const data = useQuery(api.channels.getById, { id });
    const isLoading = data === undefined;
    return { data, isLoading };
}