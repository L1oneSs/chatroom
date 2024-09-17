/* eslint-disable @next/next/no-img-element */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";

interface ThumbnailProps {
  url: string | null | undefined;
};

/**
 * Компонент, который отображает маленькую картинку, но если на нее кликнуть,
 * то она открывает диалог с большой картинкой.
 *
 * @param {{ url: string | null | undefined }} props
 * @returns {JSX.Element}
 */
export const Thumbnail = ({ url }: ThumbnailProps) => {
  if (!url) return null;

  return (
    <Dialog>
      <DialogTrigger>
        <div className="relative overflow-hidden max-w-[360px] border rounded-lg my-2 cursor-zoom-in">
          <img
            src={url}
            alt="Mesage image"
            className="rounded-md object-cover size-full"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] border-none bg-transparent p-0 shadow-none">
        <img
          src={url}
          alt="Mesage image"
          className="rounded-md object-cover size-full"
        />
      </DialogContent>
    </Dialog>
  );
};

