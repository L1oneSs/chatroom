import { useMemberId } from "@/hooks/use-member-id";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useGetMember } from "@/features/members/api/use-get-member";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { Loader } from "lucide-react";
import {Header} from "./header";
import { ChatInput } from "./chat-input";
import { MessageList } from "@/components/message-list";
import { usePanel } from "@/hooks/use-panel";
interface ConversationProps {
    id: Id<"conversations">;
}

/**
 * Компонент, отображающий личную переписку.
 *
 * @param {{ id: Id<"conversations"> }} props - Свойства
 * @prop {Id<"conversations">} id - ID личной переписки
 *
 * @returns {JSX.Element} - Компонент со списком сообщений
 * @example
 * import { Conversation } from "../conversation";
 *
 * <Conversation id="conversationId" />;
 */

export const Conversation = ({ id }: ConversationProps) => {

    // Получаем id участника
    const memberId = useMemberId();

    const { onOpenProfile } = usePanel();

    // Информация о пользователе
    const { data: member, isLoading: memberLoading} = useGetMember({ id: memberId });

    // Загрузка сообщений
    const {results, status, loadMore} = useGetMessages({
        conversationId: id,
    });

    if (memberLoading || status === "LoadingFirstPage") {
        return (
            <div className="h-screen flex justify-center items-center">
                <Loader className="animate-spin size-6 text-muted-foreground" size={32} />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <Header
                memberName={member?.user.name}
                memberImage={member?.user.image}
                onClick={() => onOpenProfile(memberId)}
            />
            <MessageList
                data={results}
                variant="conversation"
                memberImage={member?.user.image}
                memberName={member?.user.name}
                loadMore={loadMore}
                isLoadingMore={status === "LoadingMore"}
                canLoadMore={status === "CanLoadMore"}
            />
            <ChatInput
                placeholder={`Message ${member?.user.name}`}
                conversationId={id}
            />
        </div>
    );
};