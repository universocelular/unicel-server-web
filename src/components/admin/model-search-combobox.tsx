
"use client";

import * as React from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "../ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Model } from "@/lib/db/types";

interface ModelSearchComboBoxProps {
    models: Model[];
    selectedModelId?: string;
    onSelectModel: (modelId: string) => void;
    disabled?: boolean;
}

export default function ModelSearchComboBox({ models, selectedModelId, onSelectModel, disabled }: ModelSearchComboBoxProps) {
    const [open, setOpen] = React.useState(false);

    const selectedModel = React.useMemo(() => {
        return models.find((model) => model.id === selectedModelId);
    }, [models, selectedModelId]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {selectedModel
                        ? selectedModel.name
                        : "Selecciona un modelo"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar modelo..." />
                    <CommandList>
                        <CommandEmpty>No se encontró ningún modelo.</CommandEmpty>
                        <CommandGroup>
                            {models.map((model) => (
                                <CommandItem
                                    key={model.id}
                                    value={model.name}
                                    onSelect={() => {
                                        onSelectModel(model.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedModelId === model.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {model.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
