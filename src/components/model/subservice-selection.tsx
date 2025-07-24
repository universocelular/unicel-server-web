
"use client";

import type { Model, Service } from "@/lib/db/types";
import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const getCategoryEmoji = (category: Model['category']) => {
  switch (category) {
    case 'Phone': return '📱';
    case 'Mac': return '💻';
    case 'iPad': return '📲';
    case 'Watch': return '⌚';
    default: return '📱';
  }
};

export function SubServiceSelection({ model, service }: { model: Model, service: Service }) {
  const router = useRouter();
  const emoji = useMemo(() => getCategoryEmoji(model.category), [model.category]);

  const handleSelect = (subServiceId: string) => {
    router.push(`/model/${model.id}/${service.id}/prices?subServiceId=${subServiceId}`);
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
        <span role="img" aria-label="device icon" className="mr-1">{emoji}</span> {model.brand} {model.name}
      </h1>
      <p className="mt-1 text-lg md:text-xl text-primary font-semibold">
        {service.name}
      </p>

      <motion.div 
        className="flex flex-wrap justify-center gap-4 mt-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        {service.subServices?.map((sub) => (
          <motion.div
            key={sub.id}
            className="w-40 h-40"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
          >
            <button
              onClick={() => handleSelect(sub.id)}
              className="w-full h-full text-left"
            >
                <Card className="h-full flex flex-col justify-center items-center text-center border-2 border-border/20 hover:border-secondary transition-colors duration-300 p-2 overflow-hidden">
                  <div className="flex-1 flex justify-center items-center pointer-events-none">
                    {sub.emoji ? (
                      <span className="text-5xl">{sub.emoji}</span>
                    ) : sub.imageUrl ? (
                      <div className="relative w-24 h-24">
                        <Image
                          src={sub.imageUrl}
                          alt={sub.name}
                          fill
                          className="object-contain"
                          data-ai-hint={sub.dataAiHint}
                        />
                      </div>
                    ) : sub.iconSvg ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-16 h-16"
                        dangerouslySetInnerHTML={{ __html: sub.iconSvg }}
                      />
                    ) : null}
                  </div>
                  <CardHeader className="p-0 w-full mt-2">
                      <CardTitle className="text-sm font-semibold">{sub.name}</CardTitle>
                  </CardHeader>
                </Card>
            </button>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="mt-16">
        <Button variant="outline" size="lg" onClick={() => router.back()} className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
          <span role="img" aria-label="back">👈🏻</span>&nbsp;Atrás
        </Button>
      </div>
    </motion.div>
  );
}
