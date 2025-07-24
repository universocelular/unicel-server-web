
"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, Suspense } from "react";
import { SearchComponent } from "@/components/home/search-section";
import type { Model } from "@/lib/db/types";
import { Skeleton } from "../ui/skeleton";

const MissingModelDialog = React.lazy(() => import('./missing-model-dialog'));

interface HeroSectionProps {
  allModels: Model[];
}

export function HeroSection({ allModels }: HeroSectionProps) {
    const [showMissingModelLink, setShowMissingModelLink] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowMissingModelLink(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);


    return (
        <div className="container mx-auto px-4 pt-4 pb-8 sm:pb-12 text-center flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1
                className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary"
                >
                Desbloquea tu dispositivo ahora!
                </h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Servicios 100% remotos para Técnicos
                </p>
            </motion.div>
            
             <div className="mt-8 w-full max-w-xl">
                <SearchComponent allModels={allModels} />
             </div>

             <AnimatePresence>
                {showMissingModelLink && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-8"
                    >
                      <Suspense fallback={<Skeleton className="h-8 w-64 rounded-md" />}>
                        <MissingModelDialog />
                      </Suspense>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
