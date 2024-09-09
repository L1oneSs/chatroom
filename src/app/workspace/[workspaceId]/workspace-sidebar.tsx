import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { WorkspaceHeader } from "./workspace-header";


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
    

    // Если загружаются данные о workspace или member отображается индикатор загрузки
    if(workspaceLoading || memberLoading) {
        return (
         <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
            <Loader className="size-5 animate-spin text-white"/>
        </div>
        )
    }

    // Если workspace не найден отображается текст "Workspace not found"
    if(!workspace || !member) {
        return (
         <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center">
            <AlertTriangle className="text-white text-sm"/>
            <p>
                Workspace not found
            </p>
        </div>
        )
    }

    return (
        <div className="flex flex-col bg-[#5E2C5F] h-full">
            <WorkspaceHeader workspace={workspace} isAdmin={member.role === "admin"}/>
        </div>
    )
};
