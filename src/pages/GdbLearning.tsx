import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Terminal, Code, AlertCircle, Lightbulb, Copy, Check, Play, Users, BookOpen } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import SeoHead from '@/components/SeoHead';
import { useLocalizedPath } from '@/lib/localizedRoutes';
import RealisticGdbTerminal from '@/components/RealisticGdbTerminal';



const GdbLearning: React.FC = () => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const homePath = localizePath("/");
  const [activeTab, setActiveTab] = useState("introduction");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState<'basic-debug' | 'segfault' | 'infinite-loop'>('segfault');

  // Commands organized by category
  const commandCategories = [
    {
      name: t('gdb.categories.startup', 'Startup'),
      commands: [
        { cmd: 'gdb ./your_program', desc: t('gdb.commands.startProgram', 'Start program') },
        { cmd: 'gdb -tui ./your_program', desc: t('gdb.commands.startTUI', 'Start TUI mode') },
        { cmd: 'set args arg1 arg2', desc: t('gdb.commands.setArgs', 'Set program arguments') },
        { cmd: 'show args', desc: t('gdb.commands.showArgs', 'Show program arguments') }
      ]
    },
    {
      name: t('gdb.categories.execution', 'Execution'),
      commands: [
        { cmd: 'run', desc: t('gdb.commands.run', 'Run the program') },
        { cmd: 'run < input_file', desc: t('gdb.commands.runWithInput', 'Run with input redirection') },
        { cmd: 'continue', desc: t('gdb.commands.continue', 'Continue execution') },
        { cmd: 'step', desc: t('gdb.commands.step', 'Step into (line by line)') },
        { cmd: 'next', desc: t('gdb.commands.next', 'Step over (line by line)') },
        { cmd: 'finish', desc: t('gdb.commands.finish', 'Finish current function') },
        { cmd: 'until', desc: t('gdb.commands.until', 'Run until a location') },
        { cmd: 'kill', desc: t('gdb.commands.kill', 'Kill the program') },
        { cmd: 'quit', desc: t('gdb.commands.quit', 'Quit GDB') }
      ]
    },
    {
      name: t('gdb.categories.breakpoints', 'Breakpoints'),
      commands: [
        { cmd: 'break main', desc: t('gdb.commands.breakMain', 'Breakpoint at main') },
        { cmd: 'break file.c:42', desc: t('gdb.commands.breakLine', 'Breakpoint at file:line') },
        { cmd: 'break +5', desc: t('gdb.commands.breakRelative', 'Breakpoint relative to current line') },
        { cmd: 'watch variable', desc: t('gdb.commands.watchVariable', 'Watch a variable') },
        { cmd: 'info breakpoints', desc: t('gdb.commands.infoBreakpoints', 'List all breakpoints') },
        { cmd: 'delete 2', desc: t('gdb.commands.deleteBreakpoint', 'Delete breakpoint') },
        { cmd: 'clear', desc: t('gdb.commands.clearBreakpoint', 'Clear breakpoint at current line') },
        { cmd: 'disable 1-3', desc: t('gdb.commands.disableBreakpoints', 'Disable breakpoints') },
        { cmd: 'enable 1-3', desc: t('gdb.commands.enableBreakpoints', 'Enable breakpoints') }
      ]
    },
    {
      name: t('gdb.categories.examining', 'Examining'),
      commands: [
        { cmd: 'print variable', desc: t('gdb.commands.printVariable', 'Print a variable') },
        { cmd: 'print *ptr@10', desc: t('gdb.commands.printMemory', 'Print memory via pointer') },
        { cmd: 'print sizeof(struct)', desc: t('gdb.commands.printSizeof', 'Print sizeof of a type') },
        { cmd: 'info locals', desc: t('gdb.commands.infoLocals', 'Show local variables') },
        { cmd: 'info args', desc: t('gdb.commands.infoArgs', 'Show function arguments') },
        { cmd: 'info registers', desc: t('gdb.commands.infoRegisters', 'Show CPU registers') },
        { cmd: 'backtrace', desc: t('gdb.commands.backtrace', 'Show call stack') },
        { cmd: 'frame 2', desc: t('gdb.commands.frame', 'Change current frame') },
        { cmd: 'x/10x $sp', desc: t('gdb.commands.examineMemory', 'Examine memory') },
        { cmd: 'disassemble', desc: t('gdb.commands.disassemble', 'Disassemble') }
      ]
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCommand(cmd);
      setCopyError(null);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch {
      setCopyError(t('common.copyError', 'Could not copy command. Copy it manually.'));
    }
  };

  return (
    <div className="container min-h-screen max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col">
      <SeoHead page="gdb" />
      <header className="mb-4 sm:mb-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={homePath}
            className="inline-flex items-center justify-center text-blue-600 dark:text-blue-400 hover:underline font-medium sm:justify-start"
          >
            ← {t('common.backToHome', 'Back to Home')}
          </Link>
          <div className="flex items-center justify-center gap-2 sm:justify-end">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
        <div className="mt-6 text-center sm:mt-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{t('gdb.pageTitle')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 md:mt-2">
            {t('gdb.subtitle')}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 gap-1 p-1 h-auto bg-muted/20 rounded-lg">
            <TabsTrigger
              value="introduction"
              className="data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {t('gdb.tabs.introduction', 'Introduction')}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="concepts"
              className="data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
            >
              <span className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                {t('gdb.tabs.concepts', 'Concepts')}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="commands"
              className="data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
            >
              <span className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                {t('gdb.tabs.commands', 'Commands')}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="practices"
              className="data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {t('gdb.tabs.practices', 'Best Practices')}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="cheatsheet"
              className="data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
            >
              <span className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                {t('gdb.tabs.cheatsheet', 'Cheat Sheet')}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="space-y-4">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Terminal className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{t('gdb.ui.whatIsTitle', 'What is GDB?')}</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      {t('gdb.ui.whatIsSubtitle', 'GNU Debugger')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p>
                    {t('gdb.ui.whatIsParagraph', 'GDB is a powerful debugger for C/C++ and other languages. It helps you find and fix issues by pausing execution, inspecting variables, and stepping through code.')}
                  </p>
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                    <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                      {t('gdb.studentPath.title', 'Ruta guiada (10 min)')}
                    </h3>
                    <ol className="mt-2 list-decimal pl-5 text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                      <li>{t('gdb.studentPath.step1', 'Compila con -g -O0')}</li>
                      <li>{t('gdb.studentPath.step2', 'Pon un breakpoint en main')}</li>
                      <li>{t('gdb.studentPath.step3', 'Ejecuta con run y analiza backtrace')}</li>
                      <li>{t('gdb.studentPath.step4', 'Inspecciona variables con print/info locals')}</li>
                      <li>{t('gdb.studentPath.step5', 'Corrige y vuelve a ejecutar')}</li>
                    </ol>
                  </div>

                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        {t('gdb.ui.canDoTitle', 'What can you do with GDB?')}
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{t('gdb.ui.canDo.0', 'Debug programs in multiple languages')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{t('gdb.ui.canDo.1', 'Set breakpoints to pause execution')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{t('gdb.ui.canDo.2', 'Inspect program state at runtime')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{t('gdb.ui.canDo.3', 'Modify variables during execution')}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                      <h3 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {t('gdb.ui.whenTitle', 'When to use GDB?')}
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                          <span>{t('gdb.ui.when.0', 'When your program crashes with a segmentation fault')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                          <span>{t('gdb.ui.when.1', 'When you need to understand the execution flow')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                          <span>{t('gdb.ui.when.2', 'To inspect the state of complex variables')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      {t('gdb.ui.proTipTitle', 'Pro Tip: Starting GDB')}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded text-sm font-mono">
                        {t('gdb.ui.sampleCommand', 'gdb ./your_program')}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => handleCopy('gdb ./your_program')}
                        aria-label={t('common.copyCommand', 'Copy command')}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('gdb.ui.compileDebugHint', 'Compile your program with the -g flag to include debug information.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concepts">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{t('gdb.concepts.title', 'Core Concepts')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {[
                  { icon: <AlertCircle className="h-4 w-4" />, title: t('gdb.concepts.breakpoints.title', 'Breakpoints'), desc: t('gdb.concepts.breakpoints.desc', 'Pause execution at specific lines or functions to inspect program state.') },
                  { icon: <Users className="h-4 w-4" />, title: t('gdb.concepts.watchpoints.title', 'Watchpoints'), desc: t('gdb.concepts.watchpoints.desc', 'Pause when a variable or memory location changes its value.') },
                  { icon: <BookOpen className="h-4 w-4" />, title: t('gdb.concepts.stack.title', 'Call Stack & Frames'), desc: t('gdb.concepts.stack.desc', 'Navigate frames to see where you are and how you got there (backtrace, frame).') },
                  { icon: <Code className="h-4 w-4" />, title: t('gdb.concepts.memory.title', 'Inspecting Memory'), desc: t('gdb.concepts.memory.desc', 'Use print/x and examine commands to inspect variables and memory regions.') },
                  { icon: <Terminal className="h-4 w-4" />, title: t('gdb.concepts.stepping.title', 'Stepping'), desc: t('gdb.concepts.stepping.desc', 'step (into), next (over), finish (until function returns), continue.') },
                ].map((c, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-white dark:bg-gray-800/40">
                    <h3 className="font-semibold flex items-center gap-2">{c.icon}{c.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commands" className="space-y-6">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Terminal className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{t('gdb.uiCommands.commandsTitle', 'GDB Commands')}</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      {t('gdb.uiCommands.commandsDesc', 'Full reference of commands organized by category')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('gdb.ui.searchPlaceholder', 'Search commands...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Command Categories */}
                <div className="space-y-6">
                  {commandCategories.map((category) => {
                    // Filter commands based on search term
                    const filteredCommands = category.commands.filter(
                      (item) =>
                        item.cmd.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.desc.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredCommands.length === 0) return null;

                    return (
                      <div key={category.name} className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <span className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium mr-2">
                            {category.name}
                          </span>
                        </h3>
                        <div className="grid gap-3 md:grid-cols-2">
                          {filteredCommands.map((item) => (
                            <div
                              key={item.cmd}
                              className="group relative p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <code className="font-mono text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                    {item.cmd}
                                  </code>
                                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    {item.desc}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleCopy(item.cmd)}
                                  className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-500 transition-colors"
                                  title={t('common.copyCommand', 'Copy command')}
                                  aria-label={t('common.copyCommand', 'Copy command')}
                                >
                                  {copiedCommand === item.cmd ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                              {item.cmd.startsWith('print') && (
                                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">{t('gdb.ui.printExamplePrefix', 'Example:')}</span> <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">print *ptr@10</code> {t('gdb.ui.printExampleSuffix', 'shows 10 elements from the pointer')}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {searchTerm.trim().length > 0 &&
                commandCategories.every((category) =>
                  category.commands.every(
                    (item) =>
                      !item.cmd.toLowerCase().includes(searchTerm.toLowerCase()) &&
                      !item.desc.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                ) ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
                    {t('gdb.ui.noResults', 'No se encontraron comandos para tu búsqueda. Prueba con run, break o print.')}
                  </div>
                ) : null}
                {copyError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                    {copyError}
                  </div>
                ) : null}

                {/* Quick Tips */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-400 dark:border-blue-500 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Lightbulb className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">{t('gdb.ui.quickTipTitle', 'Quick Tip')}</h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          {t('gdb.ui.quickTipAutocomplete', 'Use TAB to autocomplete commands and variable names. Press TAB twice to see suggestions.')}
                        </p>
                        <p className="mt-2">
                          {t('gdb.ui.quickTipHelp', 'Useful shortcut: use help [command] inside GDB to get detailed help about any command.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practices">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t('gdb.ui.bestPracticesTitle', 'Best Practices')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { title: t('gdb.ui.bp1Title', 'Always compile with'), desc: t('gdb.ui.bp1Desc', 'Add debug symbols required by GDB (e.g., gcc -g program.c).'), code: 'gcc -g -O0 -Wall -Wextra -o app app.c' },
                    { title: t('gdb.ui.bp2Title', 'Enable core dumps'), desc: t('gdb.ui.bp2Desc', 'Analyze crashes with gdb program core. Use ulimit -c unlimited to enable them.'), code: 'ulimit -c unlimited' },
                    { title: t('gdb.ui.bp4Title', 'Use TUI mode (-tui)'), desc: t('gdb.ui.bp4Desc', 'The text UI shows source and context. Great for step debugging.'), code: 'gdb -tui ./your_program' },
                    { title: t('gdb.ui.bp5Title', 'Use a .gdbinit for shortcuts'), desc: t('gdb.ui.bp5Desc', 'Define aliases and settings to speed up your workflow.'), code: 'echo "set pagination off\nalias bt=backtrace" >> ~/.gdbinit' },
                    { title: t('gdb.ui.bp6Title', 'Pretty-printers (C++/STL)'), desc: t('gdb.ui.bp6Desc', 'Enable pretty printers to inspect STL containers clearly.'), code: 'python import sys; sys.path.append("/usr/share/gdb/auto-load")' },
                    { title: t('gdb.ui.bp7Title', 'Conditional breakpoints'), desc: t('gdb.ui.bp7Desc', 'Pause only when a condition matches to debug faster.'), code: 'break file.c:42 if i==10' }
                  ].map((bp, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-white dark:bg-gray-800/40">
                      <h4 className="font-semibold text-sm mb-1">{bp.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{bp.desc}</p>
                      {bp.code && (
                        <code className="block text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{bp.code}</code>
                      )}
                    </div>
                  ))}
                </div>

                <details className="mt-5">
                  <summary className="cursor-pointer font-semibold text-blue-600">{t('gdb.ui.commonErrorsTitle', 'Common errors & how to avoid them')}</summary>
                  <ul className="mt-2 list-disc ml-6 text-gray-600 dark:text-gray-400 text-sm">
                    <li>{t('gdb.ui.commonErrors.0', 'Forgetting to compile with -g')}</li>
                    <li>{t('gdb.ui.commonErrors.1', 'Not using strategic breakpoints')}</li>
                    <li>{t('gdb.ui.commonErrors.2', 'Confusing next and step')}</li>
                  </ul>
                </details>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cheatsheet" className="space-y-4">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('gdb.interactive.title', 'Interactive GDB Terminal')}</CardTitle>
                <CardDescription>{t('gdb.interactive.tryCommands', 'Try: run, backtrace, list, print, help, clear')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Button variant={selectedExample === 'segfault' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedExample('segfault')}>Segfault</Button>
                  <Button variant={selectedExample === 'basic-debug' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedExample('basic-debug')}>Buffer Overflow</Button>
                  <Button variant={selectedExample === 'infinite-loop' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedExample('infinite-loop')}>Stack Overflow</Button>
                </div>
                <RealisticGdbTerminal selectedExample={selectedExample} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="cheatsheet">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{t('gdb.cheatsheet.title', 'GDB Cheat Sheet')}</CardTitle>
                <CardDescription className="text-muted-foreground">{t('gdb.cheatsheet.description', 'Essential GDB commands')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { cmd: 'run', desc: t('gdb.cheatsheet.items.run', 'Run the program') },
                    { cmd: 'break N', desc: t('gdb.cheatsheet.items.break', 'Set breakpoint at line N') },
                    { cmd: 'break file.c:42', desc: t('gdb.cheatsheet.items.breakLine', 'Set breakpoint at file:line') },
                    { cmd: 'next', desc: t('gdb.cheatsheet.items.next', 'Step over (don\'t enter functions)') },
                    { cmd: 'step', desc: t('gdb.cheatsheet.items.step', 'Step into (enter functions)') },
                    { cmd: 'continue', desc: t('gdb.cheatsheet.items.continue', 'Continue until next breakpoint') },
                    { cmd: 'print var', desc: t('gdb.cheatsheet.items.print', 'Print a variable value') },
                    { cmd: 'backtrace', desc: t('gdb.cheatsheet.items.backtrace', 'Show call stack') },
                    { cmd: 'quit', desc: t('gdb.cheatsheet.items.quit', 'Quit GDB') }
                  ].map((item, i) => (
                    <div key={i} className="group relative">
                      <div className="flex items-start gap-2">
                        <code className="flex-1 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-2 rounded-md text-sm font-mono text-indigo-800 dark:text-indigo-200 overflow-x-auto">
                          {item.cmd}
                        </code>
                      </div>
                      <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                        {item.desc}
                      </p>
                    </div>
                  ))}
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

export default GdbLearning;
