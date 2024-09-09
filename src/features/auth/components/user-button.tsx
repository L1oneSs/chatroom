"use client";

import { Loader, LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCurrentUser } from "../api/use-current-user";
import { useEffect, useMemo, useState } from "react";

/**
 * Кнопка авторизованного пользователя, отображающая его аватар
 * и содержащая выпадающее меню с кнопкой "Выйти"
 *
 * @returns {JSX.Element} Кнопка авторизованного пользователя
 */
export const UserButton = () => {


    /**
     * Функция, возвращающая случайный bg-color
     * 
     * @returns случайный bg-color класс из массива
     */
    const getRandomColor = () => {
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-blue-500", "bg-indigo-500", "bg-purple-500"];
    return colors[Math.floor(Math.random() * colors.length)];
  };


  const [randomColor, setRandomColor] = useState('');

  useEffect(() => {
    const storedColor = localStorage.getItem('randomColor');
    setRandomColor(storedColor || getRandomColor());
  }, []);

  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();
  

  if (isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />
  }

  if (!data) {
    return null;
  }

  const { image, name } = data;

  const avatarFallback = name!.charAt(0).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="rounded-md size-10 hover:opacity-75 transition">
          <AvatarImage className="rounded-md" alt={name} src={image} />
          <AvatarFallback className={`rounded-md ${randomColor} text-white`}>
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="right" className="w-60">
        <DropdownMenuItem onClick={() => signOut()} className="h-10">
          <LogOut className="size-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
