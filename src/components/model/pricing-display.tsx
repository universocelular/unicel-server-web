
"use client";

import type { Model, Service, Country, PaymentMethod, DiscountSetting, Settings, Coupon } from "@/lib/db/types";
import { useState, useMemo, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { carriers as allCarriers, countries } from "@/lib/db/data";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSettings } from "@/lib/actions/settings";
import { getPaymentMethods } from "@/lib/actions/payment-methods";
import { getCouponByCode } from "@/lib/actions/coupons";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, X } from "lucide-react";
import { ArgentinaFlag, GlobeIcon } from "../icons/flags";


interface PricingOption {
  title: string;
  price?: number | null; // Allow null for "Under Construction"
  originalPrice?: number;
  discountPercentage?: number;
  time?: string;
  description?: string;
  isFree?: boolean;
}

interface PricingDisplayProps {
  model: Model;
  service: Service;
  subServiceId?: string;
  carrierId?: string;
}

type Currency = 'USD' | 'ARS';

const getCategoryEmoji = (category: Model['category']) => {
  switch (category) {
    case 'Phone': return '📱';
    case 'Mac': return '💻';
    case 'iPad': return '📲';
    case 'Watch': return '⌚';
    default: return '📱';
  }
};

const getApplicableDiscount = (
  model: Model,
  service: Service,
  subServiceId: string | undefined,
  settings: Settings
): DiscountSetting | null => {
  if (!settings.isDiscountModeActive || !settings.discounts) {
    return null;
  }

  const activeDiscounts = settings.discounts.filter(d => d.isActive);
  let bestMatch: DiscountSetting | null = null;
  let highestSpecificity = -1;

  for (const discount of activeDiscounts) {
    let currentSpecificity = 0;
    let isMatch = true;

    // Global discount
    if (!discount.brandName && !discount.serviceId && !discount.modelName) {
       currentSpecificity = 0;
    }

    if (discount.brandName) {
        if (discount.brandName !== model.brand) isMatch = false;
        else currentSpecificity = 1;
    }
    
    if (discount.modelName) {
        if (discount.modelName !== model.name) isMatch = false;
        else currentSpecificity = 2;
    }

    if (discount.serviceId) {
        if (discount.serviceId !== service.id) isMatch = false;
        else currentSpecificity = 3;
    }
    
    if (discount.subServiceId) {
        if (discount.subServiceId !== subServiceId) isMatch = false;
        else currentSpecificity = 4;
    }

    if (isMatch && currentSpecificity > highestSpecificity) {
      highestSpecificity = currentSpecificity;
      bestMatch = discount;
    }
  }

  return bestMatch;
};

const frontendCountries = countries.filter(c => c.id !== 'global');

const MissingInfoDialog = memo(({ 
    handleMissingInfo, 
    errors, 
    handleInputChange, 
    publicationLink, 
    groupLink,
    whatsappNumber, 
    telegram, 
    selectedCountryId, 
    setSelectedCountryId 
}) => {
    const selectedCountry = useMemo(() => frontendCountries.find(c => c.id === selectedCountryId), [selectedCountryId]);
    const CountryFlag = selectedCountry?.flag;
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-muted-foreground transition-colors hover:text-primary font-caveat text-2xl">
                    ¿Encontraste un mejor precio? Haznos saber y lo mejoramos, click acá
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className="text-center sm:text-center">
                    <DialogTitle>Mejoramos cualquier precio</DialogTitle>
                    <DialogDescription>
                        Tendras que demostrar donde viste ese precio y luego de analizarlo lo mejoraremos...
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="publication-link">Enlace a la publicación del técnico</Label>
                        <Input
                            id="publication-link"
                            value={publicationLink}
                            onChange={handleInputChange('publicationLink')}
                        />
                        {errors.publicationLink && <p className="text-sm text-destructive">{errors.publicationLink}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="group-link">Link del grupo del técnico que ofrece ese precio</Label>
                        <Input
                            id="group-link"
                            value={groupLink}
                            onChange={handleInputChange('groupLink')}
                        />
                        {errors.groupLink && <p className="text-sm text-destructive">{errors.groupLink}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="whatsapp">Whatsapp del técnico que ofrece ese precio</Label>
                        <div className="flex gap-2">
                            <Select
                                value={selectedCountryId}
                                onValueChange={setSelectedCountryId}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue>
                                        <div className="flex items-center gap-2">
                                            {CountryFlag ? <CountryFlag /> : null}
                                            <span>{selectedCountry?.phoneCode}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {frontendCountries.map(country => {
                                        const Flag = country.flag;
                                        return (
                                            <SelectItem key={country.id} value={country.id}>
                                                <div className="flex items-center gap-2">
                                                    <Flag />
                                                    <span>{country.name} ({country.phoneCode})</span>
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                            <Input
                                id="whatsapp"
                                value={whatsappNumber}
                                onChange={handleInputChange('whatsappNumber')}
                                placeholder="Número de teléfono"
                                className="flex-1"
                            />
                        </div>
                        {errors.whatsappNumber && <p className="text-sm text-destructive">{errors.whatsappNumber}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="telegram">Telegram del técnico que ofrece ese precio</Label>
                        <Input
                            id="telegram"
                            value={telegram}
                            onChange={handleInputChange('telegram')}
                            placeholder="Ej: @usuario"
                        />
                        {errors.telegram && <p className="text-sm text-destructive">{errors.telegram}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleMissingInfo}>Enviar por WhatsApp</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
MissingInfoDialog.displayName = 'MissingInfoDialog';

export function PricingDisplay({ model, service, subServiceId, carrierId }: PricingDisplayProps) {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [publicationLink, setPublicationLink] = useState("");
  const [groupLink, setGroupLink] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>(frontendCountries.find(c => c.id === 'ar')?.id);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [telegram, setTelegram] = useState("");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [errors, setErrors] = useState({ publicationLink: "", whatsappNumber: "", telegram: "", groupLink: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [showPriceMatchButton, setShowPriceMatchButton] = useState(false);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  const emoji = useMemo(() => getCategoryEmoji(model.category), [model.category]);

  const usdToArsRate = useMemo(() => settings?.usdToArsRate || 1340, [settings]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsData, paymentMethodsData] = await Promise.all([
          getSettings(),
          getPaymentMethods()
        ]);
        setSettings(settingsData);
        setPaymentMethods(paymentMethodsData.filter(pm => pm.isActive));
      } catch (error) {
        console.error("Failed to fetch page data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPriceMatchButton(true);
    }, 2000); // 2-second delay
    return () => clearTimeout(timer);
  }, []);

  const pricingOption: PricingOption | null = useMemo(() => {
    if (!settings) return null; // Wait for settings to load
    
    // If all prices for this model are under construction, show that immediately.
    if (model.priceOverrides === null) {
        return { title: service.name, price: null };
    }

    let price: number | null | undefined;
    let title: string = service.name;
    let description: string | undefined = service.description;
    let time: string | undefined;
    let isFree = false;

    // Determine if the current service is marked as free in settings
    if (settings?.isFreeModeActive && settings.freeServices) {
        const freeSetting = settings.freeServices.find(fs => 
            fs.modelId === model.id &&
            fs.serviceId === service.id &&
            fs.subServiceId === subServiceId // works even if both are undefined
        );
        if (freeSetting) {
            isFree = true;
        }
    }
    
    // Determine the base price
    if (service.id === '4' && carrierId) { // SIM Unlock
      const carrier = allCarriers.find(c => c.id === carrierId);
      const simUnlockOverrides = model.priceOverrides?.['4'] as Record<string, number | null> | undefined;
      price = simUnlockOverrides?.[carrierId];
      title = `Desbloqueo SIM - ${carrier?.name || 'Operadora'}`;
      description = `Servicio de desbloqueo de red para ${carrier?.name || 'tu operadora'}.`;
      time = "1-3 días hábiles";
    } else if (subServiceId) { // Sub-service
        const subService = service.subServices?.find(s => s.id === subServiceId);
        if (subService) {
            price = (model.priceOverrides?.[subService.id] as number | null | undefined) ?? subService.price;
            title = `${service.name} - ${subService.name}`;
        }
    } else { // Regular service
        price = (model.priceOverrides?.[service.id] as number | null | undefined) ?? service.price;
    }

    // Allow displaying the page even if price is undefined (not set), especially for SIM unlock
    if (price === undefined && !isFree && service.id !== '4') {
        return { title, price: undefined };
    }
    
    if (price === null) {
      return { title, price: null }; // Under Construction
    }

    // Check for discounts
    let finalPrice = price;
    let originalPrice: number | undefined;
    let discountPercentage: number | undefined;

    if (appliedCoupon && finalPrice !== undefined && !isFree) {
        originalPrice = finalPrice;
        discountPercentage = appliedCoupon.discountPercentage;
        finalPrice = finalPrice * (1 - appliedCoupon.discountPercentage / 100);
    } else {
        const autoDiscount = getApplicableDiscount(model, service, subServiceId, settings);
        if (autoDiscount && finalPrice !== undefined && !isFree) {
            originalPrice = finalPrice;
            discountPercentage = autoDiscount.discountPercentage;
            finalPrice = finalPrice * (1 - autoDiscount.discountPercentage / 100);
        }
    }

    return { title, price: finalPrice, originalPrice, discountPercentage, time, description, isFree };
  }, [service, subServiceId, carrierId, model, settings, appliedCoupon]);

  const handleUnlockNow = () => {
    if (!pricingOption) return;
  
    const deviceName = `${model.brand} ${model.name}`;
    let priceText = "";

    if (pricingOption.isFree) {
        priceText = "GRATIS";
    } else if (pricingOption.price === null) {
        priceText = "En construcción 🚧";
    } else if (pricingOption.price !== undefined) {
        if (pricingOption.originalPrice) {
            priceText = `$${pricingOption.price.toFixed(2)} USD (Original: $${pricingOption.originalPrice.toFixed(2)}) - ${pricingOption.discountPercentage}% OFF`;
        } else {
            priceText = `$${pricingOption.price.toFixed(2)} USD`;
        }
    } else {
        priceText = "Precio a consultar";
    }

    if (appliedCoupon) {
        priceText += ` (Cupón: ${appliedCoupon.code})`;
    }
    
    let details = `Servicio: ${pricingOption.title}\nModelo: ${deviceName}`;
  
    if (carrierId) {
      const carrier = allCarriers.find(c => c.id === carrierId);
      const country = countries.find(c => c.id === carrier?.countryId);
      if (carrier && country) {
        details += `\nPaís de bloqueo: ${country.name}\nOperadora: ${carrier.name}`;
      }
    }
  
    details += `\nPrecio: ${priceText}`;
  
    const text = `Hola, quiero contratar el siguiente servicio:\n\n${details}`;
  
    const whatsappUrl = `https://wa.me/5491138080445?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!publicationLink.trim()) {
      newErrors.publicationLink = "El enlace a la publicación es requerido.";
      isValid = false;
    }
    if (!groupLink.trim()) {
      newErrors.groupLink = "El enlace al grupo es requerido.";
      isValid = false;
    }
    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = "El número de WhatsApp es requerido.";
      isValid = false;
    }
    if (!telegram.trim()) {
      newErrors.telegram = "El usuario de Telegram es requerido.";
      isValid = false;
    }

    setErrors(newErrors as any);
    return isValid;
  };

  const handleMissingInfo = () => {
    if (!validateForm()) {
      return;
    }

    const selectedCountry = frontendCountries.find(c => c.id === selectedCountryId);
    const fullWhatsapp = selectedCountry && whatsappNumber ? `${selectedCountry.phoneCode}${whatsappNumber}` : 'No proporcionado';
    const text = `Hola, tengo una consulta para mejorar un precio.\n\nServicio: ${pricingOption?.title} for ${model.brand} ${model.name}\nEnlace de la publicación: ${publicationLink}\nLink del grupo del técnico que ofrece ese precio: ${groupLink}\nWhatsApp del técnico: ${fullWhatsapp}\nTelegram del técnico: ${telegram || 'No proporcionado'}`;
    const whatsappUrl = `https://wa.me/5491138080445?text=${encodeURIComponent(
      text
    )}`;
    window.open(whatsappUrl, "_blank");
    setErrors({ publicationLink: "", whatsappNumber: "", telegram: "", groupLink: "" });
  };

 const handleInputChange = (fieldName: keyof typeof errors) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    switch (fieldName) {
        case 'publicationLink': setPublicationLink(value); break;
        case 'groupLink': setGroupLink(value); break;
        case 'whatsappNumber': setWhatsappNumber(value); break;
        case 'telegram': setTelegram(value); break;
    }
    if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
};

  const handleApplyCoupon = async () => {
    if (!couponCode) {
        setCouponError("Ingresa un código.");
        return;
    }
    setIsCheckingCoupon(true);
    setCouponError(null);

    const coupon = await getCouponByCode(couponCode);
    
    if (!coupon || !coupon.isActive) {
        setCouponError("El cupón no es válido o ha expirado.");
        setAppliedCoupon(null);
    } else {
        // Check if coupon is applicable
        const isBrandMatch = !coupon.brandName || coupon.brandName === model.brand;
        const isModelMatch = !coupon.modelId || coupon.modelId === model.id;
        const isServiceMatch = !coupon.serviceId || coupon.serviceId === service.id;
        const isSubServiceMatch = !coupon.subServiceId || coupon.subServiceId === subServiceId;

        if (isBrandMatch && isModelMatch && isServiceMatch && isSubServiceMatch) {
            setAppliedCoupon(coupon);
        } else {
            setCouponError("Este cupón no es válido para este producto/servicio.");
            setAppliedCoupon(null);
        }
    }
    setIsCheckingCoupon(false);
  };

  const handleRemoveCoupon = () => {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponError(null);
  };

  if (isLoading) {
    return (
       <div className="container mx-auto px-4 pt-2 pb-8 flex flex-col items-center gap-6 md:gap-8">
          <div className="text-center">
             <Skeleton className="h-9 w-72 mb-2" />
             <Skeleton className="h-7 w-52 mx-auto" />
          </div>
           <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
             <Skeleton className="h-28 w-full rounded-2xl" />
             <Skeleton className="h-28 w-full rounded-2xl" />
           </div>
           <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-64 mb-4" />
           <Skeleton className="h-12 w-full max-w-sm rounded-full" />
           <Skeleton className="h-12 w-full max-w-sm rounded-full" />
           <Skeleton className="h-px w-full max-w-sm my-4" />
           <div className="w-full max-w-sm space-y-3">
              <Skeleton className="h-6 w-48 mx-auto" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
           </div>
           <Skeleton className="h-6 w-64 mt-4" />
       </div>
    );
  }

  if (!pricingOption) {
    // This case should ideally not be hit if logic is correct, but as a fallback
    return (
        <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center gap-4">
            <h1 className="text-xl font-semibold">Error</h1>
            <p className="text-muted-foreground max-w-md">No se pudo cargar la información de precios. Por favor, intenta de nuevo.</p>
            <Button onClick={() => router.back()} className="mt-4">Atrás</Button>
        </div>
    );
  }

  const renderPrice = (price: number | undefined, currency: Currency) => {
    if (price === undefined) return null;
    const value = currency === 'USD' ? price : price * usdToArsRate;
    const symbol = currency === 'USD' ? '$' : '$';
    const locale = currency === 'USD' ? 'en-US' : 'es-AR';
    const fractionDigits = currency === 'USD' ? 2 : 0;
    
    return `${symbol}${value.toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
  }

  return (
    <motion.div 
      className="container mx-auto px-4 pt-2 pb-8 flex flex-col items-center gap-4 md:gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
        <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              <span role="img" aria-label="device icon" className="mr-2">{emoji}</span> {model.brand} {model.name}
            </h1>
            <h2 className="mt-1 text-base text-primary font-semibold text-center">
                {pricingOption.title}
            </h2>
        </div>

      {pricingOption.isFree ? (
          <div className="text-center my-6">
              <p className="text-5xl font-bold text-green-500 tracking-wider">GRATIS!</p>
          </div>
      ) : pricingOption.price === undefined ? (
        <div className="text-center my-6">
            <p className="text-xl font-bold text-muted-foreground">Precio a consultar</p>
            <p className="text-sm text-muted-foreground">Contacta con nosotros para obtener una cotización.</p>
        </div>
      ) : pricingOption.price === null ? (
         <div className="text-center my-6">
            <p className="text-xl font-bold text-muted-foreground">En construcción 🚧</p>
            <p className="text-sm text-muted-foreground">Este precio estará disponible próximamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
            <Card 
              className={cn(
                  "rounded-xl p-2 text-center border-2 cursor-pointer bg-card",
                  selectedCurrency === 'USD' ? 'border-primary' : 'border-border/50'
              )}
              onClick={() => setSelectedCurrency('USD')}
              >
              <p className="font-semibold text-primary text-sm flex items-center justify-center gap-2">
                  <GlobeIcon /> Dólares
              </p>
              <div className="flex justify-center items-end gap-1">
                 {pricingOption.originalPrice !== undefined && (
                   <span className="text-sm text-muted-foreground line-through">
                     {renderPrice(pricingOption.originalPrice, 'USD')}
                   </span>
                 )}
                 <p className="text-xl font-bold text-foreground leading-none">
                     {renderPrice(pricingOption.price, 'USD')}
                 </p>
              </div>
               {pricingOption.discountPercentage && (
                  <div className="flex justify-center items-center gap-2 mt-1">
                    <Badge variant="destructive" className="text-xs">{pricingOption.discountPercentage}% OFF</Badge>
                    <span className="text-sm">😉</span>
                  </div>
               )}
            </Card>
            <Card 
              className={cn(
                  "rounded-xl p-2 text-center border-2 cursor-pointer bg-card",
                  selectedCurrency === 'ARS' ? 'border-primary' : 'border-border/50'
              )}
              onClick={() => setSelectedCurrency('ARS')}
              >
              <p className="font-semibold text-primary text-sm flex items-center justify-center gap-2"><ArgentinaFlag /> Pesos Argentinos</p>
              <div className="flex justify-center items-end gap-1">
                 {pricingOption.originalPrice !== undefined && (
                   <span className="text-sm text-muted-foreground line-through">
                     {renderPrice(pricingOption.originalPrice, 'ARS')}
                   </span>
                 )}
                 <p className="text-xl font-bold text-foreground leading-none">
                     {renderPrice(pricingOption.price, 'ARS')}
                 </p>
              </div>
              {pricingOption.discountPercentage && (
                  <div className="flex justify-center items-center gap-2 mt-1">
                    <Badge variant="destructive" className="text-xs">{pricingOption.discountPercentage}% OFF</Badge>
                    <span className="text-sm">😉</span>
                  </div>
               )}
            </Card>
        </div>
      )}
      
      {pricingOption.time && (
         <div className="text-center">
            <p className="font-semibold text-muted-foreground text-xs">Tiempo estimado de entrega</p>
            <p className="text-sm font-bold text-foreground">{pricingOption.time}</p>
         </div>
      )}

      {!appliedCoupon && !pricingOption.isFree && pricingOption.price && !pricingOption.discountPercentage && (
          <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="coupon">¿Tienes un cupón?</Label>
              <div className="flex gap-2">
                  <Input 
                      id="coupon"
                      placeholder="Ingresa tu código"
                      value={couponCode}
                      onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          if (couponError) setCouponError(null);
                      }}
                      className="uppercase"
                  />
                  <Button variant="cta" onClick={handleApplyCoupon} disabled={isCheckingCoupon}>
                      {isCheckingCoupon ? <Loader2 className="animate-spin" /> : "Aplicar"}
                  </Button>
              </div>
              {couponError && <p className="text-sm text-destructive">{couponError}</p>}
          </div>
      )}

      {appliedCoupon && (
          <div className="w-full max-w-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700">
             <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                     <Check className="h-5 w-5 text-green-600 dark:text-green-400"/>
                     <p className="font-medium text-green-800 dark:text-green-300">
                         Cupón <span className="font-bold">{appliedCoupon.code}</span> aplicado!
                     </p>
                 </div>
                 <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 dark:text-green-400" onClick={handleRemoveCoupon}>
                     <X className="h-4 w-4"/>
                 </Button>
             </div>
          </div>
      )}

      <div className="mt-4 flex flex-col items-center gap-4 w-full max-w-sm">
        <Button size="lg" className="w-full rounded-full text-lg font-semibold" onClick={handleUnlockNow} >
          <span role="img" aria-label="unlock icon" className="mr-2">🔓</span> Desbloquear Ahora!
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.back()} className="w-full rounded-full text-lg border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary">
          <span role="img" aria-label="back">👈🏻</span>&nbsp;Atrás
        </Button>
      </div>

        {paymentMethods.length > 0 && (
          <div className="w-full max-w-2xl text-center">
              <h3 className="text-lg font-semibold text-foreground mb-4">Aceptamos estos medios de pago</h3>
              <div className="flex flex-wrap justify-center items-center gap-4">
                  {paymentMethods.map(method => {
                      const country = countries.find(c => c.id === method.countryId);
                      const Flag = country?.flag;
                      const shouldShowFlag = country && Flag && country.id !== 'global';

                      return (
                          <div key={method.id} className="flex items-center gap-2 p-2 rounded-lg">
                            {method.emoji && <span className="text-lg">{method.emoji}</span>}
                            {shouldShowFlag && <Flag />}
                            <span className="font-medium text-sm">{method.name}</span>
                          </div>
                      )
                  })}
              </div>
          </div>
        )}

        <AnimatePresence>
          {showPriceMatchButton && !pricingOption.isFree && pricingOption.price !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4"
            >
              <MissingInfoDialog 
                 handleMissingInfo={handleMissingInfo}
                 errors={errors}
                 handleInputChange={handleInputChange}
                 publicationLink={publicationLink}
                 groupLink={groupLink}
                 whatsappNumber={whatsappNumber}
                 telegram={telegram}
                 selectedCountryId={selectedCountryId}
                 setSelectedCountryId={setSelectedCountryId}
              />
            </motion.div>
          )}
        </AnimatePresence>
    </motion.div>
  );
}
