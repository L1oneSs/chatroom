import { Button } from "@/components/ui/button";
import { AlertTriangle, XIcon } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMessage } from "../api/use-get-message";
import { Loader } from "lucide-react";
import { Message } from "@/components/message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useState } from "react";

interface ThreadProps {
    messageId: Id<"messages">;
    onClose: () => void;
}

/**
 * Компонент, отображающий окно с thread сообщениями.
 *
 * @prop {{ messageId: Id<"messages">; onClose: () => void }} props - Свойства
 * @prop {Id<"messages">} messageId - Id сообщения, которое является темой
 * @prop {() => void} onClose - функция, вызываемая при закрытии окна
 *
 * @example
 * const { data: message } = useGetMessage({ id: "messageId" });
 * <Thread messageId={message._id} onClose={() => {}} />
 */
export const Thread = ({ messageId, onClose }: ThreadProps) => {

    // Получаем id рабочей области
    const workspaceId = useWorkspaceId();

    // Загружаем сообщение
    const { data: message, isLoading: isMessageLoading } = useGetMessage({ id: messageId });

    // Загружаем текущего участника
    const { data: currentMember } = useCurrentMember({workspaceId});

    // Флаг редактирования сообщение
    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

    if(isMessageLoading) {
        return (
            <div className="h-full flex flex-col">
                <div className="h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    };

    if (!message){
        return (
            <div className="h-full flex flex-col">
                <div className="h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <AlertTriangle className="size-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Message not found</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            <div className="h-[49px] flex justify-between items-center px-4 border-b">
                <p className="text-lg font-bold">Thread</p>
                <Button onClick={onClose} size="iconSm" variant="ghost">
                    <XIcon className="size-5 stroke-[1.5]" />
                </Button>
            </div>
            <div>
                <Message
                    hideThreadButton
                    memberId={message.memberId}
                    authorImage={message.user.image}
                    authorName={message.user.name}
                    isAuthor={message.memberId === currentMember?._id}
                    body={message.body}
                    image={message.image}
                    createdAt={message._creationTime}
                    updatedAt={message.updatedAt}
                    id={message._id}
                    reactions={message.reactions}
                    isEditing={editingId === message._id}
                    setEditingId={setEditingId}
                />
            </div>
        </div>
    );
};