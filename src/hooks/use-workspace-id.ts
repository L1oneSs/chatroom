import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Hook, который возвращает id активной рабочей области.
 *
 * @returns id активной рабочей области
 */
export const useWorkspaceId = () => {
    const params = useParams();
    return params.workspaceId as Id<"workspaces">;
}

