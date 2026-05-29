import { Link, useLocation } from "react-router-dom";
import LanguageSelector from '@/components/LanguageSelector';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/localizedRoutes";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const homePath = localizePath("/");

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <main id="main-content" className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">{t('errors.notFound', 'Oops! Page not found')}</p>
        <Link to={homePath} className="text-blue-500 hover:text-blue-700 underline">
          {t('common.backToHome', 'Return to Home')}
        </Link>
      </main>
    </div>
  );
};

export default NotFound;
