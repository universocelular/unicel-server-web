
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/lib/actions/payment-methods";
import type { PaymentMethod } from "@/lib/db/types";
import { PlusCircle, MoreHorizontal, Trash, Edit, Loader2, Smile, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { countries } from "@/lib/db/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const paymentMethodSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  countryId: z.string().min(1, "El país es requerido."),
  emoji: z.string().optional(),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodsClientProps {
  initialPaymentMethods: PaymentMethod[];
}

export function PaymentMethodsClient({ initialPaymentMethods }: PaymentMethodsClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod | null>(null);

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { name: "", countryId: "", emoji: "" },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(isOpen);
    if (!isOpen) {
      setCurrentMethod(null);
      form.reset();
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setCurrentMethod(method);
    form.reset({
      name: method.name,
      countryId: method.countryId,
      emoji: method.emoji,
    });
    setOpen(true);
  };

  const handleNew = () => {
    setCurrentMethod(null);
    form.reset({ name: "", countryId: "", emoji: "" });
    setOpen(true);
  };

  const onSubmit = async (data: PaymentMethodFormValues) => {
    setIsSubmitting(true);
    try {
      if (currentMethod) {
        await updatePaymentMethod(currentMethod.id, data);
        setPaymentMethods(prev => 
          prev.map(p => p.id === currentMethod.id ? { ...p, ...data } : p)
        );
        toast({ title: "Éxito", description: "Medio de pago actualizado." });
      } else {
        const newMethod = await addPaymentMethod({ ...data, isActive: true });
        setPaymentMethods(prev => [...prev, newMethod]);
        toast({ title: "Éxito", description: "Medio de pago añadido." });
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
      await deletePaymentMethod(id);
      setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
      toast({ title: "Éxito", description: "Medio de pago eliminado." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Algo salió mal al eliminar." });
    }
  };
  
   const toggleActive = async (method: PaymentMethod) => {
    try {
      await updatePaymentMethod(method.id, { isActive: !method.isActive });
      setPaymentMethods(prev => 
        prev.map(p => p.id === method.id ? { ...p, isActive: !p.isActive } : p)
      );
      toast({ title: "Éxito", description: `Estado cambiado.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado." });
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">💳 Medios de Pago</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto gap-1" onClick={handleNew}>
              <PlusCircle className="h-4 w-4" />
              Añadir Medio de Pago
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentMethod ? "Editar Medio de Pago" : "Añadir Medio de Pago"}</DialogTitle>
              <DialogDescription>
                Configura los medios de pago disponibles para tus clientes.
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
                        <Input placeholder="Ej. Mercado Pago" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="countryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un país" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => {
                            const Flag = country.flag;
                            return (
                                <SelectItem key={country.id} value={country.id}>
                                    <div className="flex items-center gap-2">
                                        <Flag />
                                        <span>{country.name}</span>
                                    </div>
                                </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emoji"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emoji Representativo</FormLabel>
                      <div className="flex items-center gap-2">
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
                                document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                              }}
                              previewConfig={{ showPreview: false }}
                            />
                          </PopoverContent>
                        </Popover>
                        {field.value && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => form.setValue('emoji', '')}
                            aria-label="Eliminar emoji"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
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
              <TableHead>Nombre</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentMethods.map((method) => {
                const country = countries.find(c => c.id === method.countryId);
                const Flag = country?.flag;
                return (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                        {method.emoji && <span className="text-lg">{method.emoji}</span>}
                        {method.name}
                    </TableCell>
                    <TableCell>
                        {country ? (
                          <div className="flex items-center gap-2">
                            {Flag && <Flag />}
                            {country.name}
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                    </TableCell>
                    <TableCell>
                      <Button variant={method.isActive ? "cta" : "destructive"} size="sm" onClick={() => toggleActive(method)}>
                        {method.isActive ? "Activo" : "Inactivo"}
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
                          <DropdownMenuItem onSelect={() => handleEdit(method)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              handleDelete(method.id);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
