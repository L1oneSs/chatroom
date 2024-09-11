import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { useCreateChannel } from "../api/use-create-channel";
import { useCreateChannelModal } from "../store/use-create-channel-modal";

/**
 * Модальное окно для создания нового канала.
 *
 * @returns JSX-элемент, отображающий модальное окно
 *
 * Модальное окно отображается, если пользователь авторизован,
 * и он находится на странице рабочей области.
 *
 * Форма содержит поле ввода для ввода имени канала,
 * кнопку "Create" для создания нового канала,
 * кнопку "Cancel" для закрытия модального окна.
 */
export const CreateChannelModal = () => {
  const router = useRouter();
  
  // Id рабочей области
  const workspaceId = useWorkspaceId();

  // Хук для создания канала
  const { mutate, isPending } = useCreateChannel();

  // Флаг открытия модального окна
  const [open, setOpen] = useCreateChannelModal();

  // Обработчик для изменения имени канала
  const [name, setName] = useState("");

  /**
   * Закрывает модальное окно создания канала, очищает поле ввода.
   */
  const handleClose = () => {
    setName("");
    setOpen(false);
  };

  /**
   * Обработчик для изменения имени канала.
   *
   * Изменяет имя канала, которое пользователь вводит,
   * на нижний регистр и заменят все пробелы на дефис.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setName(value);
  };

  /**
   * Обработчик события "submit" формы создания канала.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - Form event.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      { name, workspaceId },
      {
        /**
         * Callback, вызываемый, если запрос на создание канала выполнен успешно.
         *
         * @param {string} id - ID созданного канала.
         *
         * @example
         * onSuccess: (id) => {
         *   toast.success("Channel created");
         *   router.push(`/workspace/${workspaceId}/channel/${id}`);
         *   handleClose();
         * }
         */
        onSuccess: (id) => {
          toast.success("Channel created");
          router.push(`/workspace/${workspaceId}/channel/${id}`);
          handleClose();
        },
        /**
         * Callback, вызываемый, если запрос на создание канала выполнен с ошибкой.
         *
         * @example
         * onError: () => {
         *   toast.error("Failed to create channel");
         * }
         */
        onError: () => {
          toast.error("Failed to create channel");
        }
      },
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            disabled={isPending}
            onChange={handleChange}
            required
            autoFocus
            minLength={3}
            maxLength={80}
            placeholder="name"
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
