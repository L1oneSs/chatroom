import { UserButton } from '@/features/auth/components/user-button';
import React from 'react';
import { WorkspaceSwitcher } from './workspace-switcher';
import { SidebarButton } from './sidebar-button';
import { BellIcon, Home, MessagesSquareIcon, MoreHorizontalIcon, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

/**
 * Рендерит sidebar, состоящий из:
 * - WorkspaceSwitcher
 * - SidebarButton'ов для HOME, DMs, Activity, More
 * - UserButton'а внизу
 *
 * @returns {JSX.Element}
 */
export const Sidebar = () => {

    const pathname = usePathname();


    return (
        <aside className='w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4'>
            <WorkspaceSwitcher />
            <SidebarButton icon={Home} label='Home' isActive={pathname.includes("/workspace")} />
            <SidebarButton icon={MessagesSquareIcon} label='DMs' isActive />
            <SidebarButton icon={BellIcon} label='Activity' isActive />
            <SidebarButton icon={Settings} label='Settings' isActive />
            <div className='flex flex-col items-center justify-center gap-y-1 mt-auto'>
                <UserButton />
            </div>
        </aside>
    );
};

