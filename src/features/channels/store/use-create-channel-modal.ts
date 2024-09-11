import {atom, useAtom} from "jotai";

// Флаг открытия/закрытия модального окна
const modalState = atom(false);

/**
 * Хук для открытия/закрытия модального окна создания канала.
 *
 * @returns Возвращает состояние модального окна и функцию для его изменения
 */
export const useCreateChannelModal = () => {
    // Возвращаем состояние модального окна и функцию для его изменения
    return useAtom(modalState);
}