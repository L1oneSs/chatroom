"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HintProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

/**
 * Компонент, который оборачивает своих детей в провайдер тултипа и
 * отображает переданный label в виде тултипа.
 *
 * @param {string} label - метка, отображаемая в тултипе
 * @param {React.ReactNode} children - дети, оборачиваемые провайдером тултипа
 * @param {"top"|"right"|"bottom"|"left"} side - сторона, на которой отображается тултип
 * @param {"start"|"center"|"end"} align - выравнивание тултипа на выбранной стороне
 */
export const Hint = ({
  label,
  children,
  side,
  align
}: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="bg-black text-white border border-white/5">
          <p className="font-medium text-xs">
            {label}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
