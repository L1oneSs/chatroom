"use client";

import React from 'react';
import { Toolbar } from './toolbar';
import { Sidebar } from './sidebar';

import { ResizableHandle,
        ResizablePanel,
        ResizablePanelGroup
} from '@/components/ui/resizable';   
import { WorkspaceSidebar } from './workspace-sidebar';

interface WorkspaceIdLayoutProps{
    children: React.ReactNode;
}

/**
 * WorkspaceIdLayout - функциональный компонент, предназначенный
 * для отображения основных элементов интерфейса чата:
 * панели инструментов, списка чатов, и основного контента
 * 
 * @param {React.ReactNode} children - дочерние элементы, которые
 * будут отображаться в основном контенте
 * 
 * @returns {React.ReactElement} - JSX-элемент, отображающий
 * WorkspaceIdLayout
 */
const WorkspaceIdLayout = ({children}: WorkspaceIdLayoutProps) => {
    return (
        <div className='h-full'>
            <Toolbar />
            <div className='flex h-[calc(100vh-40px)]'>
                <Sidebar />
                <ResizablePanelGroup
                    direction='horizontal'
                    autoSaveId="ca-workspace-layout"
                >
                    <ResizablePanel
                        defaultSize={20}
                        minSize={11}
                        className='bg-[#5E2C5F]'
                    >
                        <WorkspaceSidebar />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel
                        minSize={20}
                    >
                        {children}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
};

export default WorkspaceIdLayout;