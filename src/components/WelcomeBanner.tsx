import React, { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Info, Play } from "lucide-react";
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
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const bannerDismissed = sessionStorage.getItem('welcomeBannerDismissed');
    if (!bannerDismissed) {
      setIsVisible(true);
    }
  }, []);

  const closeBanner = (withCta: boolean) => {
    setIsVisible(false);
    sessionStorage.setItem('welcomeBannerDismissed', 'true');
    if (withCta) {
      sessionStorage.setItem('welcomeBannerDismissedWithCta', 'true');
    } else {
      onDismissWithoutCta?.();
    }
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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 sm:p-6">
      <div className="w-full max-w-lg mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <Alert className="bg-background border-2 border-primary relative p-4 sm:p-6 shadow-xl rounded-xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => closeBanner(false)}
            aria-label={t('common.close', 'Close')}
          >
            <X className="h-4 w-4" />
          </Button>

          <Info className="h-6 w-6 sm:h-8 sm:w-8 text-primary absolute left-4 sm:left-6 top-4 sm:top-6" />

          <div className="pl-8 sm:pl-10 md:pl-12">
            <AlertTitle className="text-base sm:text-lg font-bold mb-2">
              {t('welcome.title', 'Welcome to Git Game')}
            </AlertTitle>

            <AlertDescription className="text-sm space-y-2 text-muted-foreground">
              <p>{t('welcome.introShortImproved', 'Edit a line of code and make your first commit in under 30 seconds. Or try a guided challenge.')}</p>
            </AlertDescription>

            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => closeBanner(false)}>
                {t('common.close', 'Close')}
              </Button>
              <Button onClick={handleStart} variant="secondary" size="sm">
                {t('welcome.firstCommitCta', 'Make your first commit')}
              </Button>
              <Button onClick={handleTryChallenge} className="bg-primary hover:bg-primary/90">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                {t('welcome.tryFirstChallenge', 'Try first challenge')}
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default WelcomeBanner; 