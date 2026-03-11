import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, Code, Copy, Lightbulb, Shield, Zap, Terminal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LanguageSelector from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';
import { useLocalizedPath } from '@/lib/localizedRoutes';

const ValgrindLearning: React.FC = () => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const homePath = localizePath("/");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Error types data from translations
  const errorTypes = {
    memoryLeaks: {
      title: t('valgrind.errorTypes.memoryLeaks.title'),
      description: t('valgrind.errorTypes.memoryLeaks.description'),
      example: t('valgrind.errorTypes.memoryLeaks.example'),
      explanation: t('valgrind.errorTypes.memoryLeaks.explanation')
    },
    invalidAccess: {
      title: t('valgrind.errorTypes.invalidAccess.title'),
      description: t('valgrind.errorTypes.invalidAccess.description'),
      example: t('valgrind.errorTypes.invalidAccess.example'),
      explanation: t('valgrind.errorTypes.invalidAccess.explanation')
    },
    uninitializedValue: {
      title: t('valgrind.errorTypes.uninitializedValue.title'),
      description: t('valgrind.errorTypes.uninitializedValue.description'),
      example: t('valgrind.errorTypes.uninitializedValue.example'),
      explanation: t('valgrind.errorTypes.uninitializedValue.explanation')
    },
    doubleFree: {
      title: t('valgrind.errorTypes.doubleFree.title'),
      description: t('valgrind.errorTypes.doubleFree.description'),
      example: t('valgrind.errorTypes.doubleFree.example'),
      explanation: t('valgrind.errorTypes.doubleFree.explanation')
    },
    mismatchedFree: {
      title: t('valgrind.errorTypes.mismatchedFree.title'),
      description: t('valgrind.errorTypes.mismatchedFree.description'),
      example: t('valgrind.errorTypes.mismatchedFree.example'),
      explanation: t('valgrind.errorTypes.mismatchedFree.explanation')
    },
    overlappingMemory: {
      title: t('valgrind.errorTypes.overlappingMemory.title'),
      description: t('valgrind.errorTypes.overlappingMemory.description'),
      example: t('valgrind.errorTypes.overlappingMemory.example'),
      explanation: t('valgrind.errorTypes.overlappingMemory.explanation')
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Handle copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="container min-h-screen max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col">
      <SeoHead page="valgrind" />
      <header className="mb-4 sm:mb-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={homePath}
            className="inline-flex items-center justify-center text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors sm:justify-start"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {t('common.backToHome', 'Back to Home')}
          </Link>
          <div className="flex items-center justify-center gap-2 sm:justify-end">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
        <div className="mt-6 text-center sm:mt-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{t('valgrind.pageTitle')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 md:mt-2">
            {t('valgrind.intro.subtitle', 'Memory error detection and profiling toolkit')}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full">
        {/* Tabs */}
        <Tabs
          defaultValue="introduction"
          className="w-full"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 h-auto bg-muted/20 rounded-lg">
              <TabsTrigger
                value="introduction"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
              >
                <Lightbulb className="h-4 w-4 flex-shrink-0" />
                <span>{t('valgrind.tabs.introduction', 'Introduction')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="errors"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{t('valgrind.tabs.errors', 'Error Types')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="commands"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
              >
                <Terminal className="h-4 w-4 flex-shrink-0" />
                <span>{t('valgrind.tabs.commands', 'Commands')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="best-practices"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{t('valgrind.tabs.practices', 'Best Practices')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="cheatsheet"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
              >
                <Code className="h-4 w-4 flex-shrink-0" />
                <span>{t('valgrind.tabs.cheatsheet', 'Cheat Sheet')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Introduction Tab */}
          <TabsContent value="introduction">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Terminal className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{t('valgrind.intro.whatIs', 'What is Valgrind?')}</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      {t('valgrind.intro.subtitle', 'Memory error detection and profiling toolkit')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p>
                    {t('valgrind.intro.description')}
                  </p>

                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900/30">
                      <h3 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t('valgrind.intro.detectTitle', 'What can Valgrind detect?')}
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{t('valgrind.intro.detect.memoryLeaks', 'Memory leaks')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{t('valgrind.intro.detect.invalidAccess', 'Invalid or freed memory access')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{t('valgrind.intro.detect.uninit', 'Use of uninitialized memory')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{t('valgrind.intro.detect.cache', 'Cache performance issues')}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                      <h3 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {t('valgrind.intro.whenTitle', 'When to use Valgrind?')}
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                          <span>{t('valgrind.intro.when.leaks', 'When your program has unexpected memory leaks')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                          <span>{t('valgrind.intro.when.segfault', 'When experiencing segmentation faults')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                          <span>{t('valgrind.intro.when.optimize', 'To optimize your application\'s memory usage')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-purple-500" />
                      {t('valgrind.intro.proTip')}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded text-sm font-mono">
                        valgrind --leak-check=full ./tu_programa
                      </code>
                      <button
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                        onClick={() => handleCopy('valgrind --leak-check=full ./tu_programa', 'valgrind-init')}
                        aria-label={t('common.copyCommand', 'Copy command')}
                      >
                        {copiedCommand === 'valgrind-init' ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('valgrind.cheatsheet.tips.compileDebug', 'Compile your program with the -g flag to include debug information.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{t('valgrind.errorTypes.title')}</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      {t('valgrind.errorTypes.description')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="mb-6">
                    {t('valgrind.errorTypes.description')}
                  </p>

                  <div className="space-y-6">
                    {Object.entries(errorTypes).map(([key, error]) => (
                      <div key={key} className="p-5 border rounded-lg bg-white dark:bg-gray-800/30 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              {error.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {error.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="relative">
                            <pre className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-md overflow-x-auto text-sm">
                              <code>{error.example}</code>
                            </pre>
                            <button
                              onClick={() => handleCopy(error.example, `${key}-example`)}
                              className="absolute top-2 right-2 p-1.5 rounded-md bg-white/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                              aria-label="Copy code"
                            >
                              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>

                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-900/30">
                            <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
                              <Lightbulb className="h-3.5 w-3.5" />
                              {t('common.whatsHappening')}
                            </h4>
                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                              {error.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Example Tab */}
          <TabsContent value="code-example">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-md overflow-x-auto text-sm">
                    <code>{`int *arr = malloc(5 * sizeof(int));
arr[5] = 10;  // Buffer overflow - invalid write
int val = arr[5];  // Invalid read
free(arr);
return 0;`}</code>
                  </pre>

                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-900/30">
                    <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5" />
                      {t('common.whatsHappening')}
                    </h4>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      {t('valgrind.codeExample.explanation')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Terminal className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{t('valgrind.commands.header.title', 'Basic Commands')}</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      {t('valgrind.commands.header.description', 'Essential commands to start using Valgrind effectively')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="mb-6">
                    {t('valgrind.commands.intro')}
                  </p>

                  <div className="space-y-8">
                    {/* Análisis Básico */}
                    <div className="p-5 border rounded-lg bg-white dark:bg-gray-800/30 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Zap className="h-5 w-5 text-blue-500" />
                            {t('valgrind.commands.basic.title', 'Basic Analysis')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('valgrind.commands.basic.description', 'Run a basic memory analysis of your program')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy('valgrind ./tu_programa', 'basic')}
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={t('common.copyCommand', 'Copy command')}
                          aria-label={t('common.copyCommand', 'Copy command')}
                        >
                          {copiedCommand === 'basic' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="mt-4">
                        <div className="relative">
                          <pre className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-md overflow-x-auto text-sm">
                            <code>valgrind ./tu_programa</code>
                          </pre>
                        </div>

                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-900/30">
                          <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5" />
                            {t('valgrind.commands.basic.whenTitle', 'When to use?')}
                          </h4>
                          <ul className="mt-1.5 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                              <span>{t('valgrind.commands.basic.when.0', 'For a quick scan of memory issues')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                              <span>{t('valgrind.commands.basic.when.1', 'As a first step in memory debugging')}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Detección de Fugas */}
                    <div className="p-5 border rounded-lg bg-white dark:bg-gray-800/30 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-500" />
                            {t('valgrind.commands.leak.title', 'Memory Leak Detection')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('valgrind.commands.leak.description', 'Identify and analyze memory leaks in your program')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy('valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes ./tu_programa', 'leak-check')}
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={t('common.copyCommand', 'Copy command')}
                          aria-label={t('common.copyCommand', 'Copy command')}
                        >
                          {copiedCommand === 'leak-check' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="mt-4">
                        <div className="relative">
                          <pre className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-md overflow-x-auto text-sm">
                            <code>valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes ./tu_programa</code>
                          </pre>
                        </div>

                        <div className="mt-3 grid md:grid-cols-2 gap-4">
                          <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded border border-green-100 dark:border-green-900/20">
                            <h4 className="font-medium text-sm text-green-800 dark:text-green-200 flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5" />
                              {t('valgrind.commands.leak.optionsTitle', 'Included options:')}
                            </h4>
                            <ul className="mt-1.5 text-sm text-green-700 dark:text-green-300 space-y-1">
                              <li className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                <span><code className="bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded">--leak-check=full</code>: {t('valgrind.commands.leak.options.leakCheckFull', 'Detailed leak search')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                <span><code className="bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded">--show-leak-kinds=all</code>: {t('valgrind.commands.leak.options.showLeakKinds', 'Show all types of leaks')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                <span><code className="bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded">--track-origins=yes</code>: {t('valgrind.commands.leak.options.trackOrigins', 'Track origins of uninitialized values')}</span>
                              </li>
                            </ul>
                          </div>

                          <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-medium text-sm text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {t('valgrind.commands.leak.noteTitle', 'Important note:')}
                            </h4>
                            <p className="mt-1.5 text-sm text-amber-700 dark:text-amber-300">
                              {t('valgrind.cheatsheet.tips.compileDebug', 'Compile your program with the -g flag to include debug information.')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comando Adicional */}
                    <div className="p-5 border rounded-lg bg-white dark:bg-gray-800/30 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Code className="h-5 w-5 text-purple-500" />
                            {t('valgrind.commands.perf.title', 'Performance Analysis')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('valgrind.commands.perf.description', 'Identify performance bottlenecks in your code')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy('valgrind --tool=callgrind ./tu_programa', 'perf-check')}
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={t('common.copyCommand', 'Copy command')}
                          aria-label={t('common.copyCommand', 'Copy command')}
                        >
                          {copiedCommand === 'perf-check' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="mt-4">
                        <div className="relative">
                          <pre className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-md overflow-x-auto text-sm">
                            <code>valgrind --tool=callgrind ./tu_programa</code>
                          </pre>
                        </div>

                        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded border border-purple-100 dark:border-purple-900/20">
                          <h4 className="font-medium text-sm text-purple-800 dark:text-purple-200 flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5" />
                            {t('valgrind.commands.perf.tipTitle', 'Usage tip:')}
                          </h4>
                          <p className="mt-1.5 text-sm text-purple-700 dark:text-purple-300">
                            {t('valgrind.commands.perf.tipText', 'Use kcachegrind to visualize Callgrind results with a graphical interface:')}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                              kcachegrind callgrind.out.1234
                            </code>
                            <button
                              onClick={() => handleCopy('kcachegrind callgrind.out.1234', 'kcachegrind')}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title={t('common.copyCommand', 'Copy command')}
                              aria-label={t('common.copyCommand', 'Copy command')}
                            >
                              {copiedCommand === 'kcachegrind' ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Best Practices Tab */}
          <TabsContent value="best-practices">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{t('valgrind.bestPractices.title', 'Best Practices')}</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400 whitespace-pre-line">
                      {t('valgrind.bestPractices.description', 'Recommended practices to use Valgrind effectively')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    {t('valgrind.bestPractices.practicesTitle', 'Recommended Practices')}
                  </h3>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => {
                      const titleKey = `valgrind.bestPractices.practice${n}.title` as const;
                      const descKey = `valgrind.bestPractices.practice${n}.description` as const;
                      const title = t(titleKey);
                      // If title resolves to the key itself, skip rendering
                      if (!title || title === titleKey) return null;
                      return (
                        <div key={n} className="p-4 rounded-lg border bg-white dark:bg-gray-800/30">
                          <h4 className="font-semibold text-sm mb-1">{title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t(descKey)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cheatsheet">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{t('valgrind.cheatsheet.title', 'Valgrind Cheat Sheet')}</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      {t('valgrind.cheatsheet.description', 'Essential Valgrind commands and options')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-lg">
                      <h3 className="font-medium text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
                        <Terminal className="h-5 w-5" />
                        {t('valgrind.cheatsheet.basic.title', 'Basic Commands')}
                      </h3>
                      <div className="mt-3 space-y-3">
                        {[
                          { command: 'valgrind ./program' },
                          { command: 'valgrind --leak-check=full ./program' },
                          { command: 'valgrind --track-origins=yes ./program' },
                          { command: 'valgrind --tool=memcheck --leak-check=full ./program' },
                          { command: 'valgrind --tool=cachegrind ./program' },
                          { command: 'valgrind --tool=callgrind ./program' }
                        ].map((item, index) => (
                          <div key={index} className="group relative">
                            <div className="flex items-start gap-2">
                              <code className="flex-1 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-2 rounded-md text-sm font-mono text-indigo-800 dark:text-indigo-200 overflow-x-auto">
                                {item.command}
                              </code>
                              <button
                                onClick={() => handleCopy(item.command, `cmd-${index}`)}
                                className="p-1.5 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                                title={t('common.copyCommand', 'Copy command')}
                                aria-label={t('common.copyCommand', 'Copy command')}
                              >
                                {copiedCommand === `cmd-${index}` ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                              {t(`valgrind.cheatsheet.basic.items.${index}.desc`)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 rounded-lg">
                      <h3 className="font-medium text-purple-800 dark:text-purple-200 flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        {t('valgrind.cheatsheet.options.title', 'Common Options')}
                      </h3>
                      <div className="mt-3 space-y-4">
                        <div>
                          <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300">{t('valgrind.commonOptions.memoryOptions', 'Memory Options')}</h4>
                          <ul className="mt-2 space-y-2 text-sm">
                            {[
                              { option: '--leak-check=full', desc: 'Show details of memory leaks' },
                              { option: '--show-leak-kinds=all', desc: 'Show all types of leaks' },
                              { option: '--track-origins=yes', desc: 'Track origin of uninitialized values' },
                              { option: '--leak-resolution=high', desc: 'Improve leak tracking precision' },
                              { option: '--num-callers=<n>', desc: 'Show n stack frames in reports' }
                            ].map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-purple-600 dark:text-purple-400">
                                <code className="bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded text-xs">
                                  {item.option}
                                </code>
                                <span className="text-xs">
                                  {[
                                    t('valgrind.commonOptions.memoryOptionsList.0.description', 'Show details of memory leaks'),
                                    t('valgrind.commonOptions.memoryOptionsList.1.description', 'Show all types of leaks'),
                                    t('valgrind.commonOptions.memoryOptionsList.2.description', 'Track origin of uninitialized values'),
                                    t('valgrind.commonOptions.memoryOptionsList.3.description', 'Improve leak tracking precision'),
                                    t('valgrind.commonOptions.memoryOptionsList.4.description', 'Show n stack frames in reports')
                                  ][i]}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300">{t('valgrind.commonOptions.outputOptions', 'Output Options')}</h4>
                          <ul className="mt-2 space-y-2 text-sm">
                            {[
                              { option: '--log-file=filename', desc: 'Save output to a file' },
                              { option: '--quiet', desc: 'Only show important errors' },
                              { option: '--verbose', desc: 'Show additional information' },
                              { option: '--trace-children=yes', desc: 'Trace child processes' },
                              { option: '--track-fds=yes', desc: 'Show open file descriptors' }
                            ].map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-purple-600 dark:text-purple-400">
                                <code className="bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded text-xs">
                                  {item.option}
                                </code>
                                <span className="text-xs">
                                  {[
                                    t('valgrind.commonOptions.outputOptionsList.0.description', 'Save output to a file'),
                                    t('valgrind.commonOptions.outputOptionsList.1.description', 'Only show important errors'),
                                    t('valgrind.commonOptions.outputOptionsList.2.description', 'Show additional information'),
                                    t('valgrind.commonOptions.outputOptionsList.3.description', 'Trace child processes'),
                                    t('valgrind.commonOptions.outputOptionsList.4.description', 'Show open file descriptors')
                                  ][i]}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-lg">
                      <h3 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        {t('valgrind.cheatsheet.tips.title', 'Quick Tips')}
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{t('valgrind.cheatsheet.tips.compileDebug', 'Use -g when compiling to get debug information')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{t('valgrind.cheatsheet.tips.cppInline', 'For C++, use -fno-inline for better results')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{t('valgrind.cheatsheet.tips.suppressions', 'Use --suppressions=filename to suppress known errors')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-auto py-2 sm:py-3 border-t border-border text-center text-xs sm:text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2">
          <div className="flex items-center space-x-2">
            <picture>
              <source srcSet="/logo-24.webp" type="image/webp" />
              <source srcSet="/logo-24.png" type="image/png" />
              <img 
                src="/logo-24.png" 
                alt="Git Game Logo" 
                className="h-5 w-5 sm:h-6 sm:w-6" 
                loading="lazy"
                decoding="async"
                width="24"
                height="24"
              />
            </picture>
            <p className="font-medium">Git Game</p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <p>&copy; {new Date().getFullYear()} FerVi. All rights reserved.</p>
            <span>|</span>
            <a
              href="mailto:game4git@gmail.com"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "mailto:game4git@gmail.com";
              }}
            >
              Contact
            </a>
          </div>
          <p className="text-xs">Built with React, TypeScript and TailwindCSS. Learn Git concepts visually.</p>
        </div>
      </footer>
    </div>
  );
};

export default ValgrindLearning;
