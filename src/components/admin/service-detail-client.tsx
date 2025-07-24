
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateService } from "@/lib/actions/services";
import type { Service, SubService } from "@/lib/db/types";
import { PlusCircle, MoreHorizontal, Trash, Edit, ArrowLeft, Smile } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import EmojiPicker, { type EmojiClickData, Categories } from "emoji-picker-react";

interface ServiceDetailClientProps {
    initialService: Service;
}

export function ServiceDetailClient({ initialService }: ServiceDetailClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [service, setService] = useState<Service | null>(initialService);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSubService, setCurrentSubService] = useState<SubService | null>(null);
  const [emoji, setEmoji] = useState<string | undefined>(undefined);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  
  const handleOpenModal = (subService: SubService | null) => {
    setCurrentSubService(subService);
    setEmoji(subService?.emoji);
    setModalOpen(true);
  };

  const handleAddOrUpdateSubService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!service) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const emojiValue = emoji;

    let updatedSubServices: SubService[] = [...(service.subServices || [])];

    if (currentSubService) {
      // Update existing sub-service
      updatedSubServices = updatedSubServices.map(sub => 
        sub.id === currentSubService.id ? { ...sub, name, price, emoji: emojiValue } : sub
      );
    } else {
      // Add new sub-service
      const newSubService: SubService = {
        id: `${service.id}-${Date.now()}`, // Simple unique ID generation
        name,
        description: '', // Description is no longer part of the form
        price,
        emoji: emojiValue,
      };
      updatedSubServices.push(newSubService);
    }

    try {
      const updatedService = await updateService(service.id, { subServices: updatedSubServices });
      if (updatedService) {
        setService(updatedService); // Update local state with the returned service
      }
      toast({ title: "Éxito", description: `Sub-servicio ${currentSubService ? 'actualizado' : 'añadido'} correctamente.` });
      setModalOpen(false);
      setCurrentSubService(null);
      setEmoji(undefined);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Algo salió mal." });
    }
  };

  const handleDeleteSubService = async (subServiceId: string) => {
    if (!service) return;
    const updatedSubServices = (service.subServices || []).filter(sub => sub.id !== subServiceId);
    try {
        const updatedService = await updateService(service.id, { subServices: updatedSubServices });
        if (updatedService) {
            setService(updatedService);
        }
        toast({ title: "Éxito", description: "Sub-servicio eliminado correctamente." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Algo salió mal." });
    }
  };

  const handleModalOpenChange = (isOpen: boolean) => {
    setModalOpen(isOpen);
    if (!isOpen) {
      setCurrentSubService(null);
      setEmoji(undefined);
    }
  };

  if (!service) {
    return null; // or a not found component
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
             <Link href="/admin/services">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                 <h1 className="font-semibold text-3xl">{service.name}</h1>
                 <p className="text-muted-foreground">{service.description}</p>
            </div>
        </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Sub-servicios</CardTitle>
                <CardDescription>Gestiona los sub-servicios para {service.name}.</CardDescription>
            </div>
            <Dialog open={modalOpen} onOpenChange={handleModalOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1" onClick={() => handleOpenModal(null)}>
                  <PlusCircle className="h-4 w-4" />
                  Añadir Sub-servicio
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                  <DialogTitle>{currentSubService ? "Editar Sub-servicio" : "Añadir Sub-servicio"}</DialogTitle>
                  <DialogDescription>
                      {currentSubService ? "Actualiza los detalles de este sub-servicio." : "Añade un nuevo sub-servicio."}
                  </DialogDescription>
                </DialogHeader>
                <form id="subservice-form" onSubmit={handleAddOrUpdateSubService}>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nombre</Label>
                        <Input id="name" name="name" defaultValue={currentSubService?.name} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Precio ($)</Label>
                        <Input id="price" name="price" type="number" step="0.01" defaultValue={currentSubService?.price} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                         <Label className="text-right">Emoji</Label>
                         <div className="col-span-3">
                             <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                                 <PopoverTrigger asChild>
                                     <Button variant="outline" className="w-full justify-start font-normal">
                                         {emoji ? (
                                             <span className="text-xl mr-2">{emoji}</span>
                                         ) : (
                                             <Smile className="mr-2 h-4 w-4" />
                                         )}
                                         {emoji ? "Cambiar" : "Seleccionar emoji"}
                                     </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-auto p-0" align="start">
                                     <EmojiPicker
                                         onEmojiClick={(emojiData: EmojiClickData) => {
                                             setEmoji(emojiData.emoji);
                                             setEmojiPickerOpen(false);
                                         }}
                                         searchPlaceholder="¿Qué buscas?"
                                         previewConfig={{ showPreview: false }}
                                         categories={[
                                             { category: Categories.SUGGESTED, name: 'Sugeridos' },
                                             { category: Categories.SMILEYS_PEOPLE, name: 'Emoticonos y personas' },
                                             { category: Categories.ANIMALS_NATURE, name: 'Animales y naturaleza' },
                                             { category: Categories.FOOD_DRINK, name: 'Comida y bebida' },
                                             { category: Categories.TRAVEL_PLACES, name: 'Viajes y lugares' },
                                             { category: Categories.ACTIVITIES, name: 'Actividades' },
                                             { category: Categories.OBJECTS, name: 'Objetos' },
                                             { category: Categories.SYMBOLS, name: 'Símbolos' },
                                             { category: Categories.FLAGS, name: 'Banderas' },
                                         ]}
                                     />
                                 </PopoverContent>
                             </Popover>
                         </div>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="submit" form="subservice-form">Guardar cambios</Button>
                  </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
            <div className="border shadow-sm rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(service.subServices || []).map((sub) => (
                    <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {sub.emoji && <span className="mr-2 text-lg">{sub.emoji}</span>}
                          {sub.name}
                        </TableCell>
                        <TableCell>${sub.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleOpenModal(sub)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteSubService(sub.id)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                    {(service.subServices || []).length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                No se encontraron sub-servicios. Haz clic en "Añadir Sub-servicio" para crear uno.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
