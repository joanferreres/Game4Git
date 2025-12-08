import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Terminal, Code, AlertCircle, Lightbulb, Copy, Check, Play, Users, BookOpen } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';



const GdbLearning: React.FC = () => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("introduction");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Commands organized by category
  const commandCategories = [
    {
      name: t('gdb.categories.startup'),
      commands: [
        { cmd: 'gdb ./your_program', desc: t('gdb.commands.startProgram') },
        { cmd: 'gdb -tui ./your_program', desc: t('gdb.commands.startTUI') },
        { cmd: 'set args arg1 arg2', desc: t('gdb.commands.setArgs') },
        { cmd: 'show args', desc: t('gdb.commands.showArgs') }
      ]
    },
    {
      name: t('gdb.categories.execution'),
      commands: [
        { cmd: 'run', desc: t('gdb.commands.run') },
        { cmd: 'run < input_file', desc: t('gdb.commands.runWithInput') },
        { cmd: 'continue', desc: t('gdb.commands.continue') },
        { cmd: 'step', desc: t('gdb.commands.step') },
        { cmd: 'next', desc: t('gdb.commands.next') },
        { cmd: 'finish', desc: t('gdb.commands.finish') },
        { cmd: 'until', desc: t('gdb.commands.until') },
        { cmd: 'kill', desc: t('gdb.commands.kill') },
        { cmd: 'quit', desc: t('gdb.commands.quit') }
      ]
    },
    {
      name: t('gdb.categories.breakpoints'),
      commands: [
        { cmd: 'break main', desc: t('gdb.commands.breakMain') },
        { cmd: 'break file.c:42', desc: t('gdb.commands.breakLine') },
        { cmd: 'break +5', desc: t('gdb.commands.breakRelative') },
        { cmd: 'watch variable', desc: t('gdb.commands.watchVariable') },
        { cmd: 'info breakpoints', desc: t('gdb.commands.infoBreakpoints') },
        { cmd: 'delete 2', desc: t('gdb.commands.deleteBreakpoint') },
        { cmd: 'clear', desc: t('gdb.commands.clearBreakpoint') },
        { cmd: 'disable 1-3', desc: t('gdb.commands.disableBreakpoints') },
        { cmd: 'enable 1-3', desc: t('gdb.commands.enableBreakpoints') }
      ]
    },
    {
      name: t('gdb.categories.examining'),
      commands: [
        { cmd: 'print variable', desc: t('gdb.commands.printVariable') },
        { cmd: 'print *ptr@10', desc: t('gdb.commands.printMemory') },
        { cmd: 'print sizeof(struct)', desc: t('gdb.commands.printSizeof') },
        { cmd: 'info locals', desc: t('gdb.commands.infoLocals') },
        { cmd: 'info args', desc: t('gdb.commands.infoArgs') },
        { cmd: 'info registers', desc: t('gdb.commands.infoRegisters') },
        { cmd: 'backtrace', desc: t('gdb.commands.backtrace') },
        { cmd: 'frame 2', desc: t('gdb.commands.frame') },
        { cmd: 'x/10x $sp', desc: t('gdb.commands.examineMemory') },
        { cmd: 'disassemble', desc: t('gdb.commands.disassemble') }
      ]
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="container min-h-screen max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col">
      <Helmet>
        <title>Learn GDB Debugger - Interactive Tutorial | Game4Git</title>
        <meta name="description" content="Master GDB debugging with our interactive cheat sheet and playground. Learn breakpoints, stepping, and memory inspection." />
        <meta name="keywords" content="gdb tutorial, learn gdb, gdb cheat sheet, gdb debugger" />
        <link rel="canonical" href="https://game4git.games/gdb" data-dynamic-canonical="true" />
      </Helmet>
      <header className="mb-4 sm:mb-6 relative">
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{t('gdb.pageTitle')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 md:mt-2">
            {t('gdb.subtitle')}
          </p>
          <div className="mt-3 md:mt-4">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              ← {t('common.backToHome', 'Back to Home')}
            </Link>
          </div>
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
                        onClick={() => navigator.clipboard.writeText('gdb ./your_program')}
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
                                  title="Copiar comando"
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
            <img src="/logo.png" alt="Git Game Logo" className="h-5 w-5 sm:h-6 sm:w-6" />
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
