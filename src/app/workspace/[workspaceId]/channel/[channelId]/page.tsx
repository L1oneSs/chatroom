"use client"

import { useGetChannel } from '@/features/channels/api/use-get-channel';
import { useChannelId } from '@/hooks/use-channel-id';
import { Loader, TriangleAlert } from 'lucide-react';
import React from 'react';
import Header from './header';
import { ChatInput } from "./chat-input";
import { useGetMessages } from '@/features/messages/api/use-get-messages';
import { MessageList } from '@/components/message-list';

/**
 * Компонент, отображающий страницу канала
 *
 * @returns {JSX.Element} - JSX-элемент, отображающий страницу канала
 *
 * Компонент загружает канал, к которому относится
 * ссылка в URL, и отображает его имя, дату создания,
 * список его сообщений, а также форму для отправки
 * новых сообщений.
 *
 * Если канал не существует, то отображается
 * предупреждение.
 *
 * Если канал загружается, то отображается
 * индикатор загрузки.
 */
const ChanelIdPage = () => {

    // Id активного канала
    const channelId = useChannelId();

    // Загрузка канала
    const {data: channel, isLoading: channelLoading} = useGetChannel({ id: channelId });

    const { results, status, loadMore } = useGetMessages({ channelId });

    if(channelLoading || status === "LoadingFirstPage"){
        return (
            <div className='h-full flex-1 flex items-center justify-center'>
                <Loader
                    className="size-5 animate-spin text-muted-foreground"
                />
            </div>
        )
    }

    if(!channel){
        return (
            <div className='h-full flex-1 flex flex-col gap-y-2 items-center justify-center'>
                <TriangleAlert
                    className="size-5 text-muted-foreground"
                />
                <span className='text-sm text-muted-foreground'>
                    Channel not found
                </span>
            </div>
        )
    }

    return (
        <div className='flex flex-col h-full w-full'>
            <Header name={channel.name} />
            <MessageList
                channelName={channel.name}
                channelCreationTime={channel._creationTime}
                data={results}
                loadMore={loadMore}
                isLoadingMore={status === "LoadingMore"}
                canLoadMore={status === "CanLoadMore"}
            />
            <ChatInput placeholder={`Message #${channel.name}`} />
        </div>
    );
};

export default ChanelIdPage;