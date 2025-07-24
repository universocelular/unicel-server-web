
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addBrand, updateBrand, deleteBrand } from "@/lib/actions/brands";
import { addModel, updateModel, deleteModel } from "@/lib/actions/models";
import type { Brand, Model } from "@/lib/db/types";
import { PlusCircle, MoreHorizontal, Trash, Edit, Loader2, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { useAdminData } from "@/contexts/admin-data-context";

export function BrandsAndModels() {
  const { brands: initialBrands, models: initialModels, refreshData } = useAdminData();
  const { toast } = useToast();
  
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  
  // States for the new model form
  const [newModelName, setNewModelName] = useState('');
  const [newModelBrandId, setNewModelBrandId] = useState('');
  const [newModelCategory, setNewModelCategory] = useState<Model['category']>('Phone');

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


  const handleBrandModalOpenChange = (isOpen: boolean) => {
    if (isSubmitting) return;
    setBrandModalOpen(isOpen);
    if (!isOpen) setCurrentBrand(null);
  };

  const handleModelModalOpenChange = (isOpen: boolean) => {
    if (isSubmitting) return;
    setModelModalOpen(isOpen);
    if (!isOpen) {
      setCurrentModel(null);
      // Reset new model form states
      setNewModelName('');
      setNewModelBrandId('');
      setNewModelCategory('Phone');
    }
  };

  // Brand handlers
  const handleAddOrUpdateBrand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    try {
      if (currentBrand) {
        await updateBrand(currentBrand.id, name);
        toast({ title: "Éxito", description: "Marca actualizada correctamente." });
      } else {
        await addBrand(name);
        toast({ title: "Éxito", description: "Marca añadida correctamente." });
      }
      await refreshData();
      handleBrandModalOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Algo salió mal." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async (brandToDelete: Brand) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la marca "${brandToDelete.name}" y todos sus modelos? Esta acción no se puede deshacer.`)) {
        return;
    }
    try {
      await deleteBrand(brandToDelete.id);
      toast({ title: "Éxito", description: `Marca "${brandToDelete.name}" y sus modelos eliminados.` });
      await refreshData();
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Algo salió mal al eliminar la marca." });
    }
  };

  // Model handlers
  const handleAddOrUpdateModel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const category = formData.get("category") as Model['category'];
    const brandId = formData.get("brand") as string;
    const brandName = initialBrands.find(b => b.id === brandId)?.name;

    if (!brandName) {
        toast({ variant: "destructive", title: "Error", description: "Por favor selecciona una marca." });
        setIsSubmitting(false);
        return;
    }

    try {
        if (currentModel) {
            await updateModel(currentModel.id, { name, brand: brandName, category });
            toast({ title: "Éxito", description: "Modelo actualizado correctamente." });
        } else {
            await addModel({ name, brand: brandName, category });
            toast({ title: "Éxito", description: "Modelo añadido correctamente." });
        }
        await refreshData();
        handleModelModalOpenChange(false);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Algo salió mal." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteModel = async (id: string) => {
    try {
        await deleteModel(id);
        toast({ title: "Éxito", description: "Modelo eliminado correctamente." });
        await refreshData();
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "Algo salió mal." });
    }
  };

  const filteredModels = initialModels.filter(model =>
    `${model.brand} ${model.name}`.toLowerCase().includes(modelSearch.toLowerCase())
  );
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Brand Modal */}
        <Dialog open={brandModalOpen} onOpenChange={handleBrandModalOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{currentBrand ? "Editar Marca" : "Añadir Marca"}</DialogTitle>
                </DialogHeader>
                <form id="brand-form" onSubmit={handleAddOrUpdateBrand}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" defaultValue={currentBrand?.name} required />
                    </div>
                    <DialogFooter>
                        <Button type="submit" form="brand-form" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Model Modal */}
        <Dialog open={modelModalOpen} onOpenChange={handleModelModalOpenChange}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>{currentModel ? "Editar Modelo" : `Añadir Nuevo Modelo`}</DialogTitle>
            </DialogHeader>
            <form id="model-form" onSubmit={handleAddOrUpdateModel}>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre del Modelo</Label>
                        <Input id="name" name="name" defaultValue={currentModel?.name} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Select name="brand" defaultValue={currentModel ? initialBrands.find(b => b.name === currentModel.brand)?.id : undefined} required>
                            <SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
                            <SelectContent>
                                {sortedBrands.map(brand => (
                                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select name="category" defaultValue={currentModel?.category || "Phone"} required>
                            <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Phone">Teléfono</SelectItem>
                                <SelectItem value="Mac">Mac</SelectItem>
                                <SelectItem value="iPad">iPad</SelectItem>
                                <SelectItem value="Watch">Watch</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" form="model-form" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar
                    </Button>
                </DialogFooter>
            </form>
            </DialogContent>
        </Dialog>

      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">🏷️ Marcas y Modelos</h1>
      </div>

      <Accordion type="multiple" defaultValue={["item-1"]} className="w-full space-y-4">
        <AccordionItem value="item-1">
          <Card>
            <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
                <span className="flex-1 text-left">
                    <span className="mr-2">🗃️</span>Gestión de Marcas
                </span>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent>
                <div className="flex justify-end mb-4">
                    <Button size="sm" onClick={() => { setCurrentBrand(null); setBrandModalOpen(true); }}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Añadir Marca
                    </Button>
                </div>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre de la Marca</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialBrands.map((brand) => (
                                <TableRow key={brand.id}>
                                    <TableCell className="font-medium">{brand.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => {setCurrentBrand(brand); setBrandModalOpen(true)}}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteBrand(brand)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="item-2">
            <Card>
                <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
                    <span className="flex-1 text-left">
                        <span className="mr-2">📱</span>Gestión de Modelos
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar modelo o marca..." 
                                className="pl-10"
                                value={modelSearch}
                                onChange={(e) => setModelSearch(e.target.value)}
                            />
                        </div>
                        <Button size="sm" onClick={() => { setCurrentModel(null); setModelModalOpen(true); }}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Añadir Modelo
                        </Button>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre del Modelo</TableHead>
                                    <TableHead>Marca</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredModels.map((model) => (
                                    <TableRow key={model.id}>
                                        <TableCell className="font-medium">{model.name}</TableCell>
                                        <TableCell>{model.brand}</TableCell>
                                        <TableCell>{model.category}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => {setCurrentModel(model); setModelModalOpen(true)}}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteModel(model.id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredModels.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No se encontraron modelos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    </CardContent>
                </AccordionContent>
            </Card>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
