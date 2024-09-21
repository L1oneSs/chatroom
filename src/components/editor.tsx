import React, { MutableRefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { PiTextAa } from 'react-icons/pi';
import { MdSend } from 'react-icons/md';

import Quill, { QuillOptions } from "quill"

import "quill/dist/quill.snow.css"
import { Button } from './ui/button';
import { ImageIcon, Smile, XIcon } from 'lucide-react';
import { Hint } from './hint';
import { Delta, Op } from 'quill/core';
import { cn } from '@/lib/utils';
import { EmojiPopover } from './emoji-popover';
import Image from 'next/image';

type EditorValue = {
    image: File | null;
    body: string;
}

interface EditorProps {
    variant?: 'create' | 'update';
    onSubmit: ({image, body}: EditorValue) => void;
    onCancel?: () => void;
    placeholder?: string;
    defaultValue?: Delta | Op[];
    disabled?: boolean;
    innerRef?: MutableRefObject<Quill | null>;
}

/**
 * Компонент, оборачивающий Quill editor и добавляющий дополнительные функции.
 *
 * @param {Object} props
 * @prop {string} [variant='create'] - вариант редактора, может быть 'create' или 'update'
 * @prop {function} onSubmit - функция, вызываемая при отправке формы
 * @prop {function} [onCancel] - функция, вызываемая при отмене формы
 * @prop {string} [placeholder='Write something...'] - текст placeholder'а
 * @prop {Array<Delta | Op>} [defaultValue=[]] - значение по умолчанию
 * @prop {boolean} [disabled=false] - отображать ли редактор в disabled состоянии
 * @prop {MutableRefObject<Quill | null>} [innerRef] - ref на Quill editor
 */
const Editor = ({ 
    variant = "create"
    , onSubmit
    , onCancel
    , placeholder = "Write something..."
    , defaultValue = []
    // Экземпляр Quill editor, переданный извне в компонент
    , innerRef
    , disabled = false
 }: EditorProps) => {

    // Ссылка на div с кнопками
    const containerRef = useRef<HTMLDivElement>(null); 

    // Ссылка на функцию, вызываемую при отправке формы
    const submitRef = useRef(onSubmit);

    // Текст placeholder'а
    const placeholderRef = useRef(placeholder);

    // Ссылка на quill editor
    const quillRef = useRef<Quill | null>(null);

    // Значение по умолчанию
    const defailtValueRef = useRef(defaultValue);

    // Отображать ли редактор в disabled состоянии
    const disabledRef = useRef(disabled);

    // Значение вводимого текста
    const [text, setText] = React.useState("");

    // Значение изображения
    const [image, setImage] = React.useState<File | null>(null);

    // Ссылка на изображение
    const imageElementRef = useRef<HTMLInputElement | null>(null);

    // Показать/скрыть панель инструментов
    const [isToolbarVisible, setIsToolbarVisible] = React.useState(true);

    useLayoutEffect(() => {
        // Сохраняем ссылку на функцию, вызываемую при отправке формы
        submitRef.current = onSubmit;

        // Сохраняем текст placeholder'а
        placeholderRef.current = placeholder;

        // Сохраняем значение по умолчанию
        defailtValueRef.current = defaultValue;

        // Сохраняем отображать ли редактор в disabled состоянии
        disabledRef.current = disabled;
    }); 

    useEffect(() => {

        // Если нет ref на div с кнопками, то не выполняем никаких действий
        if(!containerRef.current) return;

        // Получаем ссылку на div с кнопками
        const container = containerRef.current;

        // Создаем div для редактора
        const editorContainer = container.appendChild(container.ownerDocument.createElement("div"));

        // Инициализируем настройки Quill
        const options: QuillOptions = {
            theme: "snow",
            placeholder: placeholderRef.current,
            modules: {
                toolbar: [
                    ["bold", "italic", "strike"],
                    ["link"],
                    [{list: "ordered"}, {list: "bullet"}],
                ],
                keyboard: {
                    bindings: {
                        enter: {
                            key: "Enter",
                            /**
                             * Handler, который вызывается, когда пользователь нажимает Enter.
                             *
                             * Он получает текст из редактора, форматирует его, и
                             * вызывает функцию, переданную извне, с текстом и
                             * добавленным изображением.
                             *
                             * Если текст пустой и изображение не добавлено,
                             * то функция не вызывается.
                             */
                            handler: () => {

                                // Получаем содержимое редактора
                                const text = quill.getText()

                                // Получаем изображение
                                const addedImage = imageElementRef.current?.files?.[0] || null;

                                // Проверяем, было ли добавлено изображение и форматируем текст
                                const isEmpty = !addedImage && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

                                // Если нет, то возвращаемся
                                if (isEmpty) return;

                                // Получаем содержимое редактора
                                const body = JSON.stringify(quill.getContents());

                                // Вызываем функцию обработки события, переданную извне
                                submitRef.current?.({body, image: addedImage});
                            }
                        },
                        shift_enter: {
                            key: "Enter",
                            shiftKey: true,
                            /**
                             * Вставляет новый абзац при нажатии Shift+Enter.
                             */
                            handler: () => {
                                quill.insertText(quill.getSelection()?.index || 0, "\n");
                            }
                        }
                    }
                }
            }
        };

        // Инициализируем Quill
        const quill = new Quill(editorContainer, options);

        // Сохраняем ссылку на Quill
        quillRef.current = quill;

        // Устанавливаем фокус
        quillRef.current.focus();

        // Устанавливаем в экземпляр Quill, переданный в компонент извне, ссылку на текущий Quill
        if(innerRef) {
            innerRef.current = quill;
        }

        // Устанавливаем значение по умолчанию
        quill.setContents(defailtValueRef.current);

        // Устанавливаем значение вводимого текста
        setText(quill.getText());

        // Подписываемся на события
        quill.on(Quill.events.TEXT_CHANGE, () => {
            setText(quill.getText());
        })

        return () => {

            // Отписываемся от событий
            quill.off(Quill.events.TEXT_CHANGE);

            // Удаляем div с редактором
            if (container){
                container.innerHTML = "";
            }

            // Удаляем ссылку на Quill
            if(quillRef.current){
                quillRef.current = null;
            }

            // Удаляем ссылку на текущий Quill
            if(innerRef){
                innerRef.current = null;
            }
        }
    }, [innerRef]);

    /**
     * Переключает видимость панели инструментов.
     * 
     * @function
     */
    const toogleToolbar = () => {

        // Если панель уже скрыта, то показываем её
        setIsToolbarVisible((current) => !current);

        // Получаем ссылку на div с тулбаром
        const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");

        // Если есть div с тулбаром, то делаем его видимым/скрытым
        if(toolbarElement){
            toolbarElement.classList.toggle("hidden");
        }
    }

    // Проверяем, что поле ввода текста пустое/не пустое
    const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

    /**
     * Вставляет выбранный эмоджи в текст, 
     * используя позицию курсора.
     * 
     * @param {object} emoji - выбранный эмоджи 
     * 
     * @example
     * onEmojiSelect({
     *     id: "smile",
     *     name: "smile",
     *     native: " ",
     *     colons: ":smile:",
     *     emoticon: "",
     *     unicode: "1f642",
     *     skin: 1,
     *     custom: false
     * });
     */
    const onEmojiSelect = (emojiValue: any) => {

        // Получаем ссылку на Quill
        const quill = quillRef.current;

        // Вставляем выбранный эмоджи
        quill?.insertText(quill?.getSelection()?.index || 0, emojiValue);
    }

    return (
        <div className='flex flex-col'>
            <input
                type="file"
                accept='image/*'
                ref={imageElementRef}
                onChange = {(event) => setImage(event.target.files![0])}
                className='hidden'
            />
            <div className={cn('flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white', disabled && "opacity-50")}>
                <div ref={containerRef} className='h-full ql-custom' />
                {!!image && (
                    <div className='p-2'>
                        <div className='relative size-[62px] flex items-center justify-center group/image'>
                            <Hint
                                label='remove image'
                            >
                                <button
                                onClick={() => {
                                    setImage(null);
                                    imageElementRef.current!.value = ""
                                }}
                                className='hidden group/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center'
                                >
                                    <XIcon className='size-3.5' />
                                </button>
                            </Hint>
                            <Image
                                src={URL.createObjectURL(image)}
                                alt='Uploaded image'
                                fill
                                className='rounded-xl overflow-hidden border object-cover'
                            />
                        </div>
                    </div>
                )}
                <div className='flex px-2 pb-2 z-[5]'>
                    <Hint label={isToolbarVisible ? "Hide toolbar" : "Show toolbar"}>
                        <Button
                            disabled={disabled}
                            size="iconSm"
                            variant="ghost"
                            onClick={toogleToolbar}
                        >
                        <PiTextAa className='size-4' />
                    </Button>
                    </Hint>
                    <EmojiPopover onEmojiSelect={onEmojiSelect}>
                            <Button
                                disabled={disabled}
                                size="iconSm"
                                variant="ghost"
                            >
                            <Smile className='size-4' />
                        </Button>
                    </EmojiPopover>
                    {variant === "create" && (
                        <Hint label='Upload image'>
                            <Button
                                disabled={disabled}
                                size="iconSm"
                                variant="ghost"
                                onClick={() => {imageElementRef.current?.click()}}
                            >
                                <ImageIcon className='size-4' />
                            </Button>
                        </Hint>
                    )}
                    {variant === "update" && (
                        <div className='ml-auto flex items-center gap-x-2'>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onCancel}
                                disabled={disabled}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={disabled || isEmpty}
                                onClick={() => {
                                onSubmit({
                                    body: JSON.stringify(quillRef.current?.getContents()),
                                    image
                                })
                            }}
                                size="sm"
                                className='bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
                            >
                                Save
                            </Button>
                        </div>
                    )}
                    {variant === "create" && (
                        <Button
                            className={cn('ml-auto', isEmpty ? 'bg-white hover:bg-white text-muted-foreground' : 'bg-[#007a5a] hover:bg-[#007a5a]/80 text-white')} 
                            size="iconSm"
                            disabled={disabled || isEmpty}
                            onClick={() => {
                                onSubmit({
                                    body: JSON.stringify(quillRef.current?.getContents()),
                                    image
                                })
                            }}
                        >
                            <MdSend className='size-4' />
                        </Button>
                    )}   
                </div>
            </div>
            {variant === "create" && (
                <div className={cn('p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition', !isEmpty && "opacity-100")}>
                    <p>
                        <strong>Shift + Return</strong> to add a new line
                    </p>
                </div>
            )}
        </div>
    );
};

export default Editor;