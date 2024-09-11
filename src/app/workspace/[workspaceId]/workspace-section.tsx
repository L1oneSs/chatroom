import { useToggle } from "react-use";
import { PlusIcon } from "lucide-react";
import { FaCaretDown } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";

interface WorkspaceSectionProps {
  children: React.ReactNode;
  label: string;
  hint: string;
  onNew?: () => void;
};

/**
 * WorkspaceSection - функциональный компонент, предназначенный
 * для отображения заголовка секции в sidebar, с возможностью
 * скрытия/отображения дочерних элементов.
 *
 * @param {React.ReactNode} children - дочерние элементы, которые
 * будут отображаться в секции
 *
 * @param {string} label - текст, отображаемый в заголовке секции
 *
 * @param {string} hint - текст, отображаемый в всплывающей подсказке
 * при наведении курсора на кнопку "+"
 *
 * @param {() => void} onNew - функция, вызываемая при клике на кнопку "+"
 */
export const WorkspaceSection = ({
  children,
  label,
  hint,
  onNew,
}: WorkspaceSectionProps) => {
  const [on, toggle] = useToggle(true);

  return (
    <div className="flex flex-col mt-3 px-2">
      <div className="flex items-center px-3.5 group">
        <Button
          variant="transparent"
          className="p-0.5 text-sm text-[#f9edffcc] shrink-0 size-6"
          onClick={toggle}
        >
          <FaCaretDown className={cn(
            "size-4 transition-transform",
            on && "-rotate-90"
          )} />
        </Button>
        <Button
          variant="transparent"
          size="sm"
          className="group px-1.5 text-sm text-[#f9edffcc] h-[28px] justify-start overflow-hidden items-center"
        >
          <span className="truncate">{label}</span>
        </Button>
        {onNew && (
          <Hint label={hint} side="top" align="center">
            <Button
              onClick={onNew}
              variant="transparent"
              size="iconSm"
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-0.5 text-sm text-[#f9edffcc] size-6 shrink-0"
            >
              <PlusIcon className="size-5" />
            </Button>
          </Hint>
        )}
      </div>
      {on && children}
    </div>
  );
};
