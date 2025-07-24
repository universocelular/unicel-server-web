
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { updateSettings } from "@/lib/actions/settings";
import { Loader2, Trash, Edit, PlusCircle } from "lucide-react";
import type { Settings, DiscountSetting, Brand, Model, Service } from "@/lib/db/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getApplicableServices } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { v4 as uuidv4 } from "uuid";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAdminData } from "@/contexts/admin-data-context";

interface DiscountModeClientProps {
  initialSettings: Settings;
}

export function DiscountModeClient({ 
  initialSettings, 
}: DiscountModeClientProps) {
  const { brands: initialBrands, models: initialModels, services: initialServices } = useAdminData();
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<DiscountSetting | null>(null);

  // Form state for adding/editing a discount
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [selectedBrandId, setSelectedBrandId] = useState<string | "clear">("clear");
  const [selectedModelId, setSelectedModelId] = useState<string | "clear">("clear");
  const [selectedServiceId, setSelectedServiceId] = useState<string | "clear">("clear");
  const [selectedSubServiceId, setSelectedSubServiceId] = useState<string | "clear">("clear");


  const handleActiveChange = async (isActive: boolean) => {
    setIsSaving(true);
    try {
        const updatedSettings = await updateSettings({ isDiscountModeActive: isActive });
        setSettings(prev => ({ ...prev, isDiscountModeActive: isActive }));
        toast({
            title: "Éxito",
            description: `Modo descuento ${isActive ? 'activado' : 'desactivado'}.`,
        });
        router.refresh();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado." });
        setSettings(prev => ({ ...prev, isDiscountModeActive: !isActive }));
    } finally {
        setIsSaving(false);
    }
  };
  
  const resetForm = () => {
    setSelectedBrandId("clear");
    setSelectedModelId("clear");
    setSelectedServiceId("clear");
    setSelectedSubServiceId("clear");
    setDiscountPercentage(10);
    setCurrentDiscount(null);
  };
  
  const handleOpenModal = (discount: DiscountSetting | null) => {
    if (discount) {
        setCurrentDiscount(discount);
        setDiscountPercentage(discount.discountPercentage);
        
        const brand = initialBrands.find(b => b.name === discount.brandName);
        setSelectedBrandId(brand?.id || "clear");

        // Needs a tick to allow availableModels to update
        setTimeout(() => {
            if (discount.modelName) {
                const model = initialModels.find(m => m.name === discount.modelName && m.brand === discount.brandName);
                setSelectedModelId(model?.id || "clear");
            } else {
                setSelectedModelId("clear");
            }
        }, 0);
        
        setSelectedServiceId(discount.serviceId || "clear");
        setSelectedSubServiceId(discount.subServiceId || "clear");
    } else {
        resetForm();
    }
    setModalOpen(true);
  };

  const handleModalOpenChange = (isOpen: boolean) => {
    setModalOpen(isOpen);
    if (!isOpen) {
        resetForm();
    }
  };


  const handleAddOrUpdateDiscount = async () => {
    const brand = initialBrands.find(b => b.id === selectedBrandId);
    const model = initialModels.find(m => m.id === selectedModelId);
    
    const newDiscount: Omit<DiscountSetting, 'id' | 'isActive'> = {
        discountPercentage,
        brandName: brand?.name,
        modelName: model?.name,
        serviceId: selectedServiceId === "clear" ? undefined : selectedServiceId,
        subServiceId: selectedSubServiceId === "clear" ? undefined : selectedSubServiceId,
    };
    
    let updatedDiscounts: DiscountSetting[];

    if (currentDiscount) {
        // Update
        updatedDiscounts = (settings.discounts || []).map(d => 
            d.id === currentDiscount.id ? { ...currentDiscount, ...newDiscount } : d
        );
    } else {
        // Add
        updatedDiscounts = [...(settings.discounts || []), { ...newDiscount, id: uuidv4(), isActive: true }];
    }
    
    setIsSaving(true);
    try {
      const updatedSettingsResult = await updateSettings({ discounts: updatedDiscounts });
      setSettings(updatedSettingsResult);
      toast({ title: "Éxito", description: `Descuento ${currentDiscount ? 'actualizado' : 'añadido'}.` });
      handleModalOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el descuento." });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    const updatedDiscounts = (settings.discounts || []).filter(d => d.id !== id);
    setIsSaving(true);
    try {
      const updatedSettingsResult = await updateSettings({ discounts: updatedDiscounts });
      setSettings(updatedSettingsResult);
      toast({ title: "Éxito", description: "Descuento eliminado." });
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar." });
    } finally {
        setIsSaving(false);
    }
  };

  const handleToggleDiscountActive = async (id: string, currentStatus: boolean) => {
    const updatedDiscounts = (settings.discounts || []).map(d => 
        d.id === id ? { ...d, isActive: !currentStatus } : d
    );
     setIsSaving(true);
    try {
      const updatedSettingsResult = await updateSettings({ discounts: updatedDiscounts });
      setSettings(updatedSettingsResult);
      toast({ title: "Éxito", description: "Estado del descuento actualizado." });
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado." });
    } finally {
        setIsSaving(false);
    }
  }

  const getDiscountDisplayName = (discount: DiscountSetting): string => {
    if (discount.subServiceId) {
        const service = initialServices.find(s => s.id === discount.serviceId);
        const subService = service?.subServices?.find(ss => ss.id === discount.subServiceId);
        return `${service?.name} - ${subService?.name}`;
    }
    if (discount.serviceId) {
        return initialServices.find(s => s.id === discount.serviceId)?.name || "Servicio desconocido";
    }
    if (discount.modelName && discount.brandName) {
        return `Todos los servicios para ${discount.brandName} ${discount.modelName}`;
    }
    if (discount.brandName) {
        return `Todos los modelos y servicios para ${discount.brandName}`;
    }
    return 'Global';
  };
  
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
  
  const availableModels = useMemo(() => {
    if (!selectedBrandId || selectedBrandId === "clear") return [];
    const brandName = initialBrands.find(b => b.id === selectedBrandId)?.name;
    return initialModels.filter(m => m.brand === brandName);
  }, [selectedBrandId, initialBrands, initialModels]);

  const selectedModel = useMemo(() => {
      if (!selectedModelId || selectedModelId === "clear") return null;
      return initialModels.find(m => m.id === selectedModelId);
  }, [selectedModelId, initialModels]);

  const applicableServices = useMemo(() => {
    if (!selectedModel) return [];
    return getApplicableServices(selectedModel, initialServices);
  }, [selectedModel, initialServices]);
  
  const selectedService = useMemo(() => {
      if (!selectedServiceId || selectedServiceId === "clear") return null;
      return initialServices.find(s => s.id === selectedServiceId);
  }, [selectedServiceId, initialServices]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Dialog open={modalOpen} onOpenChange={handleModalOpenChange}>
            <DialogContent>
                <DialogHeader>
                  <DialogTitle>{currentDiscount ? "Editar Descuento" : "Añadir Descuento"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label>Porcentaje de Descuento (%)</Label>
                        <Input 
                            type="number"
                            value={discountPercentage}
                            onChange={e => setDiscountPercentage(Number(e.target.value))}
                            min="1"
                            max="100"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Define a qué se aplicará este descuento. Puedes dejar campos en blanco para hacerlo más general. 
                        Ej: Si solo eliges una marca, aplicará a todos sus modelos y servicios.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="grid gap-2">
                           <Label>Marca (opcional)</Label>
                           <Select value={selectedBrandId} onValueChange={val => { setSelectedBrandId(val); setSelectedModelId("clear"); setSelectedServiceId("clear"); setSelectedSubServiceId("clear"); }}>
                               <SelectTrigger><SelectValue placeholder="Todas las marcas"/></SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="clear">Todas las marcas</SelectItem>
                                   {sortedBrands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                               </SelectContent>
                           </Select>
                       </div>
                        <div className="grid gap-2">
                           <Label>Modelo (opcional)</Label>
                           <Select value={selectedModelId} onValueChange={val => { setSelectedModelId(val); setSelectedServiceId("clear"); setSelectedSubServiceId("clear"); }} disabled={!selectedBrandId || selectedBrandId === "clear"}>
                               <SelectTrigger><SelectValue placeholder="Todos los modelos"/></SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="clear">Todos los modelos</SelectItem>
                                   {availableModels.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                               </SelectContent>
                           </Select>
                       </div>
                        <div className="grid gap-2">
                           <Label>Servicio (opcional)</Label>
                           <Select value={selectedServiceId} onValueChange={val => { setSelectedServiceId(val); setSelectedSubServiceId("clear"); }} disabled={!selectedModelId || selectedModelId === "clear"}>
                               <SelectTrigger><SelectValue placeholder="Todos los servicios"/></SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="clear">Todos los servicios</SelectItem>
                                   {applicableServices.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                               </SelectContent>
                           </Select>
                       </div>
                        <div className="grid gap-2">
                           <Label>Sub-servicio (opcional)</Label>
                           <Select value={selectedSubServiceId} onValueChange={val => setSelectedSubServiceId(val)} disabled={!selectedService?.subServices || selectedService.subServices.length === 0}>
                               <SelectTrigger><SelectValue placeholder="Todos los sub-servicios"/></SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="clear">Todos los sub-servicios</SelectItem>
                                   {selectedService?.subServices?.map(ss => <SelectItem key={ss.id} value={ss.id}>{ss.name}</SelectItem>)}
                               </SelectContent>
                           </Select>
                       </div>
                   </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddOrUpdateDiscount} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
      </Dialog>
      <div className="grid gap-4">
        <h1 className="font-semibold text-3xl">💯 Modo Descuento</h1>
        <Card>
          <CardHeader>
            <CardTitle>🌍 Configuración Global</CardTitle>
            <CardDescription>
              Activa o desactiva la aplicación de todas las reglas de descuento. Estas no se aplicarán si un cupón está en uso.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center space-x-4 rounded-md border p-4">
              <Switch
                checked={settings.isDiscountModeActive || false}
                onCheckedChange={handleActiveChange}
                aria-label="Activar Modo Descuento"
                disabled={isSaving}
              />
              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium leading-none">
                  Modo Descuento
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>⚖️ Reglas de Descuento</CardTitle>
                <CardDescription>
                    Gestiona las reglas de descuento específicas. Las reglas más específicas (ej. por sub-servicio) tienen prioridad sobre las generales (ej. por marca).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end mb-4">
                   <Button size="sm" onClick={() => handleOpenModal(null)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Añadir Regla
                    </Button>
                </div>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Aplica a</TableHead>
                                <TableHead>Descuento</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(settings.discounts || []).length > 0 ? (
                                settings.discounts?.map(d => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-medium">{getDiscountDisplayName(d)}</TableCell>
                                        <TableCell>{d.discountPercentage}%</TableCell>
                                        <TableCell>
                                           <Button 
                                                variant={d.isActive ? 'cta' : 'destructive'} 
                                                size="sm"
                                                onClick={() => handleToggleDiscountActive(d.id, d.isActive)}
                                                disabled={isSaving}
                                            >
                                                {d.isActive ? "Activo" : "Inactivo"}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(d)} disabled={isSaving}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDiscount(d.id)} disabled={isSaving}>
                                                <Trash className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No hay reglas de descuento configuradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
