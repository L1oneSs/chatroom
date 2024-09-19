import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, HashIcon, Loader, MessageSquareTextIcon, SendHorizonalIcon } from "lucide-react";
import { WorkspaceHeader } from "./workspace-header";
import { SidebarItem } from "./sidebar-item";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorkspaceSection } from "./workspace-section";
import { UseGetMembers } from "@/features/members/api/use-get-members";
import { UserItem } from "./user-item";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useChannelId } from "@/hooks/use-channel-id";
import { useMemberId } from "@/hooks/use-member-id";


/**
 * Рендерит sidebar для рабочего пространства:
 * - загрузку, если не загружены данные о workspace или member
 * - текст "Workspace not found", если workspace не найден
 * - WorkspaceHeader, если workspace найден
 * 
 * @returns {JSX.Element} - JSX-элемент, отображающий sidebar
 */
export const WorkspaceSidebar = () => {

    // Id рабочей области
    const workspaceId = useWorkspaceId();

    // Информация о текущем пользователе (участнике рабочей области)
    const { data: member, isLoading: memberLoading} = useCurrentMember({workspaceId});

    // Информация о рабочей области
    const { data: workspace, isLoading: workspaceLoading} = useGetWorkspace({id: workspaceId});

    // Список каналов
    const {data: channels, isLoading: channelsLoading} = useGetChannels({workspaceId});

    // Список участников
    const {data: members, isLoading: membersLoading} = UseGetMembers({workspaceId});

    // Модальное окно для создания канала
    const [_open, setOpen] = useCreateChannelModal();

    // Id активного канала
    const channelId = useChannelId();

    // Id активного участника
    const memberId = useMemberId();
    

    // Если загружаются данные о workspace или member отображается индикатор загрузки
    if(workspaceLoading || memberLoading) {
        return (
         <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center min-w-[360px]">
            <Loader className="size-5 animate-spin text-white"/>
        </div>
        )
    }

    // Если workspace не найден отображается текст "Workspace not found"
    if(!workspace || !member) {
        return (
         <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center min-w-[360px]">
            <AlertTriangle className="text-white text-sm"/>
            <p>
                Workspace not found
            </p>
        </div>
        )
    }

    return (
        <div className="flex flex-col bg-[#5E2C5F] h-full min-w-[360px]">
            <WorkspaceHeader workspace={workspace} isAdmin={member.role === "admin"}/>
            <div className="felx flex-col px-2 mt-3">
                <SidebarItem
                    label="Threads"
                    icon={MessageSquareTextIcon}
                    id="threads"
                />
                <SidebarItem
                    label="Drafts & Sent"
                    icon={SendHorizonalIcon}
                    id="draft"
                />
                </div>
                <WorkspaceSection
                    label="Channels"
                    hint="Create new channel"
                    onNew={member.role === "admin" ?() => setOpen(true) : undefined}
                >
                    {channels?.map((item) => (
                    <SidebarItem 
                        key={item._id}
                        icon={HashIcon}
                        label={item.name}
                        id={item._id}
                        variant={channelId === item._id ? "active" : "default"}
                    />
                ))}
                </WorkspaceSection>
                <WorkspaceSection
                    label="Direct Messages"
                    hint="New Direct message"
                >
                    {members?.map((item) => (
                    <UserItem 
                        key={item._id}
                        id={item._id}
                        label={item.user.name}
                        image={item.user.image}
                        variant={item._id === memberId ? "active" : "default"}
                    />
                ))}
                </WorkspaceSection>
        </div>
    )
};
