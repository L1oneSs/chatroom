import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { useCreateWorkspaceModal } from "../store/use-create-workspace-modal"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Модальное окно для создания новой рабочей области.
 *
 * @returns JSX-элемент, представляющий модальное окно
 *
 * Модальное окно отображается, если пользователь не авторизован,
 * или если он авторизован, но у него нет рабочих областей.
 *
 * Форма содержит поле ввода для ввода имени рабочей области,
 * кнопку "Create" для создания новой рабочей области,
 * кнопку "Cancel" для закрытия модального окна.
 *
 * NOTE: в production-режиме модальное окно не будет отображаться,
 * если пользователь не авторизован.
 */
export const CreateWorkspaceModal = () => {
    const [open, setOpen] = useCreateWorkspaceModal();

    const {mutate, isPending, isError, isSuccess, data, error} = useCreateWorkspace();
    const [name, setName] = useState("");
    const router = useRouter();

    /**
     * Закрывает модальное окно создания рабочей области, очищает поле ввода.
     */
    const handleClose = () => {
        setOpen(false);
        setName("");
    }

    /**
     * Обработчик события "submit" формы создания новой
     * рабочей области.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - Form event.
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        mutate({name}, {
            /**
             * Callback, вызываемый, если запрос на создание
             * новой рабочей области выполнен успешно.
             *
             * @param {string} id - ID созданной рабочей области.
             */
            onSuccess(id){
                toast.success("Workspace created")
                router.push(`/workspaces/${id}`)
                handleClose();
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        disabled={isPending}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                        minLength={3}
                        placeholder="Workspace Name"
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending}>
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}