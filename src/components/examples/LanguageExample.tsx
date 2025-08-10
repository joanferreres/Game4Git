import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LanguageExample: React.FC = () => {
  const { t, currentLanguage } = useLanguage();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('common.language')}</CardTitle>
        <CardDescription>
          {t('common.selectLanguage')} - Current: {currentLanguage}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('common.selectLanguage')}:
          </label>
          <LanguageSelector variant="select" />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">
            Dropdown version:
          </label>
          <LanguageSelector variant="dropdown" />
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Translated examples:</h4>
          <ul className="space-y-1 text-sm">
            <li>• {t('common.save')}</li>
            <li>• {t('common.cancel')}</li>
            <li>• {t('common.loading')}</li>
            <li>• {t('common.success')}</li>
            <li>• {t('common.error')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
