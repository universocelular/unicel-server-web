
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreHorizontal, Trash, Edit, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Coupon, Brand, Model, Service } from "@/lib/db/types";
import { addCoupon, updateCoupon, deleteCoupon } from "@/lib/actions/coupons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getApplicableServices } from "@/lib/utils";
import { useAdminData } from "@/contexts/admin-data-context";


interface CouponsClientProps {
  initialCoupons: Coupon[];
}

export function CouponsClient({ initialCoupons }: CouponsClientProps) {
  const { brands: initialBrands, models: initialModels, services: initialServices } = useAdminData();
  const { toast } = useToast();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [open, setOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for adding/editing a coupon's scope
  const [selectedBrandId, setSelectedBrandId] = useState<string | "clear">("clear");
  const [selectedModelId, setSelectedModelId] = useState<string | "clear">("clear");
  const [selectedServiceId, setSelectedServiceId] = useState<string | "clear">("clear");
  const [selectedSubServiceId, setSelectedSubServiceId] = useState<string | "clear">("clear");

  useEffect(() => {
    setCoupons(initialCoupons);
  }, [initialCoupons]);

  const resetForm = () => {
    setCurrentCoupon(null);
    setSelectedBrandId("clear");
    setSelectedModelId("clear");
    setSelectedServiceId("clear");
    setSelectedSubServiceId("clear");
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    
    const brand = initialBrands.find(b => b.name === coupon.brandName);
    const model = initialModels.find(m => m.id === coupon.modelId);
    
    setSelectedBrandId(brand?.id || "clear");

    // Needs a tick to allow availableModels to update
    setTimeout(() => {
      setSelectedModelId(model?.id || "clear");
    }, 0);
    
    setSelectedServiceId(coupon.serviceId || "clear");
    setSelectedSubServiceId(coupon.subServiceId || "clear");

    setOpen(true);
  };

  const handleNew = () => {
      resetForm();
      setOpen(true);
  }

  const handleAddOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const code = (formData.get("code") as string).toUpperCase();
    const discount = Number(formData.get("discount"));
    
    const brand = initialBrands.find(b => b.id === selectedBrandId);
    const model = initialModels.find(m => m.id === selectedModelId);
    
    const couponData: Partial<Coupon> = {
        code,
        discountPercentage: discount,
        brandName: brand?.name,
        modelId: model?.id,
        serviceId: selectedServiceId === "clear" ? undefined : selectedServiceId,
        subServiceId: selectedSubServiceId === "clear" ? undefined : selectedSubServiceId,
    };

    try {
      if (currentCoupon) {
        // Update
        await updateCoupon(currentCoupon.id, couponData);
        toast({ title: "Éxito", description: "Cupón actualizado." });
      } else {
        // Add
        await addCoupon({ ...couponData, isActive: true } as Omit<Coupon, 'id'>);
        toast({ title: "Éxito", description: "Cupón añadido." });
      }
      router.refresh(); // This re-fetches data and triggers the useEffect
      handleOpenChange(false);
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Algo salió mal." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
        await deleteCoupon(id);
        toast({ title: "Éxito", description: "Cupón eliminado." });
        router.refresh();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Algo salió mal al eliminar." });
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
        await updateCoupon(coupon.id, { isActive: !coupon.isActive });
        toast({ title: "Éxito", description: `Cupón ${!coupon.isActive ? 'activado' : 'desactivado'}.` });
        router.refresh();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado." });
    }
  };

  const getCouponDisplayName = (coupon: Coupon): React.ReactNode => {
    const model = coupon.modelId ? initialModels.find(m => m.id === coupon.modelId) : null;
    const service = coupon.serviceId ? initialServices.find(s => s.id === coupon.serviceId) : null;
    const subService = coupon.subServiceId && service ? service.subServices?.find(ss => ss.id === coupon.subServiceId) : null;

    let scopeComponent: React.ReactNode = null;
    if (model) {
        scopeComponent = <i>{`${model.brand} ${model.name}`}</i>;
    } else if (coupon.brandName) {
        scopeComponent = <i>{`Todos los ${coupon.brandName}`}</i>;
    }

    let serviceComponent: React.ReactNode = null;
    if (subService && service) {
        serviceComponent = <b>{`${service.name} - ${subService.name}`}</b>;
    } else if (service) {
        serviceComponent = <b>{service.name}</b>;
    }

    if (!scopeComponent && !serviceComponent) return 'Global';

    if (scopeComponent && !serviceComponent) {
        if (model) {
            return <>Todos los servicios para {scopeComponent}</>;
        }
        return scopeComponent;
    }

    if (!scopeComponent && serviceComponent) {
        return <>Todas las marcas y modelos para {serviceComponent}</>;
    }
    
    if (scopeComponent && serviceComponent) {
      return <>{scopeComponent} - {serviceComponent}</>;
    }
    
    return 'Global'; // Fallback
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
    if (selectedModel) {
        return getApplicableServices(selectedModel, initialServices);
    }
    if (selectedBrandId !== 'clear') {
        return initialServices;
    }
    return [];
  }, [selectedModel, selectedBrandId, initialServices]);
  
  const selectedService = useMemo(() => {
      if (!selectedServiceId || selectedServiceId === "clear") return null;
      return initialServices.find(s => s.id === selectedServiceId);
  }, [selectedServiceId, initialServices]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">🎟️ Cupones de Descuento</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto gap-1" onClick={handleNew}>
              <PlusCircle className="h-4 w-4" />
              Añadir Cupón
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{currentCoupon ? "Editar Cupón" : "Añadir Cupón"}</DialogTitle>
              <DialogDescription>
                {currentCoupon ? "Actualiza los detalles del cupón." : "Crea un nuevo cupón de descuento. Déjalo en blanco para aplicar a todo."}
              </DialogDescription>
            </DialogHeader>
            <form id="coupon-form" onSubmit={handleAddOrUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="code">Código</Label>
                      <Input id="code" name="code" defaultValue={currentCoupon?.code} className="uppercase" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="discount">Descuento (%)</Label>
                      <Input id="discount" name="discount" type="number" defaultValue={currentCoupon?.discountPercentage} required min="1" max="100"/>
                    </div>
                </div>
                 <p className="text-sm text-muted-foreground pt-4">
                    Opcional: Define a qué se aplicará este cupón. Puedes dejar campos en blanco para hacerlo más general.
                </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="grid gap-2">
                           <Label>Marca</Label>
                           <Select value={selectedBrandId} onValueChange={val => { setSelectedBrandId(val); setSelectedModelId("clear"); setSelectedServiceId("clear"); setSelectedSubServiceId("clear"); }}>
                               <SelectTrigger><SelectValue placeholder="Todas las marcas"/></SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="clear">Todas las marcas</SelectItem>
                                   {sortedBrands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                               </SelectContent>
                           </Select>
                       </div>
                       <div className="grid gap-2">
                           <Label>Modelo</Label>
                           <Select value={selectedModelId} onValueChange={val => { setSelectedModelId(val); setSelectedServiceId("clear"); setSelectedSubServiceId("clear"); }} disabled={!selectedBrandId || selectedBrandId === "clear"}>
                               <SelectTrigger><SelectValue placeholder="Todos los modelos"/></SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="clear">Todos los modelos</SelectItem>
                                   {availableModels.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                               </SelectContent>
                           </Select>
                       </div>
                        <div className="grid gap-2">
                           <Label>Servicio</Label>
                           <Select value={selectedServiceId} onValueChange={val => { setSelectedServiceId(val); setSelectedSubServiceId("clear"); }} disabled={applicableServices.length === 0}>
                               <SelectTrigger><SelectValue placeholder="Todos los servicios"/></SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="clear">Todos los servicios</SelectItem>
                                   {applicableServices.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                               </SelectContent>
                           </Select>
                       </div>
                        <div className="grid gap-2">
                           <Label>Sub-servicio</Label>
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
                <Button type="submit" form="coupon-form" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Aplica a</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-medium">{coupon.code}</TableCell>
                <TableCell>{coupon.discountPercentage}%</TableCell>
                <TableCell>{getCouponDisplayName(coupon)}</TableCell>
                <TableCell>
                  <Button variant={coupon.isActive ? "cta" : "destructive"} size="sm" onClick={() => toggleActive(coupon)}>
                    {coupon.isActive ? "Activo" : "Inactivo"}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => handleEdit(coupon)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(coupon.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
