
"use client";

import type { Model, Service, Country, Carrier } from "@/lib/db/types";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries, carriers as allCarriers } from "@/lib/db/data";

const getCategoryEmoji = (category: Model['category']) => {
  switch (category) {
    case 'Phone': return '📱';
    case 'Mac': return '💻';
    case 'iPad': return '📲';
    case 'Watch': return '⌚';
    default: return '📱';
  }
};

const frontendCountries = countries.filter(c => c.id !== 'global');

export function CarrierSelection({ model, service }: { model: Model; service: Service }) {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const [selectedCarrier, setSelectedCarrier] = useState<string | undefined>();
  const emoji = useMemo(() => getCategoryEmoji(model.category), [model.category]);

  const handleContinue = () => {
    if (!selectedCountry || !selectedCarrier) {
      alert("Por favor, selecciona el país y la operadora.");
      return;
    }
    // Navigate to a prices page that also knows about the selected carrier
    router.push(`/model/${model.id}/${service.id}/prices?carrierId=${selectedCarrier}`);
  };

  const availableCarriers = useMemo(() => {
    if (!selectedCountry) return [];
    return allCarriers.filter(c => c.countryId === selectedCountry);
  }, [selectedCountry]);
  
  const currentCountry = useMemo(() => {
      if (!selectedCountry) return null;
      return countries.find(c => c.id === selectedCountry);
  }, [selectedCountry]);
  
  const currentCarrier = useMemo(() => {
    if (!selectedCarrier) return null;
    return allCarriers.find(c => c.id === selectedCarrier);
  }, [selectedCarrier]);

  const FlagComponent = currentCountry?.flag;
  const CarrierLogoComponent = currentCarrier?.logo;

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          <span role="img" aria-label="device icon" className="mr-2">{emoji}</span> {model.brand} {model.name}
        </h1>
        <p className="mt-2 text-2xl md:text-4xl text-primary font-semibold">
          {service.name}
        </p>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          Selecciona el país y la operadora de origen del dispositivo
        </p>
      </motion.div>

      <motion.div 
        className="max-w-md mx-auto mt-12 space-y-6 text-left"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="grid gap-2">
            <Label htmlFor="country" className="text-lg flex items-center gap-2">
                <span>🌍</span> País de Origen
            </Label>
            <Select onValueChange={(value) => { setSelectedCountry(value); setSelectedCarrier(undefined); }} value={selectedCountry}>
                <SelectTrigger id="country" className="h-12 text-base">
                    <SelectValue>
                        <div className="flex items-center gap-2">
                            {FlagComponent && currentCountry ? (
                                <>
                                  <FlagComponent />
                                  <span>{currentCountry.name}</span>
                                </>
                            ) : (
                                <span>Selecciona un país</span>
                            )}
                        </div>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {frontendCountries.map(country => {
                        const Flag = country.flag;
                        return (
                            <SelectItem key={country.id} value={country.id}>
                                <div className="flex items-center gap-2">
                                    <Flag />
                                    <span>{country.name}</span>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>

        <div className="grid gap-2">
            <Label htmlFor="carrier" className="text-lg flex items-center gap-2">
                <span>📡</span> Operadora Original
            </Label>
            <Select onValueChange={setSelectedCarrier} value={selectedCarrier} disabled={!selectedCountry}>
                 <SelectTrigger id="carrier" className="h-12 text-base">
                    <SelectValue>
                        <div className="flex items-center gap-2 h-8">
                         {CarrierLogoComponent ? (
                            <CarrierLogoComponent className="h-full w-auto" />
                         ) : (
                            <span>{currentCarrier?.name || "Selecciona una operadora"}</span>
                         )}
                        </div>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {availableCarriers.map(carrier => {
                        const Logo = carrier.logo;
                        return (
                         <SelectItem key={carrier.id} value={carrier.id}>
                           <div className="flex items-center gap-3 h-8">
                              {Logo ? <Logo className="h-full w-auto" /> : <span>{carrier.name}</span>}
                           </div>
                         </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
        </div>
      </motion.div>

       <div className="mt-12 flex flex-col items-center gap-6">
        <Button size="lg" onClick={handleContinue} disabled={!selectedCarrier}>
          Continuar
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.back()} className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
          <span role="img" aria-label="back">👈🏻</span>&nbsp;Atrás
        </Button>
      </div>
    </div>
  );
}
