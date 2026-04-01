import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Terminal, Bug, Eye, Cpu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface TerminalEntry {
  type: 'command' | 'output' | 'system' | 'error' | 'warning' | 'address' | 'register';
  content: string;
  timestamp?: string;
  color?: string;
}

interface ProgramState {
  isRunning: boolean;
  isCrashed: boolean;
  currentLine: number;
  currentFunction: string;
  breakpoints: number[];
  variables: Record<string, string | number | boolean | null | undefined>;
  registers: { [key: string]: string };
  memoryMap: { [key: string]: string };
}

interface RealisticGdbTerminalProps {
  selectedExample: string;
  className?: string;
}

interface QuickCommand {
  label: string;
  command: string;
}

const RealisticGdbTerminal: React.FC<RealisticGdbTerminalProps> = ({
  selectedExample,
  className = ""
}) => {
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [programState, setProgramState] = useState<ProgramState>({
    isRunning: false,
    isCrashed: false,
    currentLine: 0,
    currentFunction: 'main',
    breakpoints: [],
    variables: {},
    registers: {
      'rax': '0x0000000000000000',
      'rbx': '0x0000000000000000', 
      'rcx': '0x0000000000000000',
      'rsp': '0x00007fffffffe000',
      'rip': '0x0000555555555155'
    },
    memoryMap: {}
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize terminal with realistic GDB startup
  useEffect(() => {
    const initMessage: TerminalEntry = {
      type: 'system',
      content: `GNU gdb (Ubuntu 12.1-0ubuntu1~22.04) 12.1
Copyright (C) 2022 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<https://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
    <http://www.gnu.org/software/gdb/documentation/>.

For help, type "help".
Type "apropos word" to search for commands related to "word"...
Reading symbols from ./${selectedExample}_example...
(gdb) `,
      color: 'text-blue-400'
    };
    setHistory([initMessage]);
  }, [selectedExample]);

  // Auto-scroll and focus
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const getExampleDetails = () => {
    const examples = {
      'basic-debug': {
        file: 'debug.c',
        crashLine: 8,
        crashAddress: '0x0000555555555169',
        errorType: 'SIGSEGV',
        errorDesc: 'Segmentation fault',
        variables: { 'arr': '{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}', 'i': '10' },
        sourceCode: [
          '#include <stdio.h>',
          '',
          'int main() {',
          '    int arr[10] = {1,2,3,4,5,6,7,8,9,10};',
          '    int i;',
          '    ',
          '    for(i = 0; i <= 10; i++) {',
          '        arr[10] = 42;  // ← Buffer overflow!',
          '        printf("arr[%d] = %d\\n", i, arr[i]);',
          '    }',
          '    return 0;',
          '}'
        ]
      },
      'segfault': {
        file: 'segfault.c', 
        crashLine: 6,
        crashAddress: '0x0000555555555155',
        errorType: 'SIGSEGV',
        errorDesc: 'Segmentation fault',
        variables: { 'ptr': '0x0' },
        sourceCode: [
          '#include <stdio.h>',
          '',
          'int main() {',
          '    int *ptr = NULL;',
          '    ',
          '    *ptr = 10;  // ← NULL pointer dereference!',
          '    printf("Valor: %d\\n", *ptr);',
          '    ',
          '    return 0;',
          '}'
        ]
      },
      'infinite-loop': {
        file: 'stack.c',
        crashLine: 5, 
        crashAddress: '0x0000555555555142',
        errorType: 'SIGSEGV',
        errorDesc: 'Stack overflow',
        variables: { 'n': '19998' },
        sourceCode: [
          '#include <stdio.h>',
          '',
          'int factorial(int n) {',
          '    if (n <= 0) return 1;  // Missing n == 1 case!',
          '    return n * factorial(n - 1);  // ← Infinite recursion!',
          '}',
          '',
          'int main() {',
          '    int result = factorial(20000);',
          '    printf("Resultado: %d\\n", result);',
          '    return 0;',
          '}'
        ]
      }
    };
    return examples[selectedExample as keyof typeof examples] || examples['basic-debug'];
  };

  const getQuickCommands = (): QuickCommand[] => {
    const details = getExampleDetails();
    const base: QuickCommand[] = [
      { label: 'help', command: 'help' },
      { label: 'run', command: 'run' },
      { label: 'break main', command: 'break main' },
      { label: `break ${details.crashLine}`, command: `break ${details.crashLine}` },
      { label: 'continue', command: 'continue' },
      { label: 'step', command: 'step' },
      { label: 'next', command: 'next' },
      { label: 'backtrace', command: 'backtrace' },
      { label: 'where', command: 'where' },
      { label: 'list', command: 'list' },
      { label: 'info locals', command: 'info locals' },
      { label: 'info registers', command: 'info registers' },
      { label: 'info frame', command: 'info frame' },
      { label: 'disassemble', command: 'disassemble' },
      { label: 'show version', command: 'show version' },
      { label: 'quit', command: 'quit' },
    ];

    if (selectedExample === 'segfault') {
      base.splice(11, 0, { label: 'print ptr', command: 'print ptr' });
      base.splice(12, 0, { label: 'print *ptr', command: 'print *ptr' });
    } else if (selectedExample === 'basic-debug') {
      base.splice(11, 0, { label: 'print i', command: 'print i' });
      base.splice(12, 0, { label: 'print arr[10]', command: 'print arr[10]' });
    } else {
      base.splice(11, 0, { label: 'print n', command: 'print n' });
    }

    return base;
  };

  const formatAddress = (addr: string) => `\x1b[36m${addr}\x1b[0m`;
  const formatFunction = (func: string) => `\x1b[33m${func}\x1b[0m`;
  const formatFile = (file: string) => `\x1b[32m${file}\x1b[0m`;
  const formatError = (text: string) => `\x1b[31m${text}\x1b[0m`;
  const formatHighlight = (text: string) => `\x1b[1;31m${text}\x1b[0m`;

  const executeCommand = (command: string) => {
    if (!command.trim()) return;

    const cmd = command.toLowerCase().trim();
    const example = getExampleDetails();
    
    // Add command to history
    const commandEntry: TerminalEntry = {
      type: 'command',
      content: `(gdb) ${command}`,
      color: 'text-white font-bold'
    };

    let output = '';
    let outputType: TerminalEntry['type'] = 'output';
    let outputColor = 'text-gray-300';

    // HELP command - comprehensive and realistic
    if (cmd === 'help' || cmd === 'h') {
      output = `List of classes of commands:

aliases -- Aliases of other commands
breakpoints -- Making program stop at certain points
data -- Examining data
files -- Specifying and examining files
internals -- Maintenance commands
obscure -- Obscure features
running -- Running the program
stack -- Examining the stack
status -- Status inquiries
support -- Support facilities
tracepoints -- Tracing of program execution without stopping
user-defined -- User-defined commands

Type "help" followed by a class name for a list of commands in that class.
Type "help all" for the list of all commands.
Type "help" followed by command name for full documentation.
Type "apropos word" to search for commands related to "word".
Command name abbreviations are allowed if unambiguous.`;
    }
    
    // RUN command - realistic crash simulation
    else if (cmd === 'run' || cmd === 'r') {
      setProgramState(prev => ({ ...prev, isRunning: true, isCrashed: true }));
      output = `Starting program: /home/user/${example.file.replace('.c', '')} 
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".

Program received signal ${example.errorType}, ${example.errorDesc}.
${example.crashAddress} in ${formatFunction('main')} () at ${formatFile(example.file)}:${example.crashLine}
${example.crashLine}\t    ${example.sourceCode[example.crashLine - 1]}`;
      outputType = 'error';
      outputColor = 'text-red-400';
    }
    
    // BACKTRACE command - detailed stack trace
    else if (cmd === 'backtrace' || cmd === 'bt' || cmd === 'where') {
      if (selectedExample === 'infinite-loop') {
        output = `#0  ${example.crashAddress} in ${formatFunction('factorial')} (n=19998) at ${formatFile(example.file)}:${example.crashLine}
#1  ${example.crashAddress} in ${formatFunction('factorial')} (n=19999) at ${formatFile(example.file)}:${example.crashLine}
#2  ${example.crashAddress} in ${formatFunction('factorial')} (n=20000) at ${formatFile(example.file)}:${example.crashLine}
#3  0x000055555555515a in ${formatFunction('main')} () at ${formatFile(example.file)}:9
${formatError('(Thousands more frames... Stack overflow!)')}
${formatError('Backtrace stopped: frame did not save the PC')}`;
      } else {
        output = `#0  ${example.crashAddress} in ${formatFunction('main')} () at ${formatFile(example.file)}:${example.crashLine}`;
      }
    }
    
    // LIST command - show source with line numbers and highlighting
    else if (cmd === 'list' || cmd === 'l' || cmd.startsWith('list ') || cmd.startsWith('l ')) {
      const lines = example.sourceCode;
      const startLine = 1;
      output = lines.map((line, index) => {
        const lineNum = startLine + index;
        const isCurrentLine = lineNum === example.crashLine;
        const prefix = isCurrentLine ? '=> ' : '   ';
        const lineIndicator = isCurrentLine ? formatHighlight('>>') : '  ';
        return `${lineNum.toString().padStart(2)} ${lineIndicator} ${prefix}${line}`;
      }).join('\n');
    }
    
    // PRINT commands - show variable values with memory addresses
    else if (cmd.startsWith('print ') || cmd.startsWith('p ')) {
      const variable = cmd.split(' ')[1] ?? '';
      if (variable && example.variables[variable]) {
        output = `$1 = ${example.variables[variable]}`;
        outputColor = 'text-cyan-400';
      } else if (variable === '*ptr' && selectedExample === 'segfault') {
        output = `${formatError('Cannot access memory at address 0x0')}`;
        outputType = 'error';
        outputColor = 'text-red-400';
      } else if (variable?.includes('[')) {
        const arrayMatch = variable.match(/(\w+)\[(\d+)\]/);
        if (arrayMatch && arrayMatch[1] === 'arr') {
          const index = parseInt(arrayMatch[2] ?? '0', 10);
          if (index >= 10) {
            output = `${formatError('Array index out of bounds')}`;
            outputType = 'error';
            outputColor = 'text-red-400';
          } else {
            output = `$1 = ${index + 1}`;
            outputColor = 'text-cyan-400';
          }
        }
      } else {
        output = `No symbol "${variable}" in current context.`;
        outputType = 'error';
        outputColor = 'text-red-400';
      }
    }
    
    // INFO commands - detailed system information
    else if (cmd === 'info locals') {
      const vars = Object.entries(example.variables)
        .map(([name, value]) => `${name} = ${value}`)
        .join('\n');
      output = vars || 'No locals.';
    }
    
    else if (cmd === 'info registers' || cmd === 'info reg') {
      output = Object.entries(programState.registers)
        .map(([reg, value]) => `${reg.padEnd(3)} ${formatAddress(value)}`)
        .join('\n');
    }
    
    else if (cmd === 'info frame') {
      output = `Stack level 0, frame at ${formatAddress('0x7fffffffe010')}:
 rip = ${formatAddress(example.crashAddress)} in ${formatFunction('main')} (${formatFile(example.file)}:${example.crashLine})
 Saved registers:
  rbp at ${formatAddress('0x7fffffffe000')}, rip at ${formatAddress('0x7fffffffe008')}`;
    }
    
    // BREAK commands - set breakpoints
    else if (cmd.startsWith('break ') || cmd.startsWith('b ')) {
      const target = cmd.split(' ')[1] ?? '';
      if (target === 'main') {
        output = `Breakpoint 1 at ${formatAddress('0x555555555149')}: file ${formatFile(example.file)}, line 3.`;
      } else if (!isNaN(parseInt(target))) {
        const line = parseInt(target);
        output = `Breakpoint ${programState.breakpoints.length + 1} at ${formatAddress(example.crashAddress)}: file ${formatFile(example.file)}, line ${line}.`;
        setProgramState(prev => ({
          ...prev,
          breakpoints: [...prev.breakpoints, line]
        }));
      } else {
        output = `Function "${target}" not defined.`;
        outputType = 'error';
        outputColor = 'text-red-400';
      }
    }
    
    // DISASSEMBLE command - show assembly
    else if (cmd.startsWith('disas') || cmd === 'disassemble') {
      output = `Dump of assembler code for function main:
   0x0000555555555149 <+0>:     push   %rbp
   0x000055555555514a <+1>:     mov    %rsp,%rbp
   0x000055555555514d <+4>:     sub    $0x30,%rsp
=> 0x0000555555555151 <+8>:     movl   $0x2a,0x18(%rsp)
   0x0000555555555159 <+16>:    mov    $0x0,%eax
   0x000055555555515e <+21>:    call   0x555555555050 <printf@plt>
   0x0000555555555163 <+26>:    add    $0x30,%rsp
   0x0000555555555167 <+30>:    pop    %rbp
   0x0000555555555168 <+31>:    ret
End of assembler dump.`;
    }
    
    // CONTINUE command
    else if (cmd === 'continue' || cmd === 'c') {
      output = `Continuing.

Program received signal ${example.errorType}, ${example.errorDesc}.
${example.crashAddress} in ${formatFunction('main')} () at ${formatFile(example.file)}:${example.crashLine}
${example.crashLine}\t    ${example.sourceCode[example.crashLine - 1]}`;
      outputType = 'error';
      outputColor = 'text-red-400';
    }
    
    // STEP and NEXT commands
    else if (cmd === 'step' || cmd === 's') {
      output = `${example.crashLine}\t    ${example.sourceCode[example.crashLine - 1]}`;
    }
    
    else if (cmd === 'next' || cmd === 'n') {
      const nextLine = Math.min(example.crashLine + 1, example.sourceCode.length);
      output = `${nextLine}\t    ${example.sourceCode[nextLine - 1] || 'End of function'}`;
    }
    
    // QUIT command
    else if (cmd === 'quit' || cmd === 'q') {
      output = `A debugging session is active.

\tInferior 1 [process 1234] will be killed.

Quit anyway? (y or n) [Simulated: y]
[Exiting GDB...]`;
      outputType = 'system';
      outputColor = 'text-yellow-400';
    }
    
    // SHOW commands
    else if (cmd.startsWith('show ')) {
      const option = cmd.split(' ')[1];
      if (option === 'version') {
        output = 'GNU gdb (Ubuntu 12.1-0ubuntu1~22.04) 12.1';
      } else if (option === 'architecture') {
        output = 'The target architecture is set to "auto" (currently "i386:x86-64").';
      } else {
        output = `"${option}" is not a valid show option.`;
      }
    }
    
    // Unknown command
    else {
      output = `Undefined command: "${command}".  Try "help".`;
      outputType = 'error';
      outputColor = 'text-red-400';
    }

    const outputEntry: TerminalEntry = {
      type: outputType,
      content: output,
      color: outputColor
    };

    setHistory(prev => [...prev, commandEntry, outputEntry]);
    
    // Update command history
    setCommandHistory(prev => {
      const newHistory = [...prev, command];
      return newHistory.slice(-50);
    });
    
    setCurrentCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex] || '');
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const suggestions = getAutocompleteSuggestions(currentCommand.trim());
      if (suggestions.length === 1 && suggestions[0]) {
        setCurrentCommand(suggestions[0]);
      }
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setHistory(prev => [...prev, {
        type: 'system',
        content: '^C\n(gdb) ',
        color: 'text-yellow-400'
      }]);
      setCurrentCommand('');
    }
  };

  const getAutocompleteSuggestions = (partial: string): string[] => {
    const commands = [
      'help', 'run', 'break', 'continue', 'step', 'next', 'print', 'list',
      'backtrace', 'info', 'where', 'quit', 'set', 'show', 'file', 'start',
      'disassemble', 'info locals', 'info registers', 'info frame'
    ];
    
    return commands.filter(cmd => cmd.startsWith(partial.toLowerCase()));
  };

  const clearTerminal = () => {
    setHistory([]);
  };

  const runQuickCommand = (command: string) => {
    setCurrentCommand(command);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Remove ANSI escape sequences and render plain text safely.
  const stripAnsi = (content: string) => {
    /* eslint-disable no-control-regex */
    return content.replace(/\x1b\[[0-9;]*m/g, '');
    /* eslint-enable no-control-regex */
  };

  return (
    <Card className={`h-full bg-black border-gray-700 ${className}`}>
      <CardHeader className="space-y-2 pb-2 sm:pb-3 bg-gray-900 border-b border-gray-700">
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm text-gray-100">
          <Terminal className="h-4 w-4 text-green-400" />
          <span>GDB Debugger</span>
          <Badge variant="secondary" className="text-xs bg-red-600 text-white sm:ml-auto">
            <Bug className="h-3 w-3 mr-1" />
            Live Session
          </Badge>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-gray-400">Connected</span>
          </div>
          <div className="flex items-center gap-1">
            <Cpu className="h-3 w-3 text-blue-400" />
            <span className="text-gray-400">x86_64</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-purple-400" />
            <span className="text-gray-400">{getExampleDetails().file}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col h-[72vh] min-h-[460px] sm:h-[500px] p-0 bg-black">
        {/* Source code preview */}
        <div className="border-b border-gray-800 bg-gray-950/70 px-2 sm:px-3 py-2">
          <p className="mb-1 text-[11px] font-semibold text-gray-300">
            Source preview ({getExampleDetails().file})
          </p>
          <div className="max-h-20 sm:max-h-24 overflow-y-auto rounded border border-gray-800 bg-black p-2 font-mono text-[11px]">
            {getExampleDetails().sourceCode.map((line, index) => {
              const lineNo = index + 1;
              const crash = lineNo === getExampleDetails().crashLine;
              return (
                <div key={lineNo} className={crash ? 'bg-red-900/30 text-red-300' : 'text-gray-400'}>
                  <span className="mr-2 inline-block w-6 text-right text-gray-600">{lineNo}</span>
                  <span>{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* One-click commands */}
        <div className="border-b border-gray-800 bg-gray-900/70 px-2 sm:px-3 py-2">
          <p className="mb-1 text-[11px] font-semibold text-gray-300">
            Comandos ejecutables (clic)
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {getQuickCommands().map(({ label, command }) => (
              <Button
                key={command}
                variant="ghost"
                size="sm"
                className="h-6 shrink-0 rounded border border-gray-700 px-2 font-mono text-[11px] text-gray-300 hover:text-white"
                onClick={() => runQuickCommand(command)}
              >
                {label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 shrink-0 rounded border border-gray-700 px-2 font-mono text-[11px] text-gray-300 hover:text-white"
              onClick={clearTerminal}
            >
              clear
            </Button>
          </div>
        </div>

        {/* Terminal Output */}
        <ScrollArea className="flex-1 p-2.5 sm:p-4" ref={scrollRef}>
          <div className="space-y-1 font-mono text-xs sm:text-sm">
            {history.map((entry, index) => (
              <div 
                key={index} 
                className={`whitespace-pre-wrap ${entry.color || 'text-gray-300'}`}
              >
                {stripAnsi(entry.content)}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Command Input */}
        <div className="border-t border-gray-700 bg-gray-900 p-2.5 sm:p-3">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-blue-400 font-bold shrink-0">(gdb)</span>
            <Input
              ref={inputRef}
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter GDB command..."
              className="font-mono text-sm border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-white placeholder-gray-500"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="mt-2 flex flex-col gap-1.5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span className="leading-tight">💡 Try: run → backtrace → list → print variable_name</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearTerminal}
                className="text-gray-400 hover:text-white text-xs h-auto p-1"
              >
                Clear
              </Button>
              <span className="text-gray-600">Ctrl+C to interrupt</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealisticGdbTerminal; 