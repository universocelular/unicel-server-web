
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
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
import { PlusCircle, MoreHorizontal, Trash, Edit, Loader2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Eraser, X, Palette, Copy, Pilcrow, CaseUpper, CaseLower, TextQuote, FontSize, Text, Link2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Popup, Service, Brand } from "@/lib/db/types";
import { addPopup, updatePopup, deletePopup, duplicatePopup } from "@/lib/actions/popups";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import EmojiPicker, { type EmojiClickData, Categories, Theme } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { PopupDisplay } from "../popups/popup-display";

const ColorPalette = ({ onColorSelect }: { onColorSelect: (color: string) => void; }) => {
    const [customColor, setCustomColor] = useState("#000000");
    const [savedColors, setSavedColors] = useState<string[]>([]);
    
    useEffect(() => {
        try {
            const storedColors = localStorage.getItem("customColors");
            if (storedColors) {
                setSavedColors(JSON.parse(storedColors));
            }
        } catch (error) {
            console.error("Could not load custom colors from localStorage", error);
        }
    }, []);

    const addCustomColor = () => {
        if (customColor && !savedColors.includes(customColor)) {
            const newSavedColors = [...savedColors, customColor];
            setSavedColors(newSavedColors);
            try {
                localStorage.setItem("customColors", JSON.stringify(newSavedColors));
            } catch (error) {
                 console.error("Could not save custom colors to localStorage", error);
            }
        }
    };

    const presetColors = [
        '#000000', '#FFFFFF', '#EF4444', '#F97316', '#FACC15', '#84CC16', '#22C55E', '#14B8A6', '#0EA5E9', '#3B82F6', '#8B5CF6', '#EC4899'
    ];

    const ColorSwatch = ({ color }: { color: string }) => (
        <button
            type="button"
            className="w-6 h-6 rounded-full border border-border"
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
        />
    );

    return (
        <div className="space-y-4">
            <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Colores predefinidos</p>
                <div className="grid grid-cols-6 gap-2">
                    {presetColors.map(color => <ColorSwatch key={color} color={color} />)}
                </div>
            </div>
             <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Tus colores</p>
                <div className="grid grid-cols-6 gap-2">
                    {savedColors.map(color => <ColorSwatch key={color} color={color} />)}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="w-10 h-10 p-1" />
                <Button type="button" onClick={addCustomColor} size="sm">Añadir</Button>
            </div>
        </div>
    )
}

const RichTextField = ({ id, value, onChange, placeholder }: { id: string, value: string, onChange: (value: string) => void, placeholder?: string }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [fontSize, setFontSize] = useState("16");

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const applyCommand = (command: 'bold' | 'italic' | 'underline') => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false);
        onChange(editorRef.current.innerHTML);
    };
    
    const applyStyleToSelection = (style: React.CSSProperties) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      if (range.isCollapsed) return;
      
      const selectedText = range.toString();

      if (selectedText) {
          const span = document.createElement('span');
          Object.assign(span.style, style);

          try {
              const fragment = range.extractContents();
              span.appendChild(fragment);
              range.insertNode(span);
          } catch (e) {
              console.error("Error applying style:", e);
              document.execCommand('insertHTML', false, `<span style="${Object.entries(style).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$&').toLowerCase()}:${v}`).join(';')}">${selectedText}</span>`);
          }
      }
      
      selection.removeAllRanges();
      if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
      }
    }
    
    const applyFontSize = () => {
        applyStyleToSelection({ fontSize: `${fontSize}px` });
    };

    const applyLineHeight = (lineHeight: string) => {
        applyStyleToSelection({ lineHeight });
    };

    const applyAlignment = (alignment: 'left' | 'center' | 'right') => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1), false);
        onChange(editorRef.current.innerHTML);
    };

    const applyColor = (color: string) => {
       applyStyleToSelection({ color });
    };
    
    const applyFontFamily = (font: string) => {
        applyStyleToSelection({ fontFamily: font });
    }

    const removeFormat = () => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand('removeFormat');
        onChange(editorRef.current.innerHTML);
    }

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        const selection = window.getSelection();
        if(selection && selection.rangeCount > 0){
            const range = selection.getRangeAt(0);
            const emojiNode = document.createTextNode(emojiData.emoji);
            range.deleteContents();
            range.insertNode(emojiNode);
            range.setStartAfter(emojiNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        setEmojiPickerOpen(false);
        onChange(editorRef.current.innerHTML);
    };

    const fontFamilies = [
        { name: 'Default', value: 'inherit' },
        { name: 'Arial', value: 'Arial, sans-serif' },
        { name: 'Georgia', value: 'Georgia, serif' },
        { name: 'Courier New', value: 'Courier New, monospace' },
        { name: 'Inter', value: 'var(--font-body), sans-serif' },
        { name: 'Caveat', value: 'var(--font-caveat), cursive' },
    ];
    
    const lineHeights = [
        { name: "Muy pequeño (1)", value: "1" },
        { name: "Pequeño (1.2)", value: "1.2" },
        { name: "Normal", value: "normal" },
        { name: "Medio (1.5)", value: "1.5" },
        { name: "Amplio (1.8)", value: "1.8" },
        { name: "Muy amplio (2)", value: "2" },
    ];

    return (
      <div className="rounded-md border border-input">
        <div className="flex items-center gap-1 p-1 border-b flex-wrap">
          <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => { e.preventDefault(); applyCommand('bold'); }} title="Negrita">
            <Bold className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => { e.preventDefault(); applyCommand('italic'); }} title="Cursiva">
            <Italic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => { e.preventDefault(); applyCommand('underline'); }} title="Subrayado">
            <Underline className="h-4 w-4" />
          </Button>
          <div className="w-[1px] h-6 bg-border mx-1"></div>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" title="Elegir Color">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <ColorPalette onColorSelect={(color) => { applyColor(color); document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); }} />
            </PopoverContent>
          </Popover>
          <div className="w-[1px] h-6 bg-border mx-1"></div>
          <Select onValueChange={applyFontFamily} defaultValue="inherit">
            <SelectTrigger className="w-auto h-9 border-none focus:ring-0 gap-1 text-xs">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map(font => (
                <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-16 h-8 text-xs"
              min="8"
            />
            <Button type="button" size="sm" className="h-8 text-xs" onClick={applyFontSize}>Aplicar</Button>
          </div>
          <Select onValueChange={applyLineHeight} defaultValue="normal">
            <SelectTrigger className="w-auto h-9 border-none focus:ring-0 gap-1 text-xs" title="Interlineado">
              <Text className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lineHeights.map(lh => (
                <SelectItem key={lh.value} value={lh.value}>{lh.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-[1px] h-6 bg-border mx-1"></div>
          <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => { e.preventDefault(); applyAlignment('left'); }} title="Alinear Izquierda">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => { e.preventDefault(); applyAlignment('center'); }} title="Alinear Centro">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => { e.preventDefault(); applyAlignment('right'); }} title="Alinear Derecha">
            <AlignRight className="h-4 w-4" />
          </Button>
          <div className="w-[1px] h-6 bg-border mx-1"></div>
          <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => { e.preventDefault(); removeFormat(); }} title="Borrar formato">
            <Eraser className="h-4 w-4" />
          </Button>
          <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" title="Añadir emoji">
                <span className="text-lg">😊</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="start"
            >
              <EmojiPicker
                theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                onEmojiClick={handleEmojiClick}
                searchPlaceholder="¿Qué buscas?"
                previewConfig={{ showPreview: false }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning={true}
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          className={cn(
            "min-h-[100px] p-2 focus:outline-none focus:ring-1 focus:ring-ring rounded-b-md rich-text-editor-content"
          )}
          data-placeholder={placeholder}
        />
      </div>
    );
};


interface PopupsClientProps {
  initialPopups: Popup[];
  initialServices: Service[];
  initialBrands: Brand[];
}

export function PopupsClient({ initialPopups, initialServices, initialBrands }: PopupsClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<Popup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [descriptions, setDescriptions] = useState<string[]>(['']);
  const [mediaUrl, setMediaUrl] = useState('');
  const [targetBrandName, setTargetBrandName] = useState<string | "clear">("clear");
  const [targetServiceId, setTargetServiceId] = useState<string | "clear">("clear");
  const [targetSubServiceId, setTargetSubServiceId] = useState<string | "clear">("clear");
  const [hasCountdown, setHasCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [animationEffect, setAnimationEffect] = useState<Popup['animationEffect']>('fadeIn');
  const [showLastUpdated, setShowLastUpdated] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

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
  
  
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v');
      }
    } catch(e) {
        return null; // Invalid URL
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const youtubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(mediaUrl), [mediaUrl]);


  const resetForm = () => {
    setCurrentPopup(null);
    setTitle('');
    setDescriptions(['']);
    setMediaUrl('');
    setTargetBrandName("clear");
    setTargetServiceId("clear");
    setTargetSubServiceId("clear");
    setHasCountdown(false);
    setCountdownSeconds(10);
    setDelaySeconds(0);
    setAnimationEffect('fadeIn');
    setShowLastUpdated(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleEdit = (popup: Popup) => {
    setCurrentPopup(popup);
    setTitle(popup.title);
    setDescriptions(popup.description?.length > 0 ? popup.description : ['']);
    setMediaUrl(popup.mediaUrl || '');
    setTargetBrandName(popup.targetBrandName || "clear");
    setTargetServiceId(popup.targetServiceId || "clear");
    // timeout to let available subservices update
    setTimeout(() => {
        setTargetSubServiceId(popup.targetSubServiceId || "clear");
    }, 0);
    setHasCountdown(popup.hasCountdown);
    setCountdownSeconds(popup.countdownSeconds || 10);
    setDelaySeconds(popup.delaySeconds || 0);
    setAnimationEffect(popup.animationEffect || 'fadeIn');
    setShowLastUpdated(popup.showLastUpdated || false);
    setOpen(true);
  };

  const handleNew = () => {
    resetForm();
    setOpen(true);
  };

  const cleanupHtml = (html: string) => {
    if (typeof window === 'undefined' || !html) return html;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // These colors are hardcoded from globals.css for light and dark themes
    const defaultLightRgb = 'rgb(30, 41, 59)';   // foreground: 222 47% 11% -> #1E293B
    const defaultDarkRgb = 'rgb(248, 250, 252)'; // foreground: 210 40% 98% -> #F8FAFC
    
    tempDiv.querySelectorAll('[style*="color"]').forEach(el => {
        const htmlEl = el as HTMLElement;
        const color = htmlEl.style.color;

        if (color === defaultLightRgb || color === defaultDarkRgb) {
            htmlEl.style.color = '';
             if (!htmlEl.getAttribute('style') || htmlEl.getAttribute('style') === "") {
                htmlEl.removeAttribute('style');
            }
        }
    });
    
    // Remove empty tags
    tempDiv.querySelectorAll('div:empty, span:empty, p:empty').forEach(el => {
        if (!el.hasChildNodes() && el.innerHTML.trim() === '') {
            el.remove();
        }
    });
    
    // Unwrap redundant spans
    tempDiv.querySelectorAll('span:not([style]), span[style=""]').forEach(span => {
      if (!span.hasAttributes() || (span.attributes.length === 1 && span.hasAttribute('style') && span.style.length === 0)) {
        span.replaceWith(...Array.from(span.childNodes));
      }
    });

    return tempDiv.innerHTML.replace(/<br\s*\/?>\s*$/i, ''); // Remove trailing <br>
  };


  const handleSave = async () => {
    setIsSubmitting(true);
    
    const cleanedTitle = cleanupHtml(title);
    const cleanedDescriptions = descriptions.map(desc => cleanupHtml(desc));

    const popupData = {
      title: cleanedTitle,
      description: cleanedDescriptions.filter(d => d.trim() !== '' && d !== '<br>'),
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaUrl ? 'youtube' : undefined,
      targetBrandName: targetBrandName === "clear" ? undefined : targetBrandName,
      targetServiceId: targetServiceId === "clear" ? undefined : targetServiceId,
      targetSubServiceId: targetSubServiceId === "clear" ? undefined : targetSubServiceId,
      hasCountdown,
      countdownSeconds: hasCountdown ? countdownSeconds : undefined,
      delaySeconds: delaySeconds > 0 ? delaySeconds : undefined,
      animationEffect,
      showLastUpdated,
    };

    try {
      if (currentPopup) {
        await updatePopup(currentPopup.id, popupData);
        toast({ title: "Éxito", description: "Pop-up actualizado." });
      } else {
        await addPopup({ ...popupData, isActive: true });
        toast({ title: "Éxito", description: "Pop-up añadido." });
      }
      router.refresh();
      handleOpenChange(false);
    } catch (error) {
       console.error("Error saving popup:", error);
       toast({ variant: "destructive", title: "Error", description: "Algo salió mal." });
    } finally {
        setIsSubmitting(false);
    }
  };


  const handleDelete = async (id: string) => {
    try {
        await deletePopup(id);
        toast({ title: "Éxito", description: "Pop-up eliminado." });
        router.refresh();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Algo salió mal al eliminar." });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
        await duplicatePopup(id);
        toast({ title: "Éxito", description: "Pop-up duplicado." });
        router.refresh();
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "No se pudo duplicar el pop-up." });
    }
  };


  const toggleActive = async (popup: Popup) => {
    try {
        const newStatus = !popup.isActive;
        await updatePopup(popup.id, { isActive: newStatus });
        toast({ title: "Éxito", description: `Pop-up ${newStatus ? 'activado' : 'desactivado'}.` });
        router.refresh();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado." });
    }
  };
  
  const selectedService = useMemo(() => {
      if (!targetServiceId || targetServiceId === "clear") return null;
      return initialServices.find(s => s.id === targetServiceId);
  }, [targetServiceId, initialServices]);

  const getTargetName = (popup: Popup) => {
    let serviceName = "";
    let brandName = popup.targetBrandName ? `Todos los ${popup.targetBrandName}` : "";

    if (popup.targetServiceId) {
        const service = initialServices.find(s => s.id === popup.targetServiceId);
        if (service) {
            if (popup.targetSubServiceId) {
                const subService = service.subServices?.find(ss => ss.id === popup.targetSubServiceId);
                serviceName = `${service.name} > ${subService?.name || 'Sub-servicio'}`;
            } else {
                serviceName = service.name;
            }
        } else {
            serviceName = "Servicio Desconocido";
        }
    }

    if (popup.targetBrandName && serviceName) {
        return `${popup.targetBrandName} > ${serviceName}`;
    }
    if (popup.targetBrandName && !serviceName) {
        return brandName;
    }
    return brandName || serviceName || "Global";
  }

  const addDescriptionField = () => {
    setDescriptions(prev => [...prev, '']);
  };

  const removeDescriptionField = (index: number) => {
    if (descriptions.length > 1) {
        setDescriptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = value;
    setDescriptions(newDescriptions);
  };
  
  const currentPreviewPopup: Popup = {
      id: 'preview',
      title: title,
      description: descriptions,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaUrl ? 'youtube' : undefined,
      hasCountdown: hasCountdown,
      countdownSeconds: hasCountdown ? countdownSeconds : undefined,
      animationEffect: animationEffect,
      showLastUpdated: showLastUpdated,
      isActive: true,
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {isPreviewing && (
          <Dialog open={isPreviewing} onOpenChange={setIsPreviewing}>
              <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-4xl" onInteractOutside={(e) => {
                  if (currentPreviewPopup.hasCountdown) e.preventDefault();
              }}>
                 <PopupDisplay isPreview={true} previewPopup={currentPreviewPopup} onPreviewClose={() => setIsPreviewing(false)} />
              </DialogContent>
          </Dialog>
      )}
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">📢 Pop-ups</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto gap-1" onClick={handleNew}>
              <PlusCircle className="h-4 w-4" />
              Añadir Pop-up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{currentPopup ? "Editar Pop-up" : "Añadir Pop-up"}</DialogTitle>
              <DialogDescription>
                Configura los mensajes emergentes que verán tus usuarios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 max-h-[70vh] overflow-y-auto pr-4">
              {/* Main Content Column */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="title-editor">Título</Label>
                    <RichTextField id="title-editor" value={title} onChange={setTitle} placeholder="Escribe el título aquí..."/>
                </div>
                
                {descriptions.map((desc, index) => (
                  <div key={index} className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`description-editor-${index}`}>Descripción {index + 1}</Label>
                      {descriptions.length > 1 && (
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeDescriptionField(index)}>
                            <Trash className="h-4 w-4 text-destructive"/>
                         </Button>
                      )}
                    </div>
                    <RichTextField id={`description-editor-${index}`} value={desc} onChange={(val) => handleDescriptionChange(index, val)} placeholder={`Párrafo de descripción ${index + 1}`}/>
                  </div>
                ))}
                <Button variant="outline" onClick={addDescriptionField}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Añadir campo de texto
                </Button>
              </div>

              {/* Sidebar Column */}
              <div className="md:col-span-1 space-y-6">
                <div>
                  <h3 className="text-md font-semibold mb-2">Contenido Multimedia</h3>
                  <div className="grid gap-2">
                      <Label htmlFor="media-url">URL de YouTube</Label>
                      <Input 
                          id="media-url" 
                          placeholder="Pega un enlace de YouTube aquí..."
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                      />
                      {youtubeEmbedUrl && (
                          <div className="aspect-video w-full mt-2 rounded-md overflow-hidden">
                              <iframe
                                  src={youtubeEmbedUrl}
                                  title="YouTube video player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full"
                              ></iframe>
                          </div>
                      )}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2">Visibilidad</h3>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Marca</Label>
                        <Select value={targetBrandName} onValueChange={setTargetBrandName}>
                            <SelectTrigger><SelectValue placeholder="En todas las páginas"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="clear">En todas las páginas</SelectItem>
                                {sortedBrands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Servicio</Label>
                        <Select value={targetServiceId} onValueChange={val => { setTargetServiceId(val); setTargetSubServiceId("clear"); }}>
                            <SelectTrigger><SelectValue placeholder="En todas las páginas"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="clear">En todas las páginas</SelectItem>
                                {initialServices.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Sub-servicio</Label>
                        <Select value={targetSubServiceId} onValueChange={setTargetSubServiceId} disabled={!selectedService?.subServices || selectedService.subServices.length === 0}>
                            <SelectTrigger><SelectValue placeholder="Todos los sub-servicios"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="clear">Todos los sub-servicios</SelectItem>
                                {selectedService?.subServices?.map(ss => <SelectItem key={ss.id} value={ss.id}>{ss.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-2">Funcionalidad y Efectos</h3>
                  <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                          <Switch id="countdown-switch" checked={hasCountdown} onCheckedChange={setHasCountdown} />
                          <Label htmlFor="countdown-switch">Añadir contador</Label>
                      </div>
                      {hasCountdown && (
                          <div className="grid gap-2">
                              <Label htmlFor="countdown-seconds">Duración (segundos)</Label>
                              <Input id="countdown-seconds" type="number" value={countdownSeconds} onChange={e => setCountdownSeconds(Number(e.target.value))} />
                          </div>
                      )}
                      <div className="flex items-center space-x-2">
                          <Switch id="show-last-updated-switch" checked={showLastUpdated} onCheckedChange={setShowLastUpdated} />
                          <Label htmlFor="show-last-updated-switch">Mostrar fecha de actualización</Label>
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="delay-seconds">Retraso de aparición del Pop-Up (Segundos)</Label>
                          <Input id="delay-seconds" type="number" value={delaySeconds} onChange={e => setDelaySeconds(Number(e.target.value))} />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="animation-effect">Efecto de animación</Label>
                          <Select value={animationEffect} onValueChange={(val) => setAnimationEffect(val as any)}>
                              <SelectTrigger id="animation-effect">
                                  <SelectValue placeholder="Selecciona un efecto"/>
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="fadeIn">Desvanecer (Fade In)</SelectItem>
                                  <SelectItem value="slideIn">Deslizar (Slide In)</SelectItem>
                                  <SelectItem value="zoomIn">Aumentar (Zoom In)</SelectItem>
                                  <SelectItem value="rotateIn">Girar (Rotate In)</SelectItem>
                                  <SelectItem value="slideUp">Deslizar arriba (Slide Up)</SelectItem>
                                  <SelectItem value="flipIn">Voltear (Flip In)</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setIsPreviewing(true)}>
                    Vista Previa
                </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Aparece en</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialPopups.map((popup) => (
              <TableRow key={popup.id}>
                <TableCell className="font-medium" dangerouslySetInnerHTML={{ __html: popup.title }} />
                <TableCell>{getTargetName(popup)}</TableCell>
                <TableCell>
                  <Button variant={popup.isActive ? "cta" : "destructive"} size="sm" onClick={() => toggleActive(popup)}>
                    {popup.isActive ? "Activo" : "Inactivo"}
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
                      <DropdownMenuItem onSelect={() => handleEdit(popup)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDuplicate(popup.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(popup.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {initialPopups.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No se encontraron pop-ups.
                    </TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
