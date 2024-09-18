import { format, isToday, isYesterday } from "date-fns";
import { Doc, Id } from "../../convex/_generated/dataModel";

import dynamic from "next/dynamic";
import { Hint } from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { Reactions } from "./reactions";
import { usePanel } from "@/hooks/use-panel";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface MessageProps {
    id: Id<"messages">;
    memberId: Id<"members">;
    authorImage?: string;
    authorName?: string;
    isAuthor: boolean;
    reactions: Array<Omit<Doc<"reactions">, "memberId"> & {
        count: number;
        memberIds: Id<"members">[];
    }
    >;
    body: Doc<"messages">["body"];
    image: string | null | undefined;
    createdAt: Doc<"messages">["_creationTime"]
    updatedAt: Doc<"messages">["updatedAt"]
    isEditing: boolean;
    isCompact?: boolean;
    setEditingId: (id: Id<"messages"> | null) => void;
    hideThreadButton?: boolean;
    threadCount?: number;
    threadImage?: string;
    threadTimestamp?: number;
};

/**
 * Форматирует дату в виде строки, учитывая текущую дату
 *
 * @param {Date} date - Дата, которую нужно отформатировать
 * @returns {string} - Строка, представляющая переданную дату
 *
 * @example
 * formatFullTime(new Date("2022-07-01T00:00:00.000Z"))
 * // => "July 1, 2022 at 12:00:00 AM"
 */
const formatFullTime = (date: Date) => {
    return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
}

export const Message = ({
    id,
    isAuthor,
    memberId,
    authorImage,
    authorName = "Member",
    reactions,
    body,
    image,
    createdAt,
    updatedAt,
    isEditing,
    isCompact,
    setEditingId,
    hideThreadButton,
    threadCount,
    threadImage,
    threadTimestamp
}: MessageProps) => {

    // Состояние редактирования сообщения
    const { mutate: updateMessage, isPending: isUpdatingMessage} = useUpdateMessage();

    // Состояние удаления сообщения
    const { mutate: removeMessage, isPending: isRemovingMessage} = useRemoveMessage();

    // Состояние реакции
    const { mutate: toggleReaction, isPending: isTogglingReaction} = useToggleReaction();

    const { onOpenMessage, onClose, parentMessageId} = usePanel();

    // Конфигурируем подтверждение
    const [ConfirmDialog, confirm] = useConfirm(
        "Delete message",
        "Are you sure you want to delete this message?",
    );

    // Обновляем состояние редактирования
    const isPending = isUpdatingMessage;

    /**
     * Callback, вызываемый, когда пользователь
     * выбирает реакцию.
     *
     * @param {string} value - значение реакции
     */
    const handleReaction = (value: string) => {

        toggleReaction({messageId: id, value}, {
            /**
             * Callback, вызываемый, если запрос на смену
             * реакции выполнен с ошибкой.
             *
             * @example
             * onError: () => {
             *   toast.error("Failed to toggle reaction");
             * }
             */
            onError: () => {
                toast.error("Failed to toggle reaction");
            }
        })
    }

    /**
     * Обновляет текст сообщения
     *
     * @param {{body: string}} args - новый текст сообщения
     */
    const handleUpdate = ({body}: {body: string}) => {
        updateMessage({id, body}, {
            /**
             * Callback, вызываемый после успешного обновления сообщения.
             *
             * @example
             * onSuccess: () => {
             *   toast.success("Message updated");
             *   setEditingId(null);
             * }
             */
            onSuccess: () => {
                toast.success("Message updated");
                setEditingId(null);
            },
            /**
             * Callback, вызываемый, если запрос на обновление
             * существующего сообщения выполнен с ошибкой.
             *
             * @example
             * onError: () => {
             *   toast.error("Failed to update message");
             * }
             */
            onError: () => {
                toast.error("Failed to update message");
            }
        });
    }

    /**
     * Удаляет сообщение, если пользователь подтвердил удаление.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleRemove = async () => {

        // Подтверждаем удаление
        const ok = await confirm();

        // Если пользователь не подтвердил, то return
        if(!ok) return;

        // Удаляем сообщение, если пользователь подтвердил удаление
        if(ok) {
            removeMessage({id}, {
                /**
                 * Callback, вызываемый, если запрос на удаление
                 * существующего сообщения выполнен успешно.
                 *
                 * @example
                 * onSuccess: () => {
                 *   toast.success("Message deleted");
                 * }
                 */
                onSuccess: () => {
                    toast.success("Message deleted");

                    // Если сообщение было удалено, то закрываем панель thread
                    if(parentMessageId === id){
                        onClose();
                    }
                },
                /**
                 * Callback, вызываемый, если запрос на удаление
                 * существующего сообщения выполнен с ошибкой.
                 *
                 * @example
                 * onError: () => {
                 *   toast.error("Failed to delete message");
                 * }
                 */
                onError: () => {
                    toast.error("Failed to delete message");
                }
            });
        }
    }
    
    if(isCompact) {
        return (
            <>
            <ConfirmDialog />
            <div className={cn("flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative", isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]", isRemovingMessage && "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200")}>
                <div className="flex items-start gap-2">
                    <Hint label={formatFullTime(new Date(createdAt))}>
                        <button className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                            {format(new Date(createdAt), "HH:mm")}
                        </button>
                    </Hint>
                    {isEditing ? (
                        <div className="w-full h-full">
                            <Editor
                                onSubmit={handleUpdate}
                                disabled={isUpdatingMessage}
                                defaultValue={JSON.parse(body)}
                                onCancel={() => setEditingId(null)}
                                variant="update"
                            /> 
                        </div>
                    ) : (
                        <div className="flex flex-col w-full">
                            <Renderer value={body} />
                            <Thumbnail url={image} />
                            {updatedAt ? (
                                <span className="text-xs text-muted-foreground">(edited)</span>
                            ) : null}
                            <Reactions data={reactions} onChange={handleReaction} />
                        </div>
                    )}
                </div>
                {!isEditing && (
                    <Toolbar
                        isAuthor={isAuthor}
                        isPending={isPending}
                        handleEdit={() => setEditingId(id)}
                        handleThread={() => onOpenMessage(id)}
                        handleDelete={handleRemove}
                        handleReaction={handleReaction}
                        hideThreadButton={hideThreadButton}
                    />
                )}
            </div>
            </>
        )
    }

    const avatarFallback = authorName.charAt(0).toUpperCase();
    const storedColor = localStorage.getItem('randomColor');
    
    return (
        <>
            <ConfirmDialog />
            <div className={cn("flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative", isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]", isRemovingMessage && "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200")}>
                <div className="flex items-start gap-2">
                    <button>
                        <Avatar>
                            <AvatarImage src={authorImage} />
                            <AvatarFallback className={`${storedColor}`}>
                                {avatarFallback}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                    {isEditing ? (
                        <div className="w-full h-full">
                            <Editor
                                onSubmit={handleUpdate}
                                disabled={isUpdatingMessage}
                                defaultValue={JSON.parse(body)}
                                onCancel={() => setEditingId(null)}
                                variant="update"
                            /> 
                        </div>
                    ) : (
                        <div className="flex flex-col w-full overflow-hidden">
                            <div className="text-sm">
                                <button onClick={() => {}} className="font-bold text-primary hover:underline">
                                    {authorName}
                                </button>
                                <span>&nbsp;&nbsp;</span>
                                <Hint label={formatFullTime(new Date(createdAt))}>
                                    <button className="text-xs text-muted-foreground hover:underline">
                                        {format(new Date(createdAt), "h:mm a")}
                                    </button>
                                </Hint>
                            </div>
                            <Renderer value={body} />
                            <Thumbnail url={image} />
                            {updatedAt ? (
                                <span className="text-sm text-muted-foreground">(edited)</span>
                            ) : null}
                            <Reactions data={reactions} onChange={handleReaction} />
                        </div>
                    )}
                </div>
                {!isEditing && (
                    <Toolbar
                        isAuthor={isAuthor}
                        isPending={isPending}
                        handleEdit={() => setEditingId(id)}
                        handleThread={() => onOpenMessage(id)}
                        handleDelete={handleRemove}
                        handleReaction={handleReaction}
                        hideThreadButton={hideThreadButton}
                    />
                )}
            </div>
            </>
        )
};