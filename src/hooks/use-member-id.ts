import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Hook, который возвращает id участника
 *
 * @returns id участника
 */
export const useMemberId = () => {
  const params = useParams();
  return params.memberId as Id<"members">;
};
