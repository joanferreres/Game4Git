import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Bug, 
  Play, 
  Square, 
  SkipForward, 
  ArrowRight, 
  Terminal, 
  Code, 
  Zap, 
  Eye, 
  Search,
  Home,
  Info,
  AlertCircle,
  BookOpen
} from "lucide-react";
import { useTranslation } from "react-i18next";
import CodeEditor from "@/components/CodeEditor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import InteractiveTerminal from "@/components/InteractiveTerminal";

const GdbLearning: React.FC = () => {
  const { t } = useTranslation();
  const [selectedExample, setSelectedExample] = useState("basic-debug");
  const [gdbOutput, setGdbOutput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  // Example C code with bugs for debugging
  const exampleCode = {
    "basic-debug": `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *ptr = malloc(sizeof(int) * 10);
    
    // Bug: Writing past allocated memory
    for (int i = 0; i <= 10; i++) {
        ptr[i] = i * 2;
    }
    
    printf("Array values:\\n");
    for (int i = 0; i < 10; i++) {
        printf("ptr[%d] = %d\\n", i, ptr[i]);
    }
    
    free(ptr);
    return 0;
}`,
    "segfault": `#include <stdio.h>
#include <string.h>

int main() {
    char *str = NULL;
    
    // Bug: Dereferencing NULL pointer
    strcpy(str, "Hello World");
    
    printf("String: %s\\n", str);
    return 0;
}`,
    "infinite-loop": `#include <stdio.h>

int factorial(int n) {
    // Bug: Missing base case
    return n * factorial(n - 1);
}

int main() {
    int result = factorial(5);
    printf("Factorial: %d\\n", result);
    return 0;
}`
  };

  const gdbCommands = [
    { command: "gcc -g -o program program.c", description: "Compile with debug symbols" },
    { command: "gdb ./program", description: "Start GDB with your program" },
    { command: "run", description: "Execute the program" },
    { command: "break main", description: "Set breakpoint at main function" },
    { command: "break 10", description: "Set breakpoint at line 10" },
    { command: "next", description: "Execute next line (step over)" },
    { command: "step", description: "Execute next line (step into)" },
    { command: "continue", description: "Continue execution" },
    { command: "print variable", description: "Print variable value" },
    { command: "info locals", description: "Show local variables" },
    { command: "backtrace", description: "Show call stack" },
    { command: "list", description: "Show source code around current line" },
    { command: "quit", description: "Exit GDB" }
  ];

  const debuggingSteps = [
    {
      step: "Compilation",
      command: "gcc -g -o debug_program program.c",
      explanation: "Compile your C program with the -g flag to include debugging information"
    },
    {
      step: "Start GDB",
      command: "gdb ./debug_program",
      explanation: "Launch GDB with your compiled program"
    },
    {
      step: "Set Breakpoints",
      command: "break main",
      explanation: "Set a breakpoint at the main function to pause execution"
    },
    {
      step: "Run Program",
      command: "run",
      explanation: "Start executing your program. It will stop at the breakpoint"
    },
    {
      step: "Step Through",
      command: "next",
      explanation: "Execute the program line by line to find issues"
    },
    {
      step: "Inspect Variables",
      command: "print ptr",
      explanation: "Check variable values to understand program state"
    }
  ];

  // Enhanced GDB command simulator that returns realistic output
  const handleGdbCommand = (command: string): string => {
    const cmd = command.toLowerCase().trim();
    
    // Help command
    if (cmd === 'help' || cmd === 'h') {
      return `Lista de comandos disponibles:
run, r          -- Ejecutar el programa
break, b        -- Establecer punto de interrupción
continue, c     -- Continuar ejecución
step, s         -- Ejecutar línea por línea (entrar en funciones)
next, n         -- Ejecutar línea por línea (sin entrar en funciones)
print, p        -- Imprimir valor de variable
backtrace, bt   -- Mostrar stack trace
list, l         -- Mostrar código fuente
info locals     -- Mostrar variables locales
info args       -- Mostrar argumentos de función
where           -- Mostrar ubicación actual
quit, q         -- Salir de GDB

Ejemplo: print variable_name
Ejemplo: break main
Ejemplo: break 10 (línea 10)`;
    }
    
    // Run command
    if (cmd === 'run' || cmd === 'r') {
      if (selectedExample === 'basic-debug') {
        return `Starting program: ./debug_example

Program received signal SIGSEGV, Segmentation fault.
0x0000555555555169 in main () at debug.c:8
8           arr[10] = 42;  // Error: fuera de límites!
(gdb)`;
      } else if (selectedExample === 'segfault') {
        return `Starting program: ./segfault_example

Program received signal SIGSEGV, Segmentation fault.
0x0000555555555155 in main () at segfault.c:6
6           *ptr = 10;  // Error: puntero NULL!
(gdb)`;
      } else {
        return `Starting program: ./stack_example

Program received signal SIGSEGV, Segmentation fault.
0x0000555555555142 in factorial (n=19998) at stack.c:5
5           return n * factorial(n - 1);  // Error: stack overflow!
(gdb)`;
      }
    }
    
    // Backtrace command
    if (cmd === 'backtrace' || cmd === 'bt' || cmd === 'where') {
      if (selectedExample === 'basic-debug') {
        return `#0  0x0000555555555169 in main () at debug.c:8`;
      } else if (selectedExample === 'segfault') {
        return `#0  0x0000555555555155 in main () at segfault.c:6`;
      } else {
        return `#0  0x0000555555555142 in factorial (n=19998) at stack.c:5
#1  0x0000555555555142 in factorial (n=19999) at stack.c:5
#2  0x0000555555555142 in factorial (n=20000) at stack.c:5
#3  0x000055555555515a in main () at stack.c:10
(Muchos más frames... stack overflow!)`;
      }
    }
    
    // Print commands
    if (cmd.startsWith('print ') || cmd.startsWith('p ')) {
      const variable = cmd.split(' ')[1];
      if (variable === 'ptr') {
        return `$1 = (int *) 0x0`;
      } else if (variable === 'arr') {
        return `$1 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}`;
      } else if (variable === 'n') {
        return `$1 = 19998`;
      } else if (variable === 'i') {
        return `$1 = 10`;
      } else {
        return `No symbol "${variable}" in current context.`;
      }
    }
    
    // Info commands
    if (cmd === 'info locals') {
      if (selectedExample === 'basic-debug') {
        return `arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
i = 10`;
      } else if (selectedExample === 'segfault') {
        return `ptr = 0x0`;
      } else {
        return `n = 19998`;
      }
    }
    
    if (cmd === 'info args') {
      if (selectedExample === 'stack-overflow') {
        return `n = 19998`;
      } else {
        return `No arguments.`;
      }
    }
    
    // List command
    if (cmd === 'list' || cmd === 'l') {
      if (selectedExample === 'basic-debug') {
        return `1   #include <stdio.h>
2   
3   int main() {
4       int arr[10] = {1,2,3,4,5,6,7,8,9,10};
5       int i;
6       
7       for(i = 0; i <= 10; i++) {
8  >>       arr[10] = 42;  // Error: fuera de límites!
9           printf("arr[%d] = %d\\n", i, arr[i]);
10      }`;
      } else if (selectedExample === 'segfault') {
        return `1   #include <stdio.h>
2   
3   int main() {
4       int *ptr = NULL;
5       
6  >>   *ptr = 10;  // Error: puntero NULL!
7       printf("Valor: %d\\n", *ptr);
8       
9       return 0;
10  }`;
      } else {
        return `1   #include <stdio.h>
2   
3   int factorial(int n) {
4       if (n <= 0) return 1;  // Falta caso n == 1!
5  >>   return n * factorial(n - 1);  // Error: stack overflow!
6   }
7   
8   int main() {
9       int result = factorial(20000);
10      printf("Resultado: %d\\n", result);`;
      }
    }
    
    // Break commands
    if (cmd.startsWith('break ') || cmd.startsWith('b ')) {
      const target = cmd.split(' ')[1];
      return `Breakpoint 1 at 0x555555555155: file debug.c, line ${target}.`;
    }
    
    // Continue command
    if (cmd === 'continue' || cmd === 'c') {
      return `Continuing.

Program received signal SIGSEGV, Segmentation fault.
Programa terminado con error.`;
    }
    
    // Step commands
    if (cmd === 'step' || cmd === 's') {
      return `8           arr[10] = 42;  // Error: fuera de límites!`;
    }
    
    if (cmd === 'next' || cmd === 'n') {
      return `9           printf("arr[%d] = %d\\n", i, arr[i]);`;
    }
    
    // Quit command
    if (cmd === 'quit' || cmd === 'q') {
      return `¿Realmente quieres salir de GDB? (y/n) 
[Simulación: GDB cerrado]`;
    }
    
    // Unknown command
    return `Comando no definido: "${command}". Prueba "help".`;
  };

  return (
    <div className="container min-h-screen max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col">
      <header className="mb-4 sm:mb-6 relative">
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <Link to="/">
            <Button variant="outline" size="icon">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <ThemeToggle />
        </div>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            GDB Debugger Learning
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 md:mt-2">
            Master debugging C programs with GDB through interactive examples
          </p>
        </div>
      </header>

      {/* Welcome Guide */}
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">¡Bienvenido al Simulador de GDB!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Aprende a depurar programas paso a paso. Sigue estos pasos para comenzar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">1</Badge>
                  <span>Selecciona un ejemplo de código con bugs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">2</Badge>
                  <span>Revisa los comandos GDB en el centro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">3</Badge>
                  <span>Simula comandos en el panel derecho</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1">
        {/* Left Panel - Code Examples */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                <span>Paso 1: Elige un Ejemplo</span>
                <Badge variant="secondary" className="ml-auto">Código con Bugs</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Bug className="h-4 w-4" />
                <AlertTitle>Código con Errores</AlertTitle>
                <AlertDescription>
                  Cada ejemplo contiene bugs típicos que puedes depurar con GDB
                </AlertDescription>
              </Alert>
              
              <Tabs value={selectedExample} onValueChange={setSelectedExample}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic-debug" className="text-xs">
                    🧠 Memory Bug
                  </TabsTrigger>
                  <TabsTrigger value="segfault" className="text-xs">
                    💥 Segfault
                  </TabsTrigger>
                  <TabsTrigger value="infinite-loop" className="text-xs">
                    🔄 Stack Overflow
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={selectedExample} className="mt-4">
                  <div className="h-[400px] sm:h-[500px]">
                    <CodeEditor 
                      content={exampleCode[selectedExample as keyof typeof exampleCode]}
                      language="c"
                      readOnly={true}
                    />
                  </div>
                  
                  <div className="mt-3 p-3 bg-muted/50 rounded text-xs">
                    <strong>🎯 Bug en este código:</strong>
                    {selectedExample === 'basic-debug' && " Escritura fuera de los límites del array (línea 8)"}
                    {selectedExample === 'segfault' && " Intento de escribir en un puntero NULL (línea 6)"}
                    {selectedExample === 'infinite-loop' && " Recursión infinita sin caso base (línea 5)"}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Middle Panel - GDB Commands & Tutorial */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                <span>Paso 2: Aprende los Comandos</span>
                <Badge variant="secondary" className="ml-auto">Guía de GDB</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Flujo de Depuración</AlertTitle>
                <AlertDescription>
                  Sigue estos pasos en orden para depurar eficientemente
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  🎯 Pasos de Depuración Interactivos:
                </h4>
                <div className="space-y-2">
                  {debuggingSteps.map((step, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded border cursor-pointer transition-all ${
                        currentStep === index 
                          ? 'bg-primary/10 border-primary shadow-sm scale-[1.02]' 
                          : 'hover:bg-muted/50 hover:shadow-sm'
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={currentStep === index ? "default" : "outline"} className="text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium text-sm">{step.step}</span>
                        {currentStep === index && (
                          <ArrowRight className="h-4 w-4 text-primary ml-auto animate-pulse" />
                        )}
                      </div>
                      <code className="text-xs font-mono block p-2 bg-background rounded text-primary">
                        {step.command}
                      </code>
                      <p className="text-xs text-muted-foreground mt-2">
                        {step.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  📚 Comandos Esenciales:
                </h4>
                <div className="space-y-1 max-h-[150px] overflow-y-auto">
                  {gdbCommands.slice(0, 6).map((cmd, index) => (
                    <div key={index} className="p-2 bg-muted/30 rounded text-xs hover:bg-muted/50 transition-colors">
                      <code className="font-mono text-primary font-semibold">{cmd.command}</code>
                      <p className="text-muted-foreground mt-1">{cmd.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Interactive GDB Terminal */}
        <div className="lg:col-span-1">
          <InteractiveTerminal
            title="Paso 3: Terminal GDB Interactivo"
            subtitle="Escribe comandos GDB como en un terminal real"
            onCommand={handleGdbCommand}
            initialMessage={`GNU gdb (GDB) 12.1
Copyright (C) 2022 Free Software Foundation, Inc.
Programa cargado: ./debug_example

Programa listo para depurar. Escribe 'help' para ver comandos.
Tip: Empieza con 'run' para ejecutar el programa.`}
            prompt="(gdb)"
            className="h-[600px]"
          />
        </div>
      </div>
    </div>
  );
};

export default GdbLearning; 