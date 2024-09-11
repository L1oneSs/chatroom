"use client";

import { Button } from '@/components/ui/button';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useGetWorkspaceInfo } from '@/features/workspaces/api/use-get-workspace-info';
import { useJoin } from '@/features/workspaces/api/use-join';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';
import VerificationInput from 'react-verification-input';
import { toast } from 'sonner';


/**
 * JoinPage - функциональный компонент, предназначенный для
 * отображения страницы для присоединения к рабочему пространству.
 *
 * @returns {JSX.Element} - JSX-элемент, отображающий страницу для
 * присоединения к рабочему пространству.
 * 
 * @example
 * const router = useRouter();
 * const workspaceId = useWorkspaceId();
 *
 * return (
 *   <JoinPage />
 * );
 */
const JoinPage = () => {

    const router = useRouter();

    // Id рабочей области
    const workspaceId = useWorkspaceId();

    // Загружаем информацию о рабочей области по ее ID
    const {data, isLoading} = useGetWorkspaceInfo({ id: workspaceId });

    // Хук для присоединения к рабочей области
    const {mutate, isPending} = useJoin()

    // Проверяем, является ли пользователь участником рабочей области
    const isMember = useMemo(() => data?.isMember, [data?.isMember])

    // Если пользователь является участником, то перенаправляем на страницу с рабочим пространством
    useEffect(() => {
        if(isMember){
            router.push(`/workspace/${workspaceId}`)
        }
    }, [isMember, router, workspaceId])

    /**
     * Обработчик, который вызывается после успешной проверки кода
     * присоединения к рабочему пространству.
     *
     * @param {string} value - Код присоединения.
     */
    const handleComplete = (value: string) => {
        mutate({ workspaceId, joinCode: value }, 
            {
                /**
                 * Callback, который вызывается после успешного присоединения к рабочему пространству
                 *
                 * @param {string} id - The ID of the workspace.
                 * @example
                 * onSuccess: (id) => {
                 *   router.replace(`/workspace/${id}`)
                 *   toast.success("Joined workspace");
                 * }
                 */
                onSuccess: (id) => {
                    router.replace(`/workspace/${id}`)
                    toast.success("Joined workspace");
                },
                /**
                 * Callback, который вызывается, если запрос на присоединение к рабочей области
                 * выполнен с ошибкой.
                 *
                 * @example
                 * onError: () => {
                 *   toast.error("Failed to join workspace");
                 * }
                 */
                onError: () => {
                    toast.error("Failed to join workspace");
                }
            }
        );
    }

    // Если данные рабочей области не загружены, отображаем индикатор загрузки
    if (isLoading){
        return (
            <div className='h-full flex items-center justify-center'>
                <Loader className="size-6 animate-spin text-white"/>
            </div>
        )
    };

    return (
        <div className='h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md'>
            <Image src="/logo.svg" width={60} height={60} alt="logo"/>
            <div className='flex flex-col gap-y-4 items-center justify-center max-w-md'>
                <div className='flex flex-col gap-y-2 items-center justify-center'>
                    <h1 className='text-2xl font-bold'>
                        Join {data?.name}
                    </h1>
                    <p className='text-md text-muted-foreground'>
                        Enter the workspace code
                    </p>
                </div>
            <VerificationInput
                classNames={{
                    container: cn("flex gap-x-2", isPending && "opacity-50 cursor-not-allowed"), 
                    character: "uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center justify-center text-lg font-medium text-gray-500",
                    characterInactive: "bg-muted",
                    characterSelected: "bg-white text-black",
                    characterFilled: "bg-white text-black",
                }}
                autoFocus
                length={6}
                onComplete={handleComplete}
            />
            </div>
            <div className='flex gap-x-4'>
                <Button
                    size="lg"
                    variant="outline"
                    asChild
                >
                    <Link href="/">
                        Back
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default JoinPage;