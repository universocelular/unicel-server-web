
"use client";

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function GlobalLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    
    // Store the previous path to detect changes
    const [previousPath, setPreviousPath] = useState(pathname + (searchParams?.toString() || ""));

    useEffect(() => {
        const currentPath = pathname + (searchParams?.toString() || "");
        
        // If the path changes, we are navigating.
        if (currentPath !== previousPath) {
            setIsLoading(true);
            setPreviousPath(currentPath);
        }

        // We can't know exactly when the page *finishes* loading on the client
        // with just hooks. A common strategy is to hide the loader after a short
        // delay, assuming the page has loaded. This provides good UX.
        // Let's set a timer to hide it, which gets cleared if we navigate again.
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Hide after 1 second

        return () => clearTimeout(timer);

    }, [pathname, searchParams, previousPath]);
    
    // A component that listens to link clicks to make the loader feel instant.
    useEffect(() => {
        const handleLinkClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if the clicked element is a link or has a link as an ancestor
            const link = target.closest('a');
            if (link && link.href && link.target !== '_blank') {
                const currentUrl = new URL(window.location.href);
                const nextUrl = new URL(link.href);
                // Only show loader for internal navigation
                if (currentUrl.origin === nextUrl.origin) {
                    // Don't show for same-page hash links
                    if (currentUrl.pathname !== nextUrl.pathname || currentUrl.search !== nextUrl.search) {
                         setIsLoading(true);
                    }
                }
            }
        };

        document.addEventListener('click', handleLinkClick);
        return () => {
            document.removeEventListener('click', handleLinkClick);
        };
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                    <Loader2 className="h-12 w-12 animate-spin text-white" />
                    <p className="mt-4 text-lg text-white font-semibold">Cargando, espere por favor...</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
