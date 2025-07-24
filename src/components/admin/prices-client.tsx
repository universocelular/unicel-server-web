
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Brand, Model, Service, Country, Carrier } from "@/lib/db/types";
import { updateModel, updatePricesInBatch, setAllPricesUnderConstruction } from "@/lib/actions/models";
import { getSettings, updateSettings } from "@/lib/actions/settings";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { getApplicableServices } from "@/lib/utils";
import { countries as allCountries, carriers as allCarriers } from "@/lib/db/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Skeleton } from "../ui/skeleton";
import React from "react";
import { useAdminData } from "@/contexts/admin-data-context";

const ModelSearchComboBox = React.lazy(() => import('./model-search-combobox'));

interface SimUnlockPriceState {
    countryId?: string;
    carrierId?: string;
}

const getModelSeries = (modelName: string) => {
    const name = modelName.toLowerCase();
    if (name.includes('galaxy a')) return 0; // Series A
    if (name.includes('galaxy s')) return 1; // Series S
    if (name.includes('galaxy note')) return 2; // Series Note
    if (name.includes('galaxy z')) return 3; // Series Z
    return 4; // Rest
};


export function PricesClient() {
  const { brands: initialBrands, models, setModels, services: initialServices } = useAdminData();
  const { toast } = useToast();

  // State for "per-model" editing
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>();
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>();
  const [prices, setPrices] = useState<Record<string, number | null | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simUnlockPriceState, setSimUnlockPriceState] = useState<SimUnlockPriceState>({});

  // State for "batch" editing
  const [batchBrandId, setBatchBrandId] = useState<string | undefined>();
  const [batchServiceId, setBatchServiceId] = useState<string | undefined>();
  const [batchPrice, setBatchPrice] = useState<string>('');
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  const [selectedBatchModelIds, setSelectedBatchModelIds] = useState<Set<string>>(new Set());
  
  // State for currency conversion
  const [usdToArsRate, setUsdToArsRate] = useState<number>(1);
  const [isRateSaving, setIsRateSaving] = useState(false);
  
  useEffect(() => {
    async function fetchRate() {
        const settings = await getSettings();
        setUsdToArsRate(settings.usdToArsRate || 1340); // Default if not set
    }
    fetchRate();
  }, [])


  const sortedBrands = useMemo(() => {
    const priorityOrder = ["Samsung", "Motorola", "Xiaomi", "Huawei", "Apple"];
    return [...initialBrands].sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.name);
      const bIndex = priorityOrder.indexOf(b.name);

      if (aIndex > -1 && bIndex > -1) {
        return aIndex - bIndex;
      }
      if (aIndex > -1) {
        return -1;
      }
      if (bIndex > -1) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [initialBrands]);

  // ---- "Per-Model" Logic ----
  const availableModels = useMemo(() => {
    if (!selectedBrandId) return [];
    const brandName = initialBrands.find(b => b.id === selectedBrandId)?.name;
    if (!brandName) return [];

    const filtered = models.filter((model) => model.brand === brandName);

    if (brandName === 'Samsung') {
        return filtered.sort((a, b) => {
            const seriesA = getModelSeries(a.name);
            const seriesB = getModelSeries(b.name);

            if (seriesA !== seriesB) {
                return seriesA - seriesB;
            }
            // If series is the same, sort by name (e.g. S24 vs S23)
            return b.name.localeCompare(a.name);
        });
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedBrandId, models, initialBrands]);


  const selectedModel = useMemo(() => {
    if (!selectedModelId) return null;
    return models.find((model) => model.id === selectedModelId) || null;
  }, [selectedModelId, models]);

  const applicableServices = useMemo(() => {
    if (!selectedModel) return [];
    return getApplicableServices(selectedModel, initialServices);
  }, [selectedModel, initialServices]);

  const availableCarriers = useMemo(() => {
    if (!simUnlockPriceState.countryId) return [];
    return allCarriers.filter(c => c.countryId === simUnlockPriceState.countryId);
  }, [simUnlockPriceState.countryId]);

  useEffect(() => {
    if (selectedModel) {
      const initialPrices: Record<string, number | undefined> = {};
      applicableServices.forEach(service => {
        if (service.subServices && service.subServices.length > 0) {
          service.subServices.forEach(sub => {
            const price = (selectedModel.priceOverrides?.[sub.id] as number | undefined) ?? sub.price;
            initialPrices[sub.id] = price;
          });
        } else if (service.id !== '4') { // Not SIM Unlock
          const price = (selectedModel.priceOverrides?.[service.id] as number | undefined) ?? service.price;
          initialPrices[service.id] = price;
        }
      });
      // For SIM unlock, we need to load all possible overrides
      const simUnlockOverrides = selectedModel.priceOverrides?.['4'] as Record<string, number> | undefined;
      if (simUnlockOverrides) {
          for (const carrierId in simUnlockOverrides) {
              initialPrices[`4-${carrierId}`] = simUnlockOverrides[carrierId];
          }
      }
      setPrices(initialPrices);
    } else {
      setPrices({});
    }
  }, [selectedModel, applicableServices]);
  
  useEffect(() => {
    setSimUnlockPriceState({});
  }, [selectedModelId])


  const handlePriceChange = (id: string, value: string) => {
    const newPrice = value === '' ? undefined : parseFloat(value);
    if (value === '' || !isNaN(newPrice!)) {
      setPrices(prev => ({ ...prev, [id]: newPrice }));
    }
  };

  const handleSaveAllChanges = async () => {
    if (!selectedModel) return;

    setIsSubmitting(true);
    const updatedOverrides = JSON.parse(JSON.stringify(selectedModel.priceOverrides || {}));

    for (const key in prices) {
        const newPrice = prices[key];

        if (key.startsWith('4-')) {
            const carrierId = key.substring(2);
            if (!updatedOverrides['4']) updatedOverrides['4'] = {};
            if (newPrice === undefined || newPrice === null) delete updatedOverrides['4'][carrierId];
            else updatedOverrides['4'][carrierId] = newPrice;
        } else {
            if (newPrice === undefined || newPrice === null) delete updatedOverrides[key];
            else updatedOverrides[key] = newPrice;
        }
    }
    
    try {
      const updatedModel = await updateModel(selectedModel.id, { priceOverrides: updatedOverrides });
      if (updatedModel) {
        setModels(currentModels => 
            currentModels.map(m => m.id === updatedModel.id ? updatedModel : m)
        );
      }
      toast({ title: "Éxito", description: "Todos los precios han sido actualizados." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron actualizar los precios." });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentCountry = useMemo(() => {
    return allCountries.find(c => c.id === simUnlockPriceState.countryId);
  }, [simUnlockPriceState.countryId]);
  
  // ---- Batch Logic ----
  const batchAvailableModels = useMemo(() => {
      if (!batchBrandId) return [];
      const brandName = initialBrands.find(b => b.id === batchBrandId)?.name;
      if (!brandName) return [];
      return models.filter((model) => model.brand === brandName);
  }, [batchBrandId, models, initialBrands]);
  
  const handleBatchBrandChange = (brandId: string) => {
    setBatchBrandId(brandId);
    setSelectedBatchModelIds(new Set()); // Reset selection when brand changes
  };

  const handleToggleAllModels = (checked: boolean) => {
    if (checked) {
      const allModelIds = new Set(batchAvailableModels.map(m => m.id));
      setSelectedBatchModelIds(allModelIds);
    } else {
      setSelectedBatchModelIds(new Set());
    }
  };

  const handleToggleModel = (modelId: string, checked: boolean) => {
    const newSet = new Set(selectedBatchModelIds);
    if (checked) {
      newSet.add(modelId);
    } else {
      newSet.delete(modelId);
    }
    setSelectedBatchModelIds(newSet);
  };
  
  const handleBatchUpdate = async () => {
    if (selectedBatchModelIds.size === 0 || !batchServiceId || batchPrice === '') {
        toast({
            variant: "destructive",
            title: "Campos requeridos",
            description: "Por favor, selecciona modelos, un servicio e ingresa un precio."
        });
        return;
    }

    const modelIds = Array.from(selectedBatchModelIds);
    const price = parseFloat(batchPrice);

    if (isNaN(price)) {
        toast({
            variant: "destructive",
            title: "Precio inválido",
            description: "Asegúrate de que el precio sea un número correcto."
        });
        return;
    }
    
    setIsBatchSubmitting(true);
    try {
        await updatePricesInBatch(modelIds, batchServiceId, price);
        toast({ title: "Éxito", description: `Precios actualizados para ${modelIds.length} modelo(s).` });
        // Optionally reset the form
        setSelectedBatchModelIds(new Set());
        setBatchServiceId(undefined);
        setBatchPrice('');
    } catch (error) {
        console.error("Error en la actualización por lote:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo completar la operación." });
    } finally {
        setIsBatchSubmitting(false);
    }
  };
  
  const handleSaveRate = async () => {
    setIsRateSaving(true);
    try {
        await updateSettings({ usdToArsRate });
        toast({ title: "Éxito", description: "Tasa de cambio guardada correctamente." });
    } catch (error) {
        console.error("Error saving rate:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la tasa de cambio." });
    } finally {
        setIsRateSaving(false);
    }
  };

  const handleUnderConstruction = async () => {
    setIsBatchSubmitting(true);
    try {
        await setAllPricesUnderConstruction();
        toast({ title: "Éxito", description: "Todos los precios se han marcado como 'En construcción'." });
    } catch (error) {
        console.error("Error setting prices to under construction:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo completar la operación." });
    } finally {
        setIsBatchSubmitting(false);
    }
  };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">💵 Gestión de Precios</h1>
      </div>

       <Accordion type="multiple" defaultValue={["item-1"]} className="w-full space-y-4">
        <AccordionItem value="item-1">
          <Card>
            <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
              <span className="flex-1 text-left">
                <span className="mr-2">🔍</span>Precios por Modelo
              </span>
            </AccordionTrigger>
            <AccordionContent asChild>
                <div className="p-6 pt-0">
                    <CardDescription className="mb-6">
                        Elige una marca y luego un modelo para ver y editar los precios de los servicios aplicables.
                    </CardDescription>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="brand-select">Marca</Label>
                            <Select onValueChange={(value) => { setSelectedBrandId(value); setSelectedModelId(undefined); }} value={selectedBrandId}>
                            <SelectTrigger id="brand-select"><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
                            <SelectContent>
                                {sortedBrands.map(brand => (
                                <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="model-select">Modelo</Label>
                            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                                <ModelSearchComboBox 
                                    models={availableModels}
                                    selectedModelId={selectedModelId}
                                    onSelectModel={setSelectedModelId}
                                    disabled={!selectedBrandId}
                                />
                            </Suspense>
                        </div>
                        </div>
                    </div>

                    {selectedModel && (
                    <div className="mt-6">
                        <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl">Servicios para {selectedModel.name}</CardTitle>
                        <CardDescription>
                            Ajusta los precios para este modelo. Los campos vacíos usarán el precio base del servicio.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                        <div className="space-y-4">
                            {applicableServices.map(service => (
                            <div key={service.id}>
                                {service.subServices && service.subServices.length > 0 ? (
                                <>
                                    <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
                                    <div className="pl-4 space-y-4 border-l-2 border-muted">
                                    {service.subServices.map(sub => (
                                        <div key={sub.id} className="flex items-center gap-4">
                                        <Label htmlFor={`price-${sub.id}`} className="flex-1">{sub.name}</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">$</span>
                                            <Input 
                                                id={`price-${sub.id}`} 
                                                type="number" 
                                                className="w-32"
                                                value={prices[sub.id] ?? ''}
                                                onChange={e => handlePriceChange(sub.id, e.target.value)}
                                                placeholder="Precio base"
                                            />
                                        </div>
                                        </div>
                                    ))}
                                    </div>
                                </>
                                ) : service.id === '4' ? ( // SIM UNLOCK SERVICE
                                    <>
                                    <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
                                    <div className="pl-4 space-y-4 border-l-2 border-muted">
                                        <div className="flex items-end gap-4">
                                            <div className="grid gap-2 flex-1">
                                                <Label>País</Label>
                                                <Select 
                                                    value={simUnlockPriceState.countryId} 
                                                    onValueChange={countryId => setSimUnlockPriceState({ countryId, carrierId: undefined })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue>
                                                            <div className="flex items-center gap-2">
                                                                {currentCountry ? (
                                                                    <>
                                                                        <currentCountry.flag />
                                                                        <span>{currentCountry.name}</span>
                                                                    </>
                                                                ) : (
                                                                    <span>Selecciona País</span>
                                                                )}
                                                            </div>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allCountries.map(c => {
                                                            const Flag = c.flag;
                                                            return (
                                                                <SelectItem key={c.id} value={c.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Flag />
                                                                        <span>{c.name}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            )
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2 flex-1">
                                                <Label>Operadora</Label>
                                                <Select 
                                                    value={simUnlockPriceState.carrierId}
                                                    onValueChange={carrierId => setSimUnlockPriceState(s => ({ ...s, carrierId }))}
                                                    disabled={!simUnlockPriceState.countryId}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Selecciona Operadora"/></SelectTrigger>
                                                    <SelectContent>
                                                        {availableCarriers.map(c => {
                                                            const Logo = c.logo;
                                                            return (
                                                                <SelectItem key={c.id} value={c.id}>
                                                                    <div className="flex items-center gap-2 h-6">
                                                                        {Logo ? <Logo className="h-full w-auto" /> : <span>{c.name}</span>}
                                                                    </div>
                                                                </SelectItem>
                                                            )
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {simUnlockPriceState.carrierId && (
                                            <div className="flex items-center gap-4 pt-2">
                                                <Label htmlFor={`price-4-${simUnlockPriceState.carrierId}`} className="flex-1">
                                                    Precio para {allCarriers.find(c => c.id === simUnlockPriceState.carrierId)?.name}
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">$</span>
                                                    <Input
                                                        id={`price-4-${simUnlockPriceState.carrierId}`}
                                                        type="number"
                                                        className="w-32"
                                                        value={prices[`4-${simUnlockPriceState.carrierId}`] ?? ''}
                                                        onChange={e => handlePriceChange(`4-${simUnlockPriceState.carrierId}`, e.target.value)}
                                                        placeholder="Sin precio"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    </>
                                ) : (
                                <div className="flex items-center gap-4">
                                    <Label htmlFor={`price-${service.id}`} className="flex-1">{service.name}</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">$</span>
                                        <Input 
                                            id={`price-${service.id}`} 
                                            type="number" 
                                            className="w-32"
                                            value={prices[service.id] ?? ''}
                                            onChange={e => handlePriceChange(service.id, e.target.value)}
                                            placeholder={service.price === undefined ? "Sin precio" : "Precio base"}
                                        />
                                    </div>
                                </div>
                                )}
                            </div>
                            ))}
                        </div>
                        </CardContent>
                        <CardFooter className="border-t px-0 pt-6 mt-6">
                            <Button onClick={handleSaveAllChanges} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Guardar Cambios para {selectedModel.name}
                            </Button>
                        </CardFooter>
                    </div>
                    )}
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
        
        <AccordionItem value="item-2">
           <Card>
             <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
               <span className="flex-1 text-left">
                  <span className="mr-2">⚡</span>Edición de Precios en Lote
               </span>
            </AccordionTrigger>
            <AccordionContent asChild>
                <div className="p-6 pt-0">
                    <CardDescription className="mb-6">
                      Selecciona una marca, luego los modelos a los que quieres aplicar el precio, el servicio y el nuevo precio.
                    </CardDescription>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="batch-brand-select">Marca</Label>
                            <Select onValueChange={handleBatchBrandChange} value={batchBrandId}>
                                <SelectTrigger id="batch-brand-select"><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
                                <SelectContent>
                                {sortedBrands.map(brand => (
                                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                         {batchBrandId && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="grid gap-2">
                                    <Label htmlFor="batch-service-select">Servicio</Label>
                                    <Select onValueChange={setBatchServiceId} value={batchServiceId}>
                                        <SelectTrigger id="batch-service-select"><SelectValue placeholder="Selecciona un servicio" /></SelectTrigger>
                                        <SelectContent>
                                        {initialServices.flatMap(service => 
                                            service.subServices && service.subServices.length > 0
                                                ? service.subServices.map(sub => <SelectItem key={sub.id} value={sub.id}>{service.name} - {sub.name}</SelectItem>)
                                                : <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                                        )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="batch-price">Nuevo Precio ($)</Label>
                                    <Input 
                                        id="batch-price"
                                        type="number"
                                        value={batchPrice}
                                        onChange={e => setBatchPrice(e.target.value)}
                                        placeholder="Ej. 25.50"
                                    />
                                </div>
                            </div>
                             <div className="border rounded-lg max-h-72 overflow-y-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-muted/95">
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                  checked={selectedBatchModelIds.size > 0 && selectedBatchModelIds.size === batchAvailableModels.length}
                                                  onCheckedChange={(checked) => handleToggleAllModels(Boolean(checked))}
                                                  aria-label="Seleccionar todos"
                                                />
                                            </TableHead>
                                            <TableHead>Modelo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {batchAvailableModels.map(model => (
                                        <TableRow 
                                            key={model.id}
                                            className="cursor-pointer"
                                            onClick={() => handleToggleModel(model.id, !selectedBatchModelIds.has(model.id))}
                                            data-state={selectedBatchModelIds.has(model.id) ? 'selected' : ''}
                                        >
                                          <TableCell>
                                            <Checkbox
                                              checked={selectedBatchModelIds.has(model.id)}
                                              onCheckedChange={(checked) => handleToggleModel(model.id, Boolean(checked))}
                                              aria-label={`Seleccionar ${model.name}`}
                                            />
                                          </TableCell>
                                          <TableCell>{model.name}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <Button onClick={handleBatchUpdate} disabled={isBatchSubmitting || selectedBatchModelIds.size === 0}>
                                {isBatchSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Aplicar Precio a Modelos Seleccionados ({selectedBatchModelIds.size})
                            </Button>
                          </>
                         )}
                    </div>
                </div>
            </AccordionContent>
           </Card>
        </AccordionItem>
        
        <AccordionItem value="item-3">
            <Card>
                <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
                    <span className="flex-1 text-left">
                        <span className="mr-2">💱</span>Configuraciones Globales
                    </span>
                </AccordionTrigger>
                <AccordionContent asChild>
                    <div className="p-6 pt-0 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Conversión USD a ARS</CardTitle>
                                <CardDescription>
                                    Establece la tasa de conversión para mostrar precios en monedas locales.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Label>1 USD =</Label>
                                    <Input 
                                        type="number" 
                                        className="w-40"
                                        value={usdToArsRate}
                                        onChange={(e) => setUsdToArsRate(Number(e.target.value))}
                                    />
                                    <Label>ARS</Label>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveRate} disabled={isRateSaving}>
                                    {isRateSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Tasa de Cambio
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Precios en Construcción</CardTitle>
                                 <CardDescription>
                                    Esta acción eliminará todos los precios personalizados de todos los modelos. El frontend mostrará "En construcción 🚧".
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={isBatchSubmitting}>
                                            {isBatchSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Poner todos los precios en construcción
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente todas las
                                            sobrescrituras de precios para todos los modelos y servicios.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleUnderConstruction}>Continuar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </div>
                </AccordionContent>
            </Card>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
