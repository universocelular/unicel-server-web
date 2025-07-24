
"use client";

import type { Model, Service } from "@/lib/db/types";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getApplicableServices } from "@/lib/utils";
import Image from "next/image";


const getCategoryEmoji = (category: Model['category']) => {
  switch (category) {
    case 'Phone': return '📱';
    case 'Mac': return '💻';
    case 'iPad': return '📲';
    case 'Watch': return '⌚';
    default: return '📱';
  }
};


export function ServiceSelection({ model, allServices }: { model: Model, allServices: Service[] }) {
  const router = useRouter();
  
  const applicableServices = useMemo(() => getApplicableServices(model, allServices), [model, allServices]);
  const emoji = useMemo(() => getCategoryEmoji(model.category), [model.category]);

  const handleSelect = (service: Service) => {
    // Special case for 'Liberar SIM' which needs carrier selection
    if (service.id === '4') { 
      router.push(`/model/${model.id}/${service.id}/unlock`);
    } else if (service.subServices && service.subServices.length > 0) {
       // Services with sub-options (e.g., iCloud, IMEI Report)
      router.push(`/model/${model.id}/${service.id}`);
    } else {
      // Direct to pricing for services without sub-options
      router.push(`/model/${model.id}/${service.id}/prices`);
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
        <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
          <span role="img" aria-label="device icon" className="mr-1">{emoji}</span>{model.brand} {model.name}
        </h1>

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
        {applicableServices.map((service, index) => (
          <motion.div
            key={service.id}
            className="w-32 h-32"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
          >
            <button onClick={() => handleSelect(service)} className="w-full h-full text-left">
              <Card className="h-full flex flex-col justify-center items-center text-center border-2 border-border/20 hover:border-secondary transition-colors duration-300 p-2 overflow-hidden">
                <div className="flex-1 flex justify-center items-center">
                  {service.emoji ? (
                      <span className="text-4xl">{service.emoji}</span>
                  ) : service.imageUrl ? (
                      <Image 
                        src={service.imageUrl}
                        alt={service.name}
                        width={64}
                        height={64}
                        className="object-contain h-16 w-16"
                        data-ai-hint={service.dataAiHint}
                        priority={index < 4} // Prioritize loading for the first 4 images
                      />
                  ) : service.iconSvg ? (
                      <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-10 h-10"
                      dangerouslySetInnerHTML={{ __html: service.iconSvg }}
                      />
                  ) : null}
                </div>
                <CardHeader className="p-0 flex-grow-0 mt-2">
                    <CardTitle className="text-xs font-semibold">{service.name}</CardTitle>
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
