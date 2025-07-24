"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import EmojiPicker, { type EmojiClickData, Categories } from "emoji-picker-react";

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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addService, updateService, deleteService, uploadImageAndGetURL } from "@/lib/actions/services";
import type { Service } from "@/lib/db/types";
import { PlusCircle, MoreHorizontal, Trash, Edit, ExternalLink, Loader2, UploadCloud, Smile } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";

const serviceSchema = z.object({
    name: z.string().min(1, "El nombre es requerido."),
    description: z.string().optional(),
    price: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
      z.number({ invalid_type_error: "Debe ser un número." }).optional()
    ),
    iconSvg: z.string().optional(),
    emoji: z.string().optional(),
    imageUrl: z.string().optional(),
    dataAiHint: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServicesClientProps {
    initialServices: Service[];
}

export function ServicesClient({ initialServices }: ServicesClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: undefined,
      iconSvg: "",
      emoji: "",
      imageUrl: "",
      dataAiHint: "",
    },
  });

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(isOpen);
    if (!isOpen) {
      setCurrentService(null);
      setImagePreview(null);
      setImageFile(null);
      form.reset();
    }
  };

  const handleEdit = (service: Service) => {
    setCurrentService(service);
    form.reset({
        name: service.name,
        description: service.description || "",
        price: service.price ?? undefined,
        iconSvg: service.iconSvg || "",
        emoji: service.emoji || "",
        imageUrl: service.imageUrl || "",
        dataAiHint: service.dataAiHint || "",
    });
    if (service.imageUrl) {
        setImagePreview(service.imageUrl);
    }
    setOpen(true);
  };
  
  const handleNew = () => {
    setCurrentService(null);
    form.reset({ name: "", description: "", price: undefined, iconSvg: "", emoji: "", imageUrl: "", dataAiHint: "" });
    setImagePreview(null);
    setImageFile(null);
    setOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    let finalImageUrl = currentService?.imageUrl || "";

    try {
        if (imageFile) {
            finalImageUrl = await uploadImageAndGetURL(imageFile);
        }

        const serviceData = { ...data, imageUrl: finalImageUrl };

        if (currentService) {
            await updateService(currentService.id, serviceData);
            toast({ title: "Éxito", description: "Servicio actualizado." });
        } else {
            await addService({ ...serviceData, description: serviceData.description || "" });
            toast({ title: "Éxito", description: "Servicio añadido." });
        }
        router.refresh();
        handleOpenChange(false);
    } catch (error) {
        console.error("Submission error:", error);
        toast({ variant: "destructive", title: "Error", description: "Algo salió mal." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
        await deleteService(id);
        toast({ title: "Éxito", description: "Servicio eliminado." });
        router.refresh();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Algo salió mal." });
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">🔧 Servicios</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto gap-1" onClick={handleNew}>
              <PlusCircle className="h-4 w-4" />
              Añadir Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{currentService ? "Editar Servicio" : "Añadir Servicio"}</DialogTitle>
              <DialogDescription>
                {currentService ? "Actualiza los detalles de este servicio." : "Añade un nuevo servicio a tu sistema."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. Liberación de SIM" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Describe brevemente el servicio." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Precio ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="Dejar vacío si el precio está en sub-servicios" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="emoji"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Emoji del Ícono</FormLabel>
                                <Popover modal={false}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className="w-full justify-start font-normal">
                                                {field.value ? (
                                                    <span className="text-xl mr-2">{field.value}</span>
                                                ) : (
                                                    <Smile className="mr-2 h-4 w-4" />
                                                )}
                                                {field.value ? "Cambiar" : "Seleccionar emoji"}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <EmojiPicker
                                            onEmojiClick={(emojiData: EmojiClickData) => {
                                                form.setValue('emoji', emojiData.emoji);
                                                // Manually close popover
                                                document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                                            }}
                                            searchPlaceholder="¿Qué buscas?"
                                            previewConfig={{
                                                showPreview: false
                                            }}
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="space-y-2">
                        <FormLabel>Imagen del Servicio</FormLabel>
                        <FormControl>
                            <Input 
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                             />
                        </FormControl>
                         <div 
                            className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Previsualización" width={120} height={120} className="object-contain h-full w-full p-2" />
                            ) : (
                                <>
                                    <UploadCloud className="w-10 h-10 mb-2" />
                                    <span>{currentService?.imageUrl ? "Cambiar imagen" : "Seleccionar imagen"}</span>
                                </>
                            )}
                        </div>
                    </div>
                     <FormField
                        control={form.control}
                        name="dataAiHint"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pista para IA (opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. phone screen" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="iconSvg"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código del Ícono (SVG)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder='<svg>...</svg>' {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar cambios
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Servicio</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Sub-servicios</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.price !== undefined ? `$${service.price.toFixed(2)}` : '-'}</TableCell>
                <TableCell>
                  <Link href={`/admin/services/${service.id}`}>
                    <Button variant="outline" size="sm">
                       {service.subServices && service.subServices.length > 0 ? 
                         `Gestionar (${service.subServices.length})` :
                         'Añadir' 
                       }
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
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
                      <DropdownMenuItem onSelect={() => handleEdit(service)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(service.id)}>
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
