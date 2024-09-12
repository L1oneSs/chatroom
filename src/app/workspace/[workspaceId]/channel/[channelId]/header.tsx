import { Button } from '@/components/ui/button';
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { TrashIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DialogClose } from '@radix-ui/react-dialog';
import { useUpdateChannel } from '@/features/channels/api/use-update-channel';
import { useChannelId } from '@/hooks/use-channel-id';
import { toast } from 'sonner';
import { useRemoveChannel } from '@/features/channels/api/use-remove-channel';
import { useConfirm } from '@/hooks/use-confirm';
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useCurrentMember } from '@/features/members/api/use-current-member';

interface HeaderProps {
    name: string;
}

/**
 * Header - функциональный компонент, предназначенный для
 * отображения заголовка канала, включая кнопку
 * приглашения пользователей, кнопку настроек.
 *
 * @param {{name: string}} props - объект с данными
 * 
 * @returns {React.ReactElement} - JSX-элемент, отображающий
 * заголовок канала
 */
const Header = ({name}: HeaderProps) => {

    const router = useRouter();

    // Id активной рабочей области
    const workspaceId = useWorkspaceId();

    // Сосотояние изменения имени канала
    const [editOpen, setEditOpen] = React.useState(false);

    // Состояние ввода имени канала
    const [value, setValue] = React.useState(name);

    // Id активного канала
    const channelId = useChannelId();

    // Состояние обновления канала
    const {mutate: updateChannel, isPending: updatingChannel} = useUpdateChannel();

    // Состояние удаления канала
    const {mutate: deleteChannel, isPending: deletingChannel} = useRemoveChannel();

    // Состояние текущего участника
    const { data: member } = useCurrentMember({workspaceId});

    // Подтверждение удаления канала
    const [ConfirmDialog, confirm] = useConfirm(
        "Delete this channel?",
        "Are you sure you want to delete this channel?",
    );

    /**
     * Меняет состояние editOpen на value, если у текущего
     * участника есть права администратора.
     * @param {boolean} value - Новое состояние editOpen.
     */
    const handleEditOpen = (value: boolean) => {

        if(member?.role !== "admin") {
            return;
        }

        setEditOpen(value);
    }

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
    setValue(value);
  };

    /**
     * Удаляет канал, если пользователь подтвердил удаление.
     *
     * @async
     * @returns {Promise<void>}
     */
  const handleDelete = async () => {

    // Ожидаем подтверждения
    const ok = await confirm();

    // Если пользователь не подтвердил, то return
    if(!ok) {
        return;
    }

    deleteChannel({id: channelId}, {
        /**
         * Callback, вызываемый, если запрос на удаление канала выполнен успешно.
         *
         * @example
         * onSuccess: () => {
         *   toast.success("Channel was deleted successfully");
         *   router.push(`/workspace/${workspaceId}`);
         * }
         */
        onSuccess: () => {
            toast.success("Channel was deleted successfully");
            router.push(`/workspace/${workspaceId}`);
        },
        /**
         * Callback, вызываемый, если запрос на удаление канала выполнен с ошибкой.
         *
         * @example
         * onError: () => {
         *   toast.error("Failed to delete channel");
         * }
         */
        onError: () => {
            toast.error("Failed to delete channel");
        }
    })
  }

    /**
     * Обработчик события "submit" формы редактирования
     * существующего канала.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - Form event.
     */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateChannel({id: channelId, name: value}, {
        /**
         * Callback, вызываемый, если запрос на обновление
         * существующего канала выполнен успешно.
         *
         * @example
         * onSuccess: () => {
         *   toast.success("Channel was renamed successfully");
         *   setEditOpen(false);
         * }
         */
        onSuccess: () => {
            toast.success("Channel was renamed successfully");
            setEditOpen(false);
        },
        /**
         * Callback, вызываемый, если запрос на обновление
         * существующего канала выполнен с ошибкой.
         *
         * @example
         * onError: () => {
         *   toast.error("Failed to update channel");
         * }
         */
        onError: () => {
            toast.error("Failed to update channel");
        }
    });
  }

    return (
        <div className='bg-white border-b h-[49px] flex items-center w-full px-4 overflow-hidden'>
            <ConfirmDialog />
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        className='text-lg font-semibold px-2 overflow-hidden w-auto'
                        size="sm"
                    >
                        <span className='truncate'># {name}</span>
                        <FaChevronDown className='size-2.5 ml-2'/>
                    </Button>
                </DialogTrigger>
                <DialogContent className='p-0 bg-gray-50 overflow-hidden'>
                    <DialogHeader className='p-4 border-b bg-white'>
                        <DialogTitle>
                            # {name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className='px-4 pb-4 flex flex-col gap-y-2'>
                        <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                            <DialogTrigger asChild>
                                <div className='px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50'>
                                    <div className='flex items-center justify-between'>
                                        <p className='text-sm font-semibold'>
                                            Channel name
                                        </p>
                                        {member?.role === "admin" && (
                                            <p className='text-sm text-[#1264a3] hover:underline font-semibold'>
                                                Edit  
                                            </p>
                                        )}
                                    </div>
                                    <p className='text-sm'># {name}</p>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        rename cannel # {name}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className='space-y-4'>
                                    <Input
                                        value={value}
                                        disabled={updatingChannel}
                                        onChange={handleChange}
                                        required
                                        autoFocus
                                        minLength={3}
                                        maxLength={80}
                                        placeholder='Channel name'
                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button
                                                variant="outline"
                                                disabled={updatingChannel}
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            disabled={updatingChannel}
                                        >
                                            Save
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        {member?.role === "admin" && (
                          <button
                                onClick={handleDelete}
                                disabled={deletingChannel}
                                className='flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600'>
                                <TrashIcon className='size-4'/>
                                <p className='text-sm font-semibold'>
                                    Delete channel
                                </p>
                            </button>  
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Header;