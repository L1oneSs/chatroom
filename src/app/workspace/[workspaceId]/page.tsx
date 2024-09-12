"use client";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Loader, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";


const WorkspaceIdPage = () => {

    // Id активной рабочей области
    const workspaceId = useWorkspaceId();

    const router = useRouter();

    // Состояние создания канала
    const [open, setOpen] = useCreateChannelModal();

    // Загрузка рабочей области
    const {data: workspace, isLoading: workspaceLoading} = useGetWorkspace({ id: workspaceId });

    // Загрузка каналов
    const {data: channels, isLoading: channelsLoading} = useGetChannels({ workspaceId });

    // Состояние текущего участника
    const {data: member, isLoading: memberLoading} = useCurrentMember({workspaceId});

    // Проверка на администратора
    const isAdmin = useMemo(() => member?.role === "admin", [member?.role])

    // Id активного канала
    const channelId = useMemo(() => channels?.[0]?._id, [channels])

    // Запуск канала по умолчанию
    useEffect(() => {
        if(workspaceLoading || channelsLoading || !workspace || memberLoading || !member) return;

        if(channelId){
            router.push(`/workspace/${workspaceId}/channel/${channelId}`);
        }else if(!open && isAdmin){
            setOpen(true);
        }
    }, [channelId, workspaceLoading, channelsLoading, workspace, open, setOpen, router, workspaceId, member, memberLoading, isAdmin])

    // Если идет загрузка каналов или рабочей области, то отображаем лоадер
    if(workspaceLoading || channelsLoading || memberLoading){
        <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
            <Loader
                className="size-6 animate-spin text-muted-foreground"
            />
        </div>
    }

    // Если нет рабочей области или каналов, то отображаем ошибку
    if(!workspaceId || !member){
        <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
            <TriangleAlert
                className="size-6 text-muted-foreground"
            />
            <span className="text-xm text-muted-foreground">
                Workspace not found
            </span>
        </div>

        return(
            <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
            <TriangleAlert
                className="size-6 text-muted-foreground"
            />
            <span className="text-xm text-muted-foreground">
                Channels not found
            </span>
        </div>
        );
    }
}

export default WorkspaceIdPage;