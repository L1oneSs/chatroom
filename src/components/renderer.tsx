import Quill from "quill";
import { useEffect, useRef, useState } from "react";

interface RendererProps {
    value: string
}

/**
 * Компонент, рендерящий документ Quill.
 *
 * @param value - документ Quill, сериализованный в JSON-строку.
 *
 * @returns null, если документ пустой, или div со стилями Quill, где
 *          внутренний HTML - рендеренный документ Quill.
 */
const Renderer = ({value}: RendererProps) => {

    // Состояние пустого документа
    const [isEmpty, setIsEmpty] = useState(false);

    // Ссылка на div с рендеренным документом
    const rendererRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

        //  Если документ пустой, то возвращаем null
        if(!rendererRef.current) return;

        // Ссылка на div с рендеренным документом
        const container = rendererRef.current;

        // Создаем экземпляр Quill
        const quill = new Quill(document.createElement("div"), {
            theme: "snow",
        });

        // Отключаем режим редактирования
        quill.enable(false);

        // Подготавливаем содержимое для рендеринга
        const contents = JSON.parse(value);

        // Устанавливаем содержимое
        quill.setContents(contents);

        // Проверяем пустой ли документ
        const isEmpty = quill.getText().replace(/<(.|\n)*?>/g, "").trim().length === 0;

        // Устанавливаем состояние пустого документа
        setIsEmpty(isEmpty);

        // Устанавливаем внутренний HTML в div
        container.innerHTML = quill.root.innerHTML;

        // Удаляем ссылку на Quill
        return () => {
            if(container){
                container.innerHTML = "";
            }
        }
    }, [value]);

    // Если документ пустой, то возвращаем null
    if(isEmpty) return null;

    return <div ref={rendererRef} className="ql-editor ql-renderer" />
}

export default Renderer;