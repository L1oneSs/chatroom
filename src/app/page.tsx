"use client"

import { UserButton } from "@/features/auth/components/user-button";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

/**
 * Главная страница
 *
 * @returns {JSX.Element} JSX-элемент, представляющий главную страницу
 *
 * Если пользователь не авторизован, то на странице отображается кнопка
 * {@link UserButton UserButton}, которая позволяет авторизоваться.
 *
 * Если пользователь авторизован, то на странице отображается модальное
 * окно, которое предлагает создать новое рабочее пространство, если
 * у него его нет.
 *
 * Если у пользователя уже есть рабочее пространство, то на странице
 * выводится сообщение "Подключение к рабочему пространству".
 *
 * NOTE: в production-режиме страница не будет отображаться, если
 * пользователь не авторизован
 */
export default function Home() {

  const router = useRouter();

  const {data, isLoading} = useGetWorkspaces();

  const workspaceId = useMemo(() => data?.[0]?._id, [data]);

  const [open, setOpen] = useCreateWorkspaceModal();

  useEffect(() => {
    if(isLoading) return;

    if (workspaceId){
      router.replace(`/workspace/${workspaceId}`);
    } else if (!open){
      setOpen(true);
    }

  }, [workspaceId, open, setOpen, isLoading]);

  return (
  <div>
    {isLoading ? (
      <div className="h-screen flex justify-center items-center">
        <Loader className="animate-spin text-black" size={32} />
      </div>
    ) : (
      <UserButton />
    )}
  </div>
);
}
