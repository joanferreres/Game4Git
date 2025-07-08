import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Code, 
  HardDrive, 
  Search,
  Home,
  Info,
  Zap
} from "lucide-react";
import { useTranslation } from "react-i18next";
import CodeEditor from "@/components/CodeEditor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

const ValgrindLearning: React.FC = () => {
  const { t } = useTranslation();
  const [selectedExample, setSelectedExample] = useState("memory-leak");
  const [valgrindOutput, setValgrindOutput] = useState("");
  const [selectedTool, setSelectedTool] = useState("memcheck");

  // Example C code with memory issues for Valgrind analysis
  const exampleCode = {
    "memory-leak": `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Memory leak: malloc without free
    int *ptr1 = malloc(sizeof(int) * 100);
    *ptr1 = 42;
    
    // Another leak
    char *ptr2 = malloc(256);
    
    printf("Values: %d\\n", *ptr1);
    
    // Missing: free(ptr1); free(ptr2);
    return 0;
}`,
    "buffer-overflow": `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char buffer[10];
    
    // Buffer overflow: writing past buffer end
    strcpy(buffer, "This string is too long for the buffer!");
    
    printf("Buffer: %s\\n", buffer);
    return 0;
}`,
    "use-after-free": `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *ptr = malloc(sizeof(int));
    *ptr = 123;
    
    free(ptr);
    
    // Use after free - accessing freed memory
    printf("Value: %d\\n", *ptr);
    
    return 0;
}`,
    "double-free": `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *ptr = malloc(sizeof(int) * 10);
    *ptr = 42;
    
    free(ptr);
    
    // Double free - freeing already freed memory
    free(ptr);
    
    return 0;
}`
  };

  const valgrindTools = [
    { 
      id: "memcheck", 
      name: "Memcheck", 
      description: "Detects memory errors like leaks, buffer overflows, use-after-free",
      command: "valgrind --tool=memcheck --leak-check=full"
    },
    { 
      id: "cachegrind", 
      name: "Cachegrind", 
      description: "Cache profiler that shows cache misses and memory hierarchy performance",
      command: "valgrind --tool=cachegrind"
    },
    { 
      id: "callgrind", 
      name: "Callgrind", 
      description: "Call-graph profiler for function call costs and performance analysis",
      command: "valgrind --tool=callgrind"
    },
    { 
      id: "helgrind", 
      name: "Helgrind", 
      description: "Thread error detector for race conditions and deadlocks",
      command: "valgrind --tool=helgrind"
    }
  ];

  const memoryErrors = [
    {
      type: "Memory Leak",
      description: "Allocated memory never freed",
      severity: "medium",
      example: "malloc() without corresponding free()"
    },
    {
      type: "Buffer Overflow",
      description: "Writing past allocated memory boundaries",
      severity: "high",
      example: "strcpy() to undersized buffer"
    },
    {
      type: "Use After Free",
      description: "Accessing memory after it's been freed",
      severity: "high",
      example: "Reading *ptr after free(ptr)"
    },
    {
      type: "Double Free",
      description: "Calling free() twice on same memory",
      severity: "high",
      example: "free(ptr); free(ptr);"
    },
    {
      type: "Invalid Read/Write",
      description: "Accessing uninitialized or invalid memory",
      severity: "high",
      example: "Reading uninitialized variables"
    }
  ];

  const simulateValgrindOutput = (example: string) => {
    const outputs: { [key: string]: string } = {
      "memory-leak": `==12345== Memcheck, a memory error detector
==12345== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==12345== Using Valgrind-3.15.0
==12345== Command: ./program
==12345== 
Values: 42
==12345== 
==12345== HEAP SUMMARY:
==12345==     in use at exit: 656 bytes in 2 blocks
==12345==     total heap usage: 2 allocs, 0 frees, 656 bytes allocated
==12345== 
==12345== 400 bytes in 1 blocks are definitely lost in loss record 1 of 2:
==12345==    at 0x4C2DB8F: malloc (in /usr/lib/valgrind/vgpreload_memcheck.so)
==12345==    by 0x108667: main (program.c:6)
==12345== 
==12345== 256 bytes in 1 blocks are definitely lost in loss record 2 of 2:
==12345==    at 0x4C2DB8F: malloc (in /usr/lib/valgrind/vgpreload_memcheck.so)
==12345==    by 0x108678: main (program.c:10)
==12345== 
==12345== LEAK SUMMARY:
==12345==     definitely lost: 656 bytes in 2 blocks`,
      
      "buffer-overflow": `==12345== Memcheck, a memory error detector
==12345== Invalid write of size 1
==12345==    at 0x4C32CF0: strcpy (in /usr/lib/valgrind/vgpreload_memcheck.so)
==12345==    by 0x108675: main (program.c:8)
==12345==  Address 0x1ffefff00a is on thread 1's stack
==12345==  in frame #0, created by main (program.c:5)
==12345== 
==12345== Invalid read of size 1
==12345==    at 0x4E88CC0: __vfprintf_internal (vfprintf-internal.c:1688)
==12345==    by 0x108689: main (program.c:10)`,
      
      "use-after-free": `==12345== Memcheck, a memory error detector
==12345== Invalid read of size 4
==12345==    at 0x108678: main (program.c:10)
==12345==  Address 0x522d040 is 0 bytes inside a block of size 4 free'd
==12345==    at 0x4C30D3B: free (in /usr/lib/valgrind/vgpreload_memcheck.so)
==12345==    by 0x108672: main (program.c:8)
==12345==  Block was alloc'd at
==12345==    at 0x4C2FB0F: malloc (in /usr/lib/valgrind/vgpreload_memcheck.so)
==12345==    by 0x108665: main (program.c:5)`,
      
      "double-free": `==12345== Memcheck, a memory error detector
==12345== Invalid free() / delete / delete[] / realloc()
==12345==    at 0x4C30D3B: free (in /usr/lib/valgrind/vgpreload_memcheck.so)
==12345==    by 0x108682: main (program.c:11)
==12345==  Address 0x522d040 is 0 bytes inside a block of size 40 free'd
==12345==    at 0x4C30D3B: free (in /usr/lib/valgrind/vgpreload_memcheck.so)
==12345==    by 0x108678: main (program.c:9)
==12345==  Block was alloc'd at
==12345==    at 0x4C2FB0F: malloc (in /usr/lib/valgrind/vgpreload_memcheck.so)
==12345==    by 0x108665: main (program.c:5)`
    };

    setValgrindOutput(outputs[example] || "Valgrind analysis completed - no errors found!");
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
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
            Valgrind Memory Debugging
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 md:mt-2">
            Detect memory errors and leaks with Valgrind's powerful analysis tools
          </p>
        </div>
      </header>

      {/* Welcome Guide */}
      <Card className="mb-6 border-l-4 border-l-red-500">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">¡Bienvenido al Analizador de Memoria Valgrind!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Detecta errores de memoria antes de que causen problemas en producción:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700">1</Badge>
                  <span>Elige un tipo de error de memoria</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">2</Badge>
                  <span>Conoce las herramientas disponibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">3</Badge>
                  <span>Analiza el código con Valgrind</span>
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
                <span>Paso 1: Selecciona el Error</span>
                <Badge variant="secondary" className="ml-auto">Código Problemático</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Errores de Memoria Comunes</AlertTitle>
                <AlertDescription>
                  Cada ejemplo muestra un tipo diferente de error que Valgrind puede detectar
                </AlertDescription>
              </Alert>
              
              <Tabs value={selectedExample} onValueChange={setSelectedExample}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="memory-leak" className="text-xs">
                    🕳️ Memory Leak
                  </TabsTrigger>
                  <TabsTrigger value="buffer-overflow" className="text-xs">
                    💥 Buffer Overflow
                  </TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-2 mt-2">
                  <TabsTrigger value="use-after-free" className="text-xs">
                    ☠️ Use After Free
                  </TabsTrigger>
                  <TabsTrigger value="double-free" className="text-xs">
                    ⚠️ Double Free
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
                    <strong>🚨 Problema detectado:</strong>
                    {selectedExample === 'memory-leak' && " Memoria allocada con malloc() nunca liberada con free()"}
                    {selectedExample === 'buffer-overflow' && " strcpy() escribe más allá del tamaño del buffer"}
                    {selectedExample === 'use-after-free' && " Acceso a memoria después de llamar a free()"}
                    {selectedExample === 'double-free' && " Llamada a free() dos veces sobre el mismo puntero"}
                  </div>
                  
                  <Button 
                    onClick={() => simulateValgrindOutput(selectedExample)}
                    className="w-full mt-3"
                    size="sm"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    🔍 Ejecutar Análisis de Valgrind
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Middle Panel - Valgrind Tools & Memory Errors */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                <span>Paso 2: Conoce las Herramientas</span>
                <Badge variant="secondary" className="ml-auto">Suite Valgrind</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <HardDrive className="h-4 w-4" />
                <AlertTitle>Suite de Análisis</AlertTitle>
                <AlertDescription>
                  Valgrind ofrece múltiples herramientas especializadas para diferentes aspectos del código
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  🛠️ Herramientas Especializadas:
                </h4>
                <Tabs value={selectedTool} onValueChange={setSelectedTool}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="memcheck" className="text-xs">🔍 Memcheck</TabsTrigger>
                    <TabsTrigger value="cachegrind" className="text-xs">⚡ Cachegrind</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-2 mt-1">
                    <TabsTrigger value="callgrind" className="text-xs">📊 Callgrind</TabsTrigger>
                    <TabsTrigger value="helgrind" className="text-xs">🧵 Helgrind</TabsTrigger>
                  </TabsList>
                  
                  {valgrindTools.map((tool) => (
                    <TabsContent key={tool.id} value={tool.id} className="mt-3">
                      <div className="p-3 bg-muted/30 rounded border-l-4 border-l-primary">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-sm">{tool.name}</h5>
                          {tool.name === 'Memcheck' && <Badge className="bg-green-100 text-green-700">⭐ Recomendado</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{tool.description}</p>
                        <code className="text-xs font-mono block p-2 bg-background rounded border">
                          {tool.command}
                        </code>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  🚨 Errores que Detecta Memcheck:
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {memoryErrors.map((error, index) => (
                    <div key={index} className="p-2 border rounded hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{error.type}</span>
                        <Badge variant={error.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {error.severity === 'high' ? '🔴 Alto' : '🟡 Medio'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{error.description}</p>
                      <code className="text-xs text-primary block bg-muted/50 p-1 rounded">{error.example}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded text-xs">
                <strong>⚡ Pro Tip:</strong> Usa siempre <code className="bg-background px-1 rounded">--leak-check=full</code> para detectar todos los memory leaks.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Valgrind Output */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                <span>Paso 3: Analiza la Salida</span>
                <Badge variant="secondary" className="ml-auto">Resultados</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                <Terminal className="h-4 w-4" />
                <AlertTitle>¡Hora del Análisis!</AlertTitle>
                <AlertDescription>
                  Haz clic en "Ejecutar Análisis" del panel izquierdo para ver los errores detectados
                </AlertDescription>
              </Alert>

              <div className="bg-black text-green-400 p-3 rounded font-mono text-xs h-[280px] overflow-y-auto border-2 border-dashed border-muted">
                <div className="whitespace-pre-wrap">
                  {valgrindOutput || "📊 Terminal de Valgrind - Los resultados aparecerán aquí\\n\\n🎯 Instrucciones:\\n1. Selecciona un tipo de error en el panel izquierdo\\n2. Haz clic en '🔍 Ejecutar Análisis de Valgrind'\\n3. Observa cómo Valgrind detecta y reporta el error\\n\\n💡 Cada tipo de error tiene su propia 'huella digital' en la salida"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setValgrindOutput("")}
                  className="text-xs"
                >
                  🗑️ Limpiar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => simulateValgrindOutput(selectedExample)}
                  className="text-xs"
                >
                  <Play className="h-3 w-3 mr-1" />
                  🔄 Re-ejecutar
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  🚀 Opciones Clave de Valgrind:
                </h4>
                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                  <div className="p-2 bg-muted/30 rounded text-xs">
                    <code className="font-semibold text-primary">--leak-check=full</code>
                    <p className="text-muted-foreground mt-1">📊 Reporte detallado de memory leaks</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-xs">
                    <code className="font-semibold text-primary">--show-leak-kinds=all</code>
                    <p className="text-muted-foreground mt-1">🔍 Muestra todos los tipos de leaks</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-xs">
                    <code className="font-semibold text-primary">--track-origins=yes</code>
                    <p className="text-muted-foreground mt-1">🎯 Rastrea valores no inicializados</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  ⚡ Consejos de Rendimiento:
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• 🐌 Los programas van 10-50x más lentos</li>
                  <li>• 📉 Usa datasets pequeños para testing</li>
                  <li>• 🔧 Compila siempre con <code className="bg-muted px-1 rounded">gcc -g</code></li>
                  <li>• 🎯 Corrige errores en el orden que aparecen</li>
                  <li>• 🏁 Un error arreglado puede resolver varios reportes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ValgrindLearning; 