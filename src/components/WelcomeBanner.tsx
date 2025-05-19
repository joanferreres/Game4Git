import React, { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Banner informativo que se muestra al iniciar la aplicación
 * Se mostrará cada vez que se cargue la página.
 */
const WelcomeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation();

  // Función para cerrar el banner (solo para la sesión actual del componente)
  const closeBanner = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <Alert className="bg-background border-2 border-primary relative p-4 sm:p-6 md:p-8 shadow-xl rounded-xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={closeBanner}
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <Info className="h-6 w-6 sm:h-8 sm:w-8 text-primary absolute left-4 sm:left-6 top-4 sm:top-6" />
          
          <div className="pl-8 sm:pl-10 md:pl-12">
            <AlertTitle className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">
              {t('welcome.title', 'Bienvenido a Git Game')}
            </AlertTitle>
            
            <AlertDescription className="text-sm sm:text-base space-y-3 sm:space-y-4 text-muted-foreground">
              <p>{t('welcome.intro', 'Esta aplicación te ayuda a aprender y practicar con Git de forma visual e interactiva.')}</p>
              
              <h3 className="font-medium text-foreground">{t('welcome.features', 'Características principales:')}</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('welcome.feature1', 'Visualización gráfica del historial de Git')}</li>
                <li>{t('welcome.feature2', 'Creación y gestión de ramas')}</li>
                <li>{t('welcome.feature3', 'Simulación de conflictos y su resolución')}</li>
                <li>{t('welcome.feature4', 'Ejercicios prácticos para reforzar conceptos')}</li>
              </ul>
              
              <p>{t('welcome.getStarted', 'Para comenzar, prueba a modificar el código, confirmar cambios, crear ramas y explorar todas las funcionalidades de Git.')}</p>
            </AlertDescription>
            
            <div className="mt-4 sm:mt-6 flex justify-end">
              <Button onClick={closeBanner} className="bg-primary hover:bg-primary/90">
                {t('welcome.startNow', 'Empezar ahora')}
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default WelcomeBanner; 