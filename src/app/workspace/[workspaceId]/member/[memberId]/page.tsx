"use client";

import { useCreateOrGetConversation } from '@/features/conversations/api/use-create-or-get-conversation';
import { useMemberId } from '@/hooks/use-member-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { AlertTriangle, Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Doc, Id } from '../../../../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { Conversation } from './conversation';

const MemberIdPage = () => {

    // Получаем id рабочего пространства
    const workspaceId = useWorkspaceId();

    // Получаем id участника
    const memberId = useMemberId();

    // Id личной переписки 1:1
    const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);

    // Создаем или получаем беседу 1:1
    const {data, mutate, isPending} = useCreateOrGetConversation();

    useEffect(() => {
        mutate({
            workspaceId,
            memberId
        }, {
            onSuccess(data){
                setConversationId(data);
            },
            onError(error){
                toast.error("Failed to create or get conversation");
            }
        })
    }, [memberId, workspaceId, mutate]);

    if (isPending){
        return (
            <div className="h-screen flex justify-center items-center">
                <Loader className="animate-spin size-6 text-muted-foreground" size={32} />
            </div>
        )
    }

    if (!conversationId){
        return (
            <div className="h-screen flex justify-center items-center">
                <AlertTriangle className="size-6 text-muted-foreground" size={32} />
                <span className='text-sm text-muted-foreground'>
                    Conversation not found
                </span>
            </div>
        )
    }

    return <Conversation id={conversationId} />
};

export default MemberIdPage;