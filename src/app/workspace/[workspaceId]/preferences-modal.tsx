import { toast } from "sonner";
import { useState } from "react";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { useRemoveWorkspace } from "@/features/workspaces/api/use-remove-workspace";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

interface PreferencesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
};

/**
 * Модальное окно настроек рабочей области.
 *
 * @example
 * <PreferencesModal
 *   open={isOpen}
 *   setOpen={setOpen}
 *   initialValue="My workspace"
 * />
 *
 * @param {boolean} open - Флаг, указывающий на то, открыто ли модальное окно.
 * @param {(open: boolean) => void} setOpen - Функция, которая изменяет значение `open`.
 * @param {string} initialValue - Исходное значение названия рабочей области.
 * @returns {JSX.Element} - JSX-элемент, отображающий модальное окно настроек рабочей области.
 */
export const PreferencesModal = ({
  open,
  setOpen,
  initialValue,
}: PreferencesModalProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This action is irreversible."
  );

  const [value, setValue] = useState(initialValue);
  const [editOpen, setEditOpen] = useState(false);

  const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } = useUpdateWorkspace();
  const { mutate: removeWorkspace, isPending: isRemovingWorkspace } = useRemoveWorkspace();

  /**
   * Удаляет существующую рабочую область.
   *
   * Если пользователь подтверждает удаление, то вызывает
   * {@link useRemoveWorkspace} c ID рабочей области.
   *
   * @see useRemoveWorkspace
   */
  const handleRemove = async () => {

    // Открываем модальное окно подтверждения и ждем ответа от пользователя
    const ok = await confirm();

    if (!ok) return;

    removeWorkspace({
      id: workspaceId
    }, {
      /**
       * Callback, вызываемый, если запрос на удаление
       * существующей рабочей области выполнен успешно.
       *
       * @example
       * onSuccess: () => {
       *   toast.success("Workspace removed");
       *   router.replace("/");
       * }
       */
      onSuccess: () => {
        toast.success("Workspace removed");
        router.replace("/");
      },
      /**
       * Callback, вызываемый, если запрос на удаление
       * существующей рабочей области выполнен с ошибкой.
       *
       * @example
       * onError: () => {
       *   toast.error("Failed to remove workspace");
       * }
       */
      onError: () => {
        toast.error("Failed to remove workspace");
      }
    })
  };

  /**
   * Обработчик события "submit" формы редактирования
   * существующей рабочей области.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - Form event.
   */
  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateWorkspace({
      id: workspaceId,
      name: value,
    }, {
      /**
       * Callback, вызываемый, если запрос на обновление
       * существующей рабочей области выполнен успешно.
       *
       * @example
       * onSuccess: () => {
       *   toast.success("Workspace updated");
       *   setEditOpen(false);
       * }
       */
      onSuccess: () => {
        toast.success("Workspace updated");
        setEditOpen(false);
      },
      /**
       * Callback, вызываемый, если запрос на обновление
       * существующей рабочей области выполнен с ошибкой.
       *
       * @example
       * onError: () => {
       *   toast.error("Failed to update workspace");
       * }
       */
      onError: () => {
        toast.error("Failed to update workspace");
      }
    })
  };
  
  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>
              {value}
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Workspace name
                    </p>
                    <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                      Edit
                    </p>
                  </div>
                  <p className="text-sm">
                    {value}
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this workspace</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleEdit}>
                  <Input
                    value={value}
                    disabled={isUpdatingWorkspace}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder="Workspace name"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isUpdatingWorkspace}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdatingWorkspace}>Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <button
              disabled={isRemovingWorkspace}
              onClick={handleRemove}
              className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600"
            >
              <TrashIcon className="size-4" />
              <p className="text-sm font-semibold">Delete workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
