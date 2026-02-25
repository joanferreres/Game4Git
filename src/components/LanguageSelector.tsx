import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "ca", name: "Català" },
    { code: "fr", name: "Français" }
  ];
  
  const handleLanguageChange = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      // Persist for i18next-browser-languagedetector
      localStorage.setItem('i18nextLng', lang);
    } catch (err) {
      console.error('Error changing language', err);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Globe className="h-4 w-4 text-foreground" />
          <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-primary text-primary-foreground text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center uppercase">
            {i18n.language.substring(0, 2)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={i18n.language.startsWith(lang.code) ? "bg-muted" : ""}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector; 