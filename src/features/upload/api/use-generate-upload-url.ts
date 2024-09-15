import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { api } from "../../../../convex/_generated/api";

type ResponseType = string | null;

type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

/**
 * Создает ссылку для загрузки файла.
 * @returns Hook-объект, содержащий метод mutate, data, error, isPending, isSuccess, isError, isSettled.
 * Data - ID созданной рабочей области.
 * Error - ошибка, возникшая при создании.
 * IsPending - true, если запрос на создание выполняется, false - если запрос выполнен.
 * IsSuccess - true, если запрос выполнен успешно, false - если возникла ошибка.
 * IsError - true, если возникла ошибка, false - если запрос выполнен успешно.
 * IsSettled - true, если запрос выполнен (успешно или неуспешно), false - если запрос не выполнен.
 */
export const useGenerateUploadUrl = () => {
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<
    "success" | "error" | "settled" | "pending" | null
  >(null);

  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);

  const mutation = useMutation(api.upload.generateUploadUrl);

  const mutate = useCallback(
    async (_values: {}, options?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");

        const response = await mutation();
        options?.onSuccess?.(response);
        return response;
      } catch (error) {
        setStatus("error");
        options?.onError?.(error as Error);
        if (options?.throwError) {
          throw error;
        }
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return {
    mutate,
    data,
    error,
    isPending,
    isSuccess,
    isError,
    isSettled,
  };
};
