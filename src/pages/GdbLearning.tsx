import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Terminal, 
  Code, 
  Bug, 
  Target,
  BookOpen,
  Info,
  ArrowRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import CodeEditor from "@/components/CodeEditor";
import RealisticGdbTerminal from "@/components/RealisticGdbTerminal";
import MemoryVisualizer from "@/components/MemoryVisualizer";

// Example code with realistic bugs
const exampleCode = {
  "basic-debug": `#include <stdio.h>

int main() {
    int arr[10] = {1,2,3,4,5,6,7,8,9,10};
    int i;
    
    for(i = 0; i <= 10; i++) {
        arr[10] = 42;  // ← Buffer overflow!
        printf("arr[%d] = %d\\n", i, arr[i]);
    }
    return 0;
}`,

  "segfault": `#include <stdio.h>

int main() {
    int *ptr = NULL;
    
    *ptr = 10;  // ← NULL pointer dereference!
    printf("Valor: %d\\n", *ptr);
    
    return 0;
}`,

  "infinite-loop": `#include <stdio.h>

int factorial(int n) {
    if (n <= 0) return 1;  // Missing n == 1 case!
    return n * factorial(n - 1);  // ← Infinite recursion!
}

int main() {
    int result = factorial(20000);
    printf("Resultado: %d\\n", result);
    return 0;
}`
};

// Essential GDB commands
const gdbCommands = [
  { command: "run (r)", description: "Ejecuta el programa hasta que termine o crashee" },
  { command: "backtrace (bt)", description: "Muestra el stack trace completo" },
  { command: "list (l)", description: "Muestra el código fuente actual" },
  { command: "print <var>", description: "Muestra el valor de una variable" },
  { command: "info locals", description: "Lista todas las variables locales" },
  { command: "info registers", description: "Muestra todos los registros del CPU" },
  { command: "break <line>", description: "Establece un breakpoint en una línea" },
  { command: "continue (c)", description: "Continúa ejecución hasta el siguiente breakpoint" },
  { command: "step (s)", description: "Ejecuta una línea (entra en funciones)" },
  { command: "next (n)", description: "Ejecuta una línea (no entra en funciones)" },
  { command: "disassemble", description: "Muestra el código ensamblador" },
  { command: "quit (q)", description: "Sale de GDB" }
];

const GdbLearning: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState("basic-debug");

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6 text-center relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <Link to="/">
            <Button variant="outline" size="icon">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">🐛 GDB Debugger Master Class</h1>
        <p className="text-muted-foreground">
          Experiencia 100% realista: terminal auténtico + visualización de memoria
        </p>
      </div>

      {/* Ultra-realistic Tutorial Banner */}
      <Alert className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800">
        <Terminal className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          🎯 Tutorial Completamente Realista
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Target className="h-3 w-3 mr-1" />
            100% Auténtico
          </Badge>
        </AlertTitle>
        <AlertDescription>
          <strong>1.</strong> Selecciona un bug realista →{' '}
          <strong>2.</strong> Ve la visualización de memoria →{' '}
          <strong>3.</strong> Usa el terminal GDB exactamente como en la vida real
        </AlertDescription>
      </Alert>

      {/* Main Content - 4 Column Grid */}
      <div className="grid gap-6 lg:grid-cols-4 lg:gap-6">
        
        {/* Column 1 - Code Examples */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Code className="h-4 w-4" />
                <span>🔍 Código con Bugs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedExample} onValueChange={setSelectedExample}>
                <TabsList className="grid w-full grid-cols-1 gap-1">
                  <TabsTrigger value="basic-debug" className="text-xs justify-start">
                    🧠 Buffer Overflow
                  </TabsTrigger>
                  <TabsTrigger value="segfault" className="text-xs justify-start">
                    💥 NULL Pointer
                  </TabsTrigger>
                  <TabsTrigger value="infinite-loop" className="text-xs justify-start">
                    📚 Stack Overflow
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={selectedExample} className="mt-4">
                  <div className="h-[300px]">
                    <CodeEditor 
                      content={exampleCode[selectedExample as keyof typeof exampleCode]}
                      language="c"
                      readOnly={true}
                    />
                  </div>
                  
                  <div className="mt-3 p-3 bg-muted/50 rounded text-xs">
                    <strong>🎯 Bug:</strong>
                    {selectedExample === 'basic-debug' && " Array out of bounds en línea 8"}
                    {selectedExample === 'segfault' && " NULL pointer dereference en línea 6"}
                    {selectedExample === 'infinite-loop' && " Recursión infinita en línea 5"}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Column 2 - Memory Visualization */}
        <div className="lg:col-span-1">
          <MemoryVisualizer 
            selectedExample={selectedExample} 
            className="h-full"
          />
        </div>

        {/* Column 3 - GDB Commands Reference */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4" />
                <span>📚 Referencia GDB</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle className="text-sm">Comandos Esenciales</AlertTitle>
                <AlertDescription className="text-xs">
                  Estos comandos funcionan igual que en GDB real
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">🚀 Flujo de Debug:</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">1</span>
                    <code className="font-mono">run</code>
                    <span className="text-muted-foreground">Ejecutar programa</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">2</span>
                    <code className="font-mono">backtrace</code>
                    <span className="text-muted-foreground">Ver stack trace</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <span className="bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">3</span>
                    <code className="font-mono">list</code>
                    <span className="text-muted-foreground">Ver código</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <span className="bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">4</span>
                    <code className="font-mono">print var</code>
                    <span className="text-muted-foreground">Inspeccionar</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">⚡ Todos los comandos:</h4>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {gdbCommands.map((cmd, index) => (
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

        {/* Column 4 - Realistic GDB Terminal */}
        <div className="lg:col-span-1">
          <RealisticGdbTerminal 
            selectedExample={selectedExample}
            className="h-[600px]"
          />
        </div>
      </div>

      {/* Bottom Enhancement - Advanced Tips */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              🎯 Debugging Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <strong>💡 Compila siempre con:</strong>
              <code className="block mt-1 font-mono bg-white dark:bg-gray-800 p-1 rounded">gcc -g -O0 programa.c</code>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <strong>🔍 Para arrays:</strong>
              <code className="block mt-1 font-mono bg-white dark:bg-gray-800 p-1 rounded">print arr@length</code>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
              <strong>📍 Breakpoints condicionales:</strong>
              <code className="block mt-1 font-mono bg-white dark:bg-gray-800 p-1 rounded">break 10 if i &gt; 5</code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              🧠 Análisis de Memoria
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <strong>🚨 Buffer Overflow:</strong>
              <p className="text-muted-foreground mt-1">Escribir fuera del array corrompe memoria adyacente</p>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
              <strong>💥 Segfault:</strong>
              <p className="text-muted-foreground mt-1">Acceso a memoria no válida (NULL, no inicializada)</p>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <strong>📚 Stack Overflow:</strong>
              <p className="text-muted-foreground mt-1">Demasiadas llamadas recursivas agotan el stack</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              ⚡ Comandos Avanzados
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="space-y-1">
              <code className="font-mono bg-muted p-1 rounded block">info registers</code>
              <p className="text-muted-foreground">Ver estado de registros CPU</p>
            </div>
            <div className="space-y-1">
              <code className="font-mono bg-muted p-1 rounded block">disassemble</code>
              <p className="text-muted-foreground">Ver código ensamblador</p>
            </div>
            <div className="space-y-1">
              <code className="font-mono bg-muted p-1 rounded block">x/10x $rsp</code>
              <p className="text-muted-foreground">Examinar memoria del stack</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GdbLearning; 