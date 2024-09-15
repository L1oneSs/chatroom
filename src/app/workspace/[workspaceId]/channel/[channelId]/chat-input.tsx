import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import Quill from 'quill';
import { useCreateMessage } from '@/features/messages/api/use-create-message';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useChannelId } from '@/hooks/use-channel-id';
import { toast } from 'sonner';
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url';
import { Id } from '../../../../../../convex/_generated/dataModel';

// Динамически подключаем компонент Editor
const Editor = dynamic(() => import('@/components/editor'), { ssr: false });

interface ChatInputProps {
    placeholder: string;
}

type CreateMessageValues = {
    channelId: Id<"channels">;
    workspaceId: Id<"workspaces">;
    body: string;
    image: Id<"_storage"> | undefined;
}

/**
 * Компонент, отображающий текстовое поле ввода для отправки сообщений.
 *
 * @param {{placeholder: string}} props - свойства компонента
 * @param {string} props.placeholder - текст, который будет отображаться в виде
 *                                    placeholder'а
 * @returns {JSX.Element} - компонент, отображающий текстовое поле ввода
 */
export const ChatInput = ({placeholder}: ChatInputProps) => {

    // Ссылка на компонент Editor
    const editorRef = useRef<Quill | null>(null)

    // Функция для создания сообщения
    const { mutate: createMessage } = useCreateMessage();

    // ID рабочей области
    const workspaceId = useWorkspaceId();

    // ID канала
    const channelId = useChannelId();

    // Состояние редактора
    const [editorKey, setEditorKey] = React.useState(0);

    // Состояние отправки
    const [isPending, setIsPending] = React.useState(false);

    // Функция для генерации URL для загрузки файла
    const {mutate: generateUploadUrl} = useGenerateUploadUrl();

    /**
     * Обработчик события "submit" формы создания сообщения.
     *
     * @param {{body: string, image: File | null}} values - значения,
     *                                                    которые были
     *                                                    отправлены
     *                                                    формой
     *
     * @throws {Error} - если возникла ошибка при отправке
     *                  сообщения
     */
    const handleSubmit = async ({
        body,
        image
    }: {body: string, image: File | null}) => {

        try {
            // Устанавливаем флаг отправки сообщения
            setIsPending(true);

            // Отключаем редактор
            editorRef?.current?.enable(false);

            // Создаем сообщение
            const values: CreateMessageValues = {
                channelId,
                workspaceId,
                body,
                image: undefined,
            };
            
            // Если есть изображение, то генерируем URL для загрузки
            if(image){
                // Генерируем URL для загрузки
                const url = await generateUploadUrl({}, {throwError: true});

                // Проверяем, что URL был получен
                if (!url){
                    throw new Error("Failed to generate upload url");
                }

                // Загружаем изображение на сервер
                const result = await fetch(url, {
                    method: "POST",
                    headers: {"Content-Type": image.type},
                    body: image
                });

                // Проверяем, что загрузка изображения прошла успешно
                if (!result.ok) {
                    throw new Error("Failed to upload image");
                }

                // Получаем ID загруженного изображения
                const {storageId} = await result.json()

                // Устанавливаем ID изображения
                values.image = storageId;
            }

            // Создаем сообщение
            await createMessage(values, {throwError: true});

            // Обновляем состояние редактора
            setEditorKey((prevKey) => prevKey + 1);
        } catch (error) {
            toast.error("Failed to create message");
            
        } finally {
            // Отключаем флаг отправки сообщения
            setIsPending(false);
            // Включаем редактор
            editorRef?.current?.enable(true);
        }
    }

    return (
        <div className='px-5 w-full'>
            <Editor
                key={editorKey}
                placeholder={placeholder}
                onSubmit={handleSubmit}
                disabled={isPending}
                innerRef={editorRef}
            />
        </div>
    );
};

