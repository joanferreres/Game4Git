import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'select' | 'dropdown';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'dropdown',
  className = ''
}) => {
  const { changeLanguage, getCurrentLanguage, getAvailableLanguages, t } = useLanguage();
  const currentLanguage = getCurrentLanguage();
  const availableLanguages = getAvailableLanguages();

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  if (variant === 'select') {
    return (
      <Select value={currentLanguage} onValueChange={changeLanguage}>
        <SelectTrigger className={`w-[180px] ${className}`}>
          <SelectValue placeholder={t('common.selectLanguage') || 'Select language'} />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{currentLang?.flag}</span>
          <span className="hidden md:inline ml-1">{currentLang?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={currentLanguage === language.code ? 'bg-accent' : ''}
          >
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
              {currentLanguage === language.code && (
                <span className="ml-auto text-xs">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
