import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import Quill from 'quill';

// Динамически подключаем компонент Editor
const Editor = dynamic(() => import('@/components/editor'), { ssr: false });

interface ChatInputProps {
    placeholder: string;
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

    return (
        <div className='px-5 w-full'>
            <Editor
                placeholder={placeholder}
                onSubmit={() => {}}
                disabled={false}
                innerRef={editorRef}
            />
        </div>
    );
};

