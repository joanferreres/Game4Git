import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Terminal, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TerminalEntry {
  type: 'command' | 'output' | 'system';
  content: string;
  timestamp?: string;
}

interface InteractiveTerminalProps {
  title?: string;
  subtitle?: string;
  onCommand?: (command: string) => string;
  initialMessage?: string;
  prompt?: string;
  className?: string;
}

const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({
  title = "Terminal Interactivo",
  subtitle = "Escribe comandos como en un terminal real",
  onCommand,
  initialMessage = "Terminal iniciado. Escribe 'help' para ver comandos disponibles.",
  prompt = "(gdb)",
  className = ""
}) => {
  const [history, setHistory] = useState<TerminalEntry[]>([
    { type: 'system', content: initialMessage }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const executeCommand = (command: string) => {
    if (!command.trim()) return;

    // Add command to history
    const newEntry: TerminalEntry = {
      type: 'command',
      content: `${prompt} ${command}`,
      timestamp: new Date().toLocaleTimeString()
    };

    // Get command output
    let output = '';
    if (onCommand) {
      output = onCommand(command.trim());
    } else {
      output = `Comando no reconocido: ${command}`;
    }

    const outputEntry: TerminalEntry = {
      type: 'output',
      content: output
    };

    setHistory(prev => [...prev, newEntry, outputEntry]);
    
    // Update command history
    setCommandHistory(prev => {
      const newHistory = [...prev, command];
      // Keep only last 50 commands
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
      // Basic tab completion (can be expanded)
      if (onCommand && currentCommand.trim()) {
        const suggestions = getSuggestions(currentCommand.trim());
        if (suggestions.length === 1) {
          setCurrentCommand(suggestions[0]);
        }
      }
    }
  };

  const getSuggestions = (partial: string): string[] => {
    const commonCommands = [
      'help', 'run', 'break', 'continue', 'step', 'next', 'print', 'list',
      'backtrace', 'info', 'where', 'quit', 'set', 'show', 'file', 'start'
    ];
    
    return commonCommands.filter(cmd => cmd.startsWith(partial.toLowerCase()));
  };

  const clearTerminal = () => {
    setHistory([{ type: 'system', content: 'Terminal limpiado.' }]);
  };

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Terminal className="h-4 w-4" />
          <span>{title}</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Interactivo
          </Badge>
        </CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent className="flex flex-col h-[400px] p-0">
        {/* Terminal Output */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-1 font-mono text-xs">
            {history.map((entry, index) => (
              <div 
                key={index} 
                className={`whitespace-pre-wrap ${
                  entry.type === 'command' 
                    ? 'text-blue-400 font-semibold' 
                    : entry.type === 'system'
                    ? 'text-green-400'
                    : 'text-foreground'
                }`}
              >
                {entry.content}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Command Input */}
        <div className="border-t bg-muted/30 p-3">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-blue-400 font-semibold shrink-0">{prompt}</span>
            <Input
              ref={inputRef}
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un comando y presiona Enter..."
              className="font-mono text-sm border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>💡 Tip: Usa ↑↓ para navegar el historial, Tab para autocompletar</span>
            <button 
              onClick={clearTerminal}
              className="hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveTerminal; 