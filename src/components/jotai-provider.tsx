"use client"

import { Provider } from "jotai"

interface JotaiProviderProps {
    children: React.ReactNode;
}

/**
 * Компонент, оборачивающий приложение в Provider,
 * чтобы использовать стейт из Jotai.
 *
 * @example
 * 
 *
 * import { JotaiProvider } from "@/components/jotai-provider";
 *
 * function App() {
 *   return (
 *     <JotaiProvider>
 *       <YourApp />
 *     </JotaiProvider>
 *   );
 * }
 */

export const JotaiProvider = ({ children }: JotaiProviderProps) => {
    return(
        <Provider>
            {children}
        </Provider>
    )
}