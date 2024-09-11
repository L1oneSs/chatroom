import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarButtonProps {
  icon: LucideIcon | IconType;
  label: string;
  isActive?: boolean;
};

/**
 * Рендерит кнопку в sidebar с иконкой сверху и текстом снизу.
 * 
 * @param {{
 *   icon: LucideIcon | IconType,
 *   label: string,
 *   isActive?: boolean,
 * }} props
 * @returns {JSX.Element}
 */
export const SidebarButton = ({
  icon: Icon,
  label,
  isActive,
}: SidebarButtonProps) => {
  return (
    <div className="flex flex-col items-center jusify-center gap-y-0.5 cursor-pointer group">
      <Button 
        variant="transparent" 
        className={cn(
          "size-12 p-2 group-hover:bg-accent/20",
          isActive && "bg-accent/20"
        )}
      >
        <Icon className="size-5 text-white group-hover:scale-110 transition-all" />
      </Button>
      <span className="text-[11px] text-white group-hover:text-accent">
        {label}
      </span>
    </div>
  );
};
