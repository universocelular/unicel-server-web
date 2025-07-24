
import type { ReactNode, ComponentType, SVGProps } from "react";

export interface Brand {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
  brand: string;
  category?: 'Phone' | 'Mac' | 'iPad' | 'Watch';
  // Stores price overrides for this model. Key is serviceId or subServiceId.
  // Value can be a number, or null for "Under Construction".
  // For SIM unlock (serviceId '4'), value is another Record mapping carrierId to price.
  priceOverrides?: Record<string, number | null | Record<string, number | null>> | null; 
}

export interface SubService {
  id: string;
  name:string;
  description: string;
  price: number; // This is now the default/base price
  iconSvg?: string;
  imageUrl?: string;
  dataAiHint?: string;
  emoji?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price?: number; // Default/base price, optional if sub-services exist
  subServices?: SubService[];
  iconSvg?: string;
  emoji?: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export interface Country {
  id: string;
  name: string;
  flag: ComponentType<SVGProps<SVGSVGElement>>;
  phoneCode: string;
}

export interface Carrier {
  id: string;
  name: string;
  countryId: string;
  logo?: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  // Optional fields for specific targeting
  brandName?: string;
  modelId?: string;
  serviceId?: string;
  subServiceId?: string;
}

export interface FreeServiceSetting {
  id: string;
  modelId: string;
  serviceId: string;
  subServiceId?: string;
  // For display purposes in admin
  modelName: string;
  serviceName: string;
}

export interface DiscountSetting {
    id: string;
    isActive: boolean;
    discountPercentage: number;
    brandName?: string;
    modelName?: string;
    serviceId?: string;
    subServiceId?: string;
}

export interface Settings {
    isDiscountModeActive?: boolean;
    discounts?: DiscountSetting[];
    isFreeModeActive?: boolean;
    freeServices?: FreeServiceSetting[];
    usdToArsRate?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  countryId: string;
  emoji?: string;
  isActive: boolean;
}

export interface Popup {
  id: string;
  title: string;
  description: string[]; // Changed to array of strings
  mediaType?: 'youtube' | 'image' | 'audio';
  mediaUrl?: string; // Single URL now
  targetBrandName?: string;
  targetServiceId?: string;
  targetSubServiceId?: string;
  hasCountdown: boolean;
  countdownSeconds?: number;
  delaySeconds?: number;
  animationEffect?: 'fadeIn' | 'slideIn' | 'zoomIn' | 'rotateIn' | 'slideUp' | 'flipIn';
  showLastUpdated?: boolean;
  isActive: boolean;
}
