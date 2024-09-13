"use client"

import { useGetChannel } from '@/features/channels/api/use-get-channel';
import { useChannelId } from '@/hooks/use-channel-id';
import { Loader, TriangleAlert } from 'lucide-react';
import React from 'react';
import Header from './header';
import { ChatInput } from "./chat-input";

const ChanelIdPage = () => {

    // Id активного канала
    const channelId = useChannelId();

    // Загрузка канала
    const {data: channel, isLoading: channelLoading} = useGetChannel({ id: channelId });

    if(channelLoading){
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
            <div className='flex-1' />
            <ChatInput placeholder={`Message #${channel.name}`} />
        </div>
    );
};

export default ChanelIdPage;