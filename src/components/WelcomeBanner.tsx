import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Play, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WelcomeBannerProps {
  onStart?: () => void;
  onOpenChallenges?: () => void;
  onDismissWithoutCta?: () => void;
}

/**
 * Banner informativo que se muestra al iniciar la aplicación
 * Se mostrará solo una vez por sesión usando sessionStorage.
 */
const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onStart, onOpenChallenges, onDismissWithoutCta }) => {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.sessionStorage.getItem("welcomeBannerDismissed");
  });
  const { t } = useTranslation();

  const closeBanner = (withCta: boolean) => {
    setOpen(false);
    sessionStorage.setItem("welcomeBannerDismissed", "true");
    if (withCta) {
      sessionStorage.setItem("welcomeBannerDismissedWithCta", "true");
    } else {
      onDismissWithoutCta?.();
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) closeBanner(false);
    else setOpen(nextOpen);
  };

  const handleStart = () => {
    closeBanner(true);
    onStart?.();
  };

  const handleTryChallenge = () => {
    closeBanner(true);
    onOpenChallenges?.();
    onStart?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg border-2 border-primary p-4 sm:p-6 [&>button:last-of-type]:hidden">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="absolute right-2 top-2 h-10 w-10"
          onClick={() => closeBanner(false)}
          aria-label={t("common.close", "Close")}
        >
          <X className="h-4 w-4" />
        </Button>
        <Info className="h-6 w-6 sm:h-8 sm:w-8 text-primary absolute left-4 sm:left-6 top-4 sm:top-6" />
        <DialogHeader className="pl-10 sm:pl-12">
          <DialogTitle className="text-base sm:text-lg font-bold pr-8">
            {t("welcome.title", "Welcome to Git Game")}
          </DialogTitle>
          <DialogDescription className="text-sm space-y-2 text-muted-foreground">
            <p>{t("welcome.introShortImproved", "Edit a line of code and make your first commit in under 30 seconds. Or try a guided challenge.")}</p>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-wrap gap-2 justify-end pl-10 sm:pl-12">
          <Button variant="outline" size="sm" type="button" onClick={() => closeBanner(false)}>
            {t("common.close", "Close")}
          </Button>
          <Button type="button" onClick={handleStart} variant="secondary" size="sm">
            {t("welcome.firstCommitCta", "Make your first commit")}
          </Button>
          <Button type="button" onClick={handleTryChallenge} className="bg-primary hover:bg-primary/90">
            <Play className="h-3.5 w-3.5 mr-1.5" />
            {t("welcome.tryFirstChallenge", "Try first challenge")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeBanner; 
