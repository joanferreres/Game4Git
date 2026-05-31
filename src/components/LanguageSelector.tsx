import React from 'react';
import { Globe } from "lucide-react";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { getLocaleFromPathname, getLocalizedPath, type SupportedLocale } from "@/lib/localizedRoutes";

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLocale = getLocaleFromPathname(location.pathname);
  
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "ca", name: "Català" },
    { code: "fr", name: "Français" }
  ];
  
  const handleLanguageChange = async (lang: string) => {
    const nextLocale = lang as SupportedLocale;
    const nextPathname = getLocalizedPath(location.pathname, nextLocale);
    const nextUrl = `${nextPathname}${location.search}${location.hash}`;
    const currentUrl = `${location.pathname}${location.search}${location.hash}`;

    if (nextUrl === currentUrl) {
      return;
    }

    try {
      await i18n.changeLanguage(nextLocale);
      navigate(nextUrl);
    } catch (err) {
      console.error('Error changing language', err);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "relative")}
        >
          <Globe className="h-4 w-4 text-foreground" />
          <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-primary text-primary-foreground text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center uppercase">
            {currentLocale}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={currentLocale === lang.code ? "bg-muted" : ""}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector; 
