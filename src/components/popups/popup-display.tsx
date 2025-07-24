
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPopups } from "@/lib/actions/popups";
import type { Popup, Model } from "@/lib/db/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';

interface PopupDisplayProps {
  model?: Model | null;
  serviceId?: string;
  subServiceId?: string;
  isPreview?: boolean;
  previewPopup?: Popup;
  onPreviewClose?: () => void;
}

export function PopupDisplay({ model, serviceId, subServiceId, isPreview = false, previewPopup, onPreviewClose }: PopupDisplayProps) {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [visiblePopup, setVisiblePopup] = useState<Popup | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (isPreview) return;
    async function fetchPopups() {
      const activePopups = (await getPopups()).filter(p => p.isActive);
      setPopups(activePopups);
    }
    fetchPopups();
  }, [isPreview]);

  const popupToShow = useMemo(() => {
    if (isPreview) return previewPopup || null;
    
    if (popups.length === 0) return null;

    let bestMatch: Popup | null = null;
    let highestSpecificity = -1;

    for (const popup of popups) {
        let currentSpecificity = 0;
        let isMatch = true;

        if (!popup.targetBrandName && !popup.targetServiceId && !popup.targetSubServiceId) {
             currentSpecificity = 0; // Global
        }
        
        if (popup.targetBrandName) {
            if (popup.targetBrandName !== model?.brand) {
                isMatch = false;
            } else {
                currentSpecificity = 1;
            }
        }

        if (isMatch && popup.targetServiceId) {
            if (popup.targetServiceId !== serviceId) {
                isMatch = false;
            } else {
                currentSpecificity = 2;
            }
        }

        if (isMatch && popup.targetSubServiceId) {
            if (popup.targetSubServiceId !== subServiceId) {
                isMatch = false;
            } else {
                currentSpecificity = 3;
            }
        }
        
        if (isMatch && currentSpecificity > highestSpecificity) {
            highestSpecificity = currentSpecificity;
            bestMatch = popup;
        }
    }
    
    // Fallback to global if on home page and no other match found
    if (!bestMatch && pathname === '/' && highestSpecificity === -1) {
       const globalPopup = popups.find(p => !p.targetServiceId && !p.targetSubServiceId && !p.targetBrandName) || null;
       return globalPopup;
    }
    
    return bestMatch;
  }, [popups, model, serviceId, subServiceId, isPreview, previewPopup, pathname]);
  
  useEffect(() => {
    if (popupToShow) {
      const show = () => {
        setVisiblePopup(popupToShow);
        if (popupToShow.showLastUpdated) {
          const today = new Date();
          const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
          setCurrentDate(new Intl.DateTimeFormat('es-ES', options).format(today));
        }
        if (isPreview) {
            if (popupToShow.hasCountdown && popupToShow.countdownSeconds) {
                setCountdown(popupToShow.countdownSeconds);
            }
        } else {
            setShowDialog(true);
            if (popupToShow.hasCountdown && popupToShow.countdownSeconds) {
                setCountdown(popupToShow.countdownSeconds);
            }
        }
      }
      
      if (isPreview) {
        show();
        return;
      }

      const timer = setTimeout(show, (popupToShow.delaySeconds || 0) * 1000);

      return () => clearTimeout(timer);
    } else {
        setShowDialog(false);
    }
  }, [popupToShow, isPreview]);
  
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown(prev => (prev ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        return null;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };
  const youtubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(visiblePopup?.mediaUrl || previewPopup?.mediaUrl), [visiblePopup, previewPopup]);

  const animationVariants = {
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    slideIn: { initial: { y: 50, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 50, opacity: 0 } },
    zoomIn: { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 } },
    rotateIn: { initial: { opacity: 0, rotate: -90, scale: 0.8 }, animate: { opacity: 1, rotate: 0, scale: 1 }, exit: { opacity: 0, rotate: 90, scale: 0.8 } },
    slideUp: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
    flipIn: { initial: { opacity: 0, rotateY: 90 }, animate: { opacity: 1, rotateY: 0 }, exit: { opacity: 0, rotateY: -90 } },
  };

  const currentPopupForRender = isPreview ? previewPopup : visiblePopup;

  if (!currentPopupForRender) {
    return null;
  }
  
  const currentAnimation = animationVariants[currentPopupForRender.animationEffect || 'fadeIn'];
  const isCountdownActive = countdown !== null && countdown > 0;
  
  const descriptions = Array.isArray(currentPopupForRender.description) 
    ? currentPopupForRender.description 
    : (currentPopupForRender.description ? [currentPopupForRender.description] : []);
    
  if (isPreview) {
      return (
         <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={currentAnimation}
            transition={{ duration: 0.4 }}
            className="rounded-lg bg-background p-6 border-2 border-primary"
            >
            <DialogHeader>
                <DialogTitle className="sr-only">Vista Previa del Pop-up</DialogTitle>
                <div 
                    className={cn("text-2xl md:text-4xl font-bold mb-4")}
                    dangerouslySetInnerHTML={{ __html: currentPopupForRender.title || "" }}
                />
            </DialogHeader>
            <div className="text-base md:text-lg space-y-4 text-foreground">
                {descriptions.map((desc, index) => (
                    <div key={index} dangerouslySetInnerHTML={{ __html: desc }} />
                ))}
                {currentPopupForRender.mediaType === 'youtube' && youtubeEmbedUrl && (
                    <div className="w-full flex justify-center mt-4">
                        <div className="aspect-video w-full max-w-lg rounded-md overflow-hidden">
                            <iframe
                                src={youtubeEmbedUrl}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </div>
                )}
                 {currentPopupForRender.showLastUpdated && currentDate && (
                    <p className="text-xs text-muted-foreground italic mt-4">
                        Fecha de actualización {currentDate}
                    </p>
                )}
            </div>
             <div className="mt-4 flex justify-end">
                {currentPopupForRender.hasCountdown ? (
                     <Button onClick={onPreviewClose} disabled={isCountdownActive}>
                        {isCountdownActive ? `Cerrar en ${countdown}s` : "Cerrar"}
                    </Button>
                ) : (
                    <Button onClick={onPreviewClose}>Cerrar</Button>
                )}
             </div>
        </motion.div>
      )
  }

  return (
    <AnimatePresence>
        {showDialog && (
             <Dialog 
                open={showDialog} 
                onOpenChange={(open) => {
                    if (isCountdownActive && !open) return;
                    setShowDialog(open);
                }}
                modal={true}
             >
                <DialogContent 
                    className="sm:max-w-5xl"
                    onEscapeKeyDown={(e) => {
                      if (currentPopupForRender.hasCountdown && !isPreview && isCountdownActive) {
                        e.preventDefault();
                      }
                    }}
                    onInteractOutside={(e) => {
                       if (currentPopupForRender.hasCountdown && !isPreview && isCountdownActive) {
                         e.preventDefault();
                       }
                    }}
                >
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={currentAnimation}
                      transition={{ duration: 0.4 }}
                    >
                        <DialogHeader>
                        <DialogTitle 
                          className={cn("text-2xl md:text-4xl font-bold mb-4")}
                          dangerouslySetInnerHTML={{ __html: currentPopupForRender.title }}
                        />
                        <DialogDescription asChild>
                            <div className="text-base md:text-lg space-y-4 text-foreground">
                               {descriptions.map((desc, index) => (
                                  <div key={index} dangerouslySetInnerHTML={{ __html: desc }} />
                               ))}
                               {currentPopupForRender.mediaType === 'youtube' && youtubeEmbedUrl && (
                                   <div className="w-full flex justify-center mt-4">
                                       <div className="aspect-video w-full max-w-lg rounded-md overflow-hidden">
                                           <iframe
                                               src={youtubeEmbedUrl}
                                               title="YouTube video player"
                                               frameBorder="0"
                                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                               allowFullScreen
                                               className="w-full h-full"
                                           ></iframe>
                                       </div>
                                   </div>
                               )}
                               {currentPopupForRender.showLastUpdated && currentDate && (
                                  <p className="text-xs text-muted-foreground italic mt-4">
                                      Fecha de actualización {currentDate}
                                  </p>
                                )}
                            </div>
                        </DialogDescription>
                        </DialogHeader>
                         <div className="mt-4 flex justify-end">
                            {currentPopupForRender.hasCountdown ? (
                                <DialogClose asChild>
                                    <Button disabled={isCountdownActive}>
                                        {isCountdownActive ? `Cerrar en ${countdown}s` : "Cerrar"}
                                    </Button>
                                </DialogClose>
                            ) : (
                               <DialogClose asChild>
                                    <Button>Cerrar</Button>
                                </DialogClose>
                            )}
                         </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        )}
    </AnimatePresence>
  );
}
