
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MissingModelDialog() {
  const [missingModel, setMissingModel] = useState("");
  const [missingModelError, setMissingModelError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSendModel = () => {
    if (!missingModel.trim()) {
      setMissingModelError("Por favor, completa este campo.");
      return;
    }
    setMissingModelError(""); // Clear error if validation passes
    const text = `Hola, no encuentro el siguiente modelo: ${missingModel}`;
    const whatsappUrl = `https://wa.me/5491138080445?text=${encodeURIComponent(
      text
    )}`;
    window.open(whatsappUrl, "_blank");
    setMissingModel(""); // Clear the input
    setIsOpen(false); // Close the dialog
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMissingModel(e.target.value);
    if (missingModelError) {
      setMissingModelError("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="text-muted-foreground transition-colors hover:text-primary text-2xl font-caveat"
        >
          ¿No encuentras tu modelo? Haz click acá...
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿No encuentras tu modelo?</DialogTitle>
          <DialogDescription>
            Indícanos qué marca y modelo estás buscando para que podamos
            agregarlo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="missing-model"
            value={missingModel}
            onChange={handleInputChange}
            placeholder="Ej: Samsung S25 Ultra"
            className={cn(
              "border-muted",
              missingModelError && "border-primary"
            )}
          />
          {missingModelError && <p className="text-sm text-destructive">{missingModelError}</p>}
        </div>
        <DialogFooter>
            <Button onClick={handleSendModel}>Enviar por WhatsApp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
