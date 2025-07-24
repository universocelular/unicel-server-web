
"use client";

import { useState, useMemo } from "react";
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
import { Loader2, Trash } from "lucide-react";
import type { Settings, FreeServiceSetting, Brand, Model, Service } from "@/lib/db/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getApplicableServices } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { v4 as uuidv4 } from "uuid";
import { Skeleton } from "../ui/skeleton";
import { useAdminData } from "@/contexts/admin-data-context";

interface FreeModeClientProps {
  initialSettings: Settings;
}

export function FreeModeClient({ 
  initialSettings, 
}: FreeModeClientProps) {
  const { brands: initialBrands, models: initialModels, services: initialServices } = useAdminData();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>(initialSettings);

  // Form state for adding a new free service
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>();
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>();
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [selectedSubServiceId, setSelectedSubServiceId] = useState<string | undefined>();

  const handleActiveChange = async (isActive: boolean) => {
    setIsSaving(true);
    try {
        await updateSettings({ isFreeModeActive: isActive });
        setSettings(prev => ({ ...prev, isFreeModeActive: isActive }));
        toast({
            title: "Éxito",
            description: `Modo gratis ${isActive ? 'activado' : 'desactivado'}.`,
        });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado." });
        // Revert UI on error
        setSettings(prev => ({ ...prev, isFreeModeActive: !isActive }));
    } finally {
        setIsSaving(false);
    }
  };

  const handleAddFreeService = async () => {
    if (!selectedModelId || !selectedServiceId) {
        toast({ variant: "destructive", title: "Error", description: "Debes seleccionar un modelo y un servicio." });
        return;
    }
    const model = initialModels.find(m => m.id === selectedModelId);
    const service = initialServices.find(s => s.id === selectedServiceId);
    
    if (!model || !service) return;

    let serviceName = service.name;
    if (selectedSubServiceId) {
        const subService = service.subServices?.find(ss => ss.id === selectedSubServiceId);
        if (subService) {
            serviceName = `${service.name} - ${subService.name}`;
        }
    }
    
    const newFreeService: FreeServiceSetting = {
      id: uuidv4(),
      modelId: selectedModelId,
      serviceId: selectedServiceId,
      subServiceId: selectedSubServiceId,
      modelName: `${model.brand} ${model.name}`,
      serviceName: serviceName,
    };

    const updatedFreeServices = [...(settings.freeServices || []), newFreeService];
    
    setIsSaving(true);
    try {
      await updateSettings({ freeServices: updatedFreeServices });
      setSettings(prev => ({ ...prev, freeServices: updatedFreeServices }));
      toast({ title: "Éxito", description: "Servicio gratuito añadido." });
      // Reset form
      setSelectedBrandId(undefined);
      setSelectedModelId(undefined);
      setSelectedServiceId(undefined);
      setSelectedSubServiceId(undefined);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo añadir el servicio gratuito." });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteFreeService = async (id: string) => {
    const updatedFreeServices = (settings.freeServices || []).filter(fs => fs.id !== id);
    setIsSaving(true);
    try {
      await updateSettings({ freeServices: updatedFreeServices });
      setSettings(prev => ({ ...prev, freeServices: updatedFreeServices }));
      toast({ title: "Éxito", description: "Servicio gratuito eliminado." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el servicio gratuito." });
    } finally {
        setIsSaving(false);
    }
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
    if (!selectedBrandId) return [];
    const brandName = initialBrands.find(b => b.id === selectedBrandId)?.name;
    return initialModels.filter(m => m.brand === brandName);
  }, [selectedBrandId, initialBrands, initialModels]);

  const selectedModel = useMemo(() => {
      return initialModels.find(m => m.id === selectedModelId);
  }, [selectedModelId, initialModels]);

  const applicableServices = useMemo(() => {
    if (!selectedModel) return [];
    return getApplicableServices(selectedModel, initialServices);
  }, [selectedModel, initialServices]);
  
  const selectedService = useMemo(() => {
      return initialServices.find(s => s.id === selectedServiceId);
  }, [selectedServiceId, initialServices]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4">
        <h1 className="font-semibold text-3xl">🎁 Modo Gratis</h1>
        <Card>
          <CardHeader>
            <CardTitle>🌍 Configuración Global</CardTitle>
            <CardDescription>
              Activa esta opción para permitir que los servicios configurados como gratuitos sean accesibles sin costo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4 rounded-md border p-4">
               <Switch
                checked={settings.isFreeModeActive || false}
                onCheckedChange={handleActiveChange}
                aria-label="Activar Modo Gratis"
                disabled={isSaving}
              />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Activar Modo Gratis
                </p>
                <p className="text-sm text-muted-foreground">
                  Permite el acceso gratuito a los servicios seleccionados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>➕ Añadir Servicio Gratuito</CardTitle>
                <CardDescription>
                    Selecciona un modelo y servicio para ofrecerlo gratuitamente cuando el Modo Gratis esté activo.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="grid gap-2">
                        <Label>Marca</Label>
                        <Select value={selectedBrandId} onValueChange={val => { setSelectedBrandId(val); setSelectedModelId(undefined); setSelectedServiceId(undefined); setSelectedSubServiceId(undefined); }}>
                            <SelectTrigger><SelectValue placeholder="Selecciona marca..."/></SelectTrigger>
                            <SelectContent>
                                {sortedBrands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label>Modelo</Label>
                        <Select value={selectedModelId} onValueChange={val => { setSelectedModelId(val); setSelectedServiceId(undefined); setSelectedSubServiceId(undefined); }} disabled={!selectedBrandId}>
                            <SelectTrigger><SelectValue placeholder="Selecciona modelo..."/></SelectTrigger>
                            <SelectContent>
                                {availableModels.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label>Servicio</Label>
                        <Select value={selectedServiceId} onValueChange={val => { setSelectedServiceId(val); setSelectedSubServiceId(undefined); }} disabled={!selectedModelId}>
                            <SelectTrigger><SelectValue placeholder="Selecciona servicio..."/></SelectTrigger>
                            <SelectContent>
                                {applicableServices.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label>Sub-servicio (si aplica)</Label>
                        <Select value={selectedSubServiceId} onValueChange={setSelectedSubServiceId} disabled={!selectedService?.subServices || selectedService.subServices.length === 0}>
                            <SelectTrigger><SelectValue placeholder="Selecciona sub-servicio..."/></SelectTrigger>
                            <SelectContent>
                                {selectedService?.subServices?.map(ss => <SelectItem key={ss.id} value={ss.id}>{ss.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleAddFreeService} disabled={isSaving || !selectedModelId || !selectedServiceId}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Añadir a la lista de gratuitos
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>📋 Servicios Gratuitos Configurados</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Modelo</TableHead>
                                <TableHead>Servicio</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(settings.freeServices || []).length > 0 ? (
                                settings.freeServices?.map(fs => (
                                    <TableRow key={fs.id}>
                                        <TableCell className="font-medium">{fs.modelName}</TableCell>
                                        <TableCell>{fs.serviceName}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteFreeService(fs.id)} disabled={isSaving}>
                                                <Trash className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No hay servicios configurados como gratuitos.
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
