import { GetMessagesReturnType } from '@/features/members/api/use-get-messages';
import React from 'react';
import { differenceInMinutes, format, isToday, isYesterday } from 'date-fns';
import { Message } from './message';
import { ChannelHero } from './channel-hero';
import { Id } from '../../convex/_generated/dataModel';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useCurrentMember } from '@/features/members/api/use-current-member';

interface MessageListProps {
    memberName?: string;
    memberImage?: string;
    channelName?: string;
    channelCreationTime?: number;
    variant?: "channel" | "thread" | "conversation";
    data: GetMessagesReturnType | undefined;
    loadMore: () => void;
    isLoadingMore: boolean;
    canLoadMore: boolean;
}

const TIME_THRESHOLD = 5;

/**
 * Форматирует строку даты в human-readable формат.
 * @param {string} dateStr - строка даты
 * @returns {string} отформатированная строка
 * @example
 * formatDateLabel("2022-01-01") // "Saturday, January 1"
 */
const formatDateLabel = (dateStr: string) => {
    // Форматируем дату
    const date = new Date(dateStr);
    if(isToday(date)) return "Today"
    if(isYesterday(date)) return "Yesterday"
    return format(date, "EEEE, MMMM d")
}

export const MessageList = ({
    memberName,
    memberImage,
    channelName,
    channelCreationTime,
    variant = "channel",
    data,
    loadMore,
    isLoadingMore,
    canLoadMore
}: MessageListProps) => {

    // Состояние редактирования сообщения
    const [editingId, setEditingId] = React.useState<Id<"messages"> | null>(null);

    // Получаем ID текущей рабочей области
    const workspaceId = useWorkspaceId();

    // Получаем текущего пользователя
    const {data: currentMember} = useCurrentMember({workspaceId});



    // Группируем сообщения по дате и времени создания
    const groupedMessages = data?.reduce(
        (groups, message) => {
            // Получаем дату создания сообщения
            const date = new Date(message._creationTime);
            // Форматируем дату
            const dateKey = format(date, "yyyy-MM-dd");

            // Если нет группы с такой датой, создаем ее
            if(!groups[dateKey]){
                groups[dateKey] = [];

            }

            // Добавляем сообщение в группу
            groups[dateKey].unshift(message);

            // Возвращаем обновлённые группы
            return groups
        },
        {} as Record<string, typeof data>
    )

    return (
        <div className='flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar'>
            {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
                <div key={dateKey}>
                    <div className='text-center my-2 relative'>
                        <hr className='abssolute top-1/2 left-0 right-0 botder-t border-gray-300' />
                        <span className='relative inline-block bg-white px-4 py-1 roundef-full text-xs border-gray-300 shadow-sm'>
                            {formatDateLabel(dateKey)}
                        </span>
                    </div>
                    {messages.map((message, index) => {
                        
                        // Предыдущее сообщение
                        const prevMessage = messages[index - 1];

                        // Установка формата компактного сообщения (для сообщений с временем создания + 5 минут от одного пользователя)
                        const isCompact = prevMessage && prevMessage.user?._id === message.user?._id &&
                         differenceInMinutes(new Date(message._creationTime), new Date(prevMessage._creationTime))
                        < TIME_THRESHOLD;

                        return (
                            <Message
                                key={message._id}
                                id={message._id}
                                memberId={message.memberId}
                                authorImage={message.user.image}
                                authorName={message.user.name}
                                isAuthor={message.memberId === currentMember?._id}
                                reactions={message.reactions}
                                body={message.body}
                                image={message.image}
                                updatedAt={message.updatedAt}
                                createdAt={message._creationTime}
                                isEditing={editingId === message._id}
                                setEditingId={setEditingId}
                                isCompact={isCompact}
                                hideThreadButton={variant === "thread"}
                                threadCount={message.threadCount}
                                threadImage={message.threadImage}
                                threadTimestamp={message.threadTimestamp}
                            />
                        )
                    })}
                </div>
            ))}
            {variant === "channel" && channelName && channelCreationTime && (
                <ChannelHero
                    name={channelName}
                    creationTime={channelCreationTime}
                />
            )}
        </div>
    );
};

