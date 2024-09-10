import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

  /**
   * Hook, который создает модальное окно с подтверждением.
   * Используется в preferences-modal.
   *
   * @param title - заголовок модального окна
   * @param message - текст вопроса
   *
   * @returns массив, содержащий функцию, которая рендерит модальное окно,
   *           и функцию, которая возвращает Promise, который будет разрешен
   *           или отклонен, в зависимости от действия пользователя.
   */
export const useConfirm = (
  title: string,
  message: string,
): [() => JSX.Element, () => Promise<unknown>] => {

  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

  // В компоненте preferences-modal вызывается функция confirm, которая
  // устанавливает функцию resolve в стейт promise

  // resolve - функция, которая принимает значение true или false

  // Если промис не равен null (а изначально он равен функции resolve), то открывается модальное окно
  
  // Далее пользователь может отменить действие или подтвердить действие,
  // следовательно вызывая функцию resolve в промисе, которая будет принимать true или false
  const confirm = () => new Promise((resolve, reject) => {
    setPromise({ resolve });
  });

  /**
   * Закрывает модальное окно.
   * Используется в handler'ах для кнопок "Cancel" и "Confirm".
   */
  const handleClose = () => {
    setPromise(null);
  };

  /**
   * Handler, который вызывается, когда пользователь нажимает кнопку "Cancel" в
   * модальном окне. Он закрывает модальное окно и rejects промис, возвращаемый
   * функцией confirm.
   */
  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  /**
   * Handler, который вызывается, когда пользователь нажимает кнопку "Confirm" в
   * модальном окне. Он закрывает модальное окно и resolves промис, возвращаемый
   * функцией confirm, со значением true.
   */
  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  /**
   * Компонент, который рендерит модальное окно с подтверждением.
   *
   * @returns {JSX.Element} - JSX-элемент, отображающий модальное окно.
   */
  const ConfirmDialog = () => (
    <Dialog open={promise !== null}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button
            onClick={handleCancel}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmDialog, confirm];
};
