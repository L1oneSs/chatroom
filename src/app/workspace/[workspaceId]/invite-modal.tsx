import { toast } from "sonner";
import { CopyIcon, RefreshCcw } from "lucide-react";

import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  name: string;
  joinCode: string;
};

/**
 * InviteModal - функциональный компонент, предназначенный для
 * отображения модального окна с приглашением в рабочую область.
 *
 * @example
 * <InviteModal
 *   open={isOpen}
 *   setOpen={setOpen}
 *   name="My workspace"
 *   joinCode="1234567890"
 * />
 *
 * @param {boolean} open - флаг, указывающий на то, открыто ли модальное окно
 * @param {(open: boolean) => void} setOpen - функция, которая изменяет значение `open`
 * @param {string} name - название рабочей области
 * @param {string} joinCode - код приглашения в рабочую область
 * @returns {JSX.Element} - JSX-элемент, отображающий модальное окно с приглашением
 */
export const InviteModal = ({ 
  open, 
  setOpen,
  name,
  joinCode,
}: InviteModalProps) => {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This will deactivate the current invite code and generate a new one.",
  );

  // Обработчик для генерации нового кода приглашения
  const { mutate, isPending } = useNewJoinCode();

  /**
   * Обработчик, который генерирует новый код приглашения.
   *
   * Спрашивает подтверждение у пользователя, а затем
   * вызывает {@link useNewJoinCode} c ID рабочей области.
   *
   * @see useNewJoinCode
   */
  const handleNewCode = async () => {
    // Спрашиваем подтверждение у пользователя
    const ok = await confirm();

    // Если пользователь не согласился, выходим из функции
    if (!ok) return;

    mutate({ workspaceId }, {
      /**
       * Callback, который вызывается, если запрос на смену
       * кода приглашения выполнен успешно.
       *
       * @example
       * onSuccess: () => {
       *   toast.success("Invite code regenerated");
       * }
       */
      onSuccess: () => {
        toast.success("Invite code regenerated");
      },
      /**
       * Callback, который вызывается, если запрос на смену
       * кода приглашения выполнен с ошибкой.
       *
       * @example
       * onError: () => {
       *   toast.error("Failed to regenerate invite code");
       * }
       */
      onError: () => {
        toast.error("Failed to regenerate invite code");
      }
    });
  };

  /**
   * Копирует ссылку приглашения в буфер обмена.
   *
   * @example
   * <InviteModal
   *   onCopy={handleCopy}
   * />
   */

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => toast.success("Invite link copied to clipboard"));
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite people to {name}</DialogTitle>
            <DialogDescription>
              Use the code below to invite people to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-4 items-center justify-center py-10">
            <p className="text-4xl font-bold tracking-widest uppercase">
              {joinCode}
            </p>
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
            >
              Copy link
              <CopyIcon className="size-4 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button disabled={isPending} onClick={handleNewCode} variant="outline">
              New code
              <RefreshCcw className="size-4 ml-2" />
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
