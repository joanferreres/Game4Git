import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Terminal, 
  Code, 
  Bug, 
  Play,
  BookOpen,
  Info,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import CodeEditor from "@/components/CodeEditor";

// Ejemplos de código súper simples para principiantes
const simpleExamples = {
  "crash": {
    title: "🚗 Mi programa se crashea",
    description: "Un programa simple que se rompe. ¡Vamos a arreglarlo!",
    code: `#include <stdio.h>

int main() {
    int edad = 25;
    int* puntero = NULL;  // ¡Puntero vacío!
    
    printf("Mi edad: %d\\n", edad);
    *puntero = 30;  // ¡CRASH! Escribir en vacío
    
    return 0;
}`,
    error: "El programa intenta escribir en un puntero vacío (NULL)",
    fix: "Darle memoria al puntero antes de usarlo"
  },
  
  "array": {
    title: "📚 Me salgo del array",
    description: "Un programa que se pasa de la raya con un array",
    code: `#include <stdio.h>

int main() {
    int notas[3] = {8, 9, 7};  // Solo 3 notas
    int i;
    
    for(i = 0; i <= 5; i++) {  // ¡Problema aquí!
        notas[i] = 10;  // Se sale del array
        printf("Nota %d: %d\\n", i, notas[i]);
    }
    
    return 0;
}`,
    error: "El bucle va hasta 5, pero el array solo tiene 3 posiciones (0,1,2)",
    fix: "Cambiar i <= 5 por i < 3"
  },

  "infinite": {
    title: "🔄 Bucle infinito",
    description: "Un programa que nunca para de contar",
    code: `#include <stdio.h>

void contar(int numero) {
    printf("Contando: %d\\n", numero);
    contar(numero + 1);  // ¡Nunca para!
}

int main() {
    contar(1);
    return 0;
}`,
    error: "La función se llama a sí misma sin parar nunca",
    fix: "Agregar una condición para parar: if (numero > 10) return;"
  }
};

// Comandos GDB súper básicos
const basicCommands = [
  { cmd: "run", desc: "▶️ Ejecutar mi programa", example: "run" },
  { cmd: "bt", desc: "🔍 ¿Dónde se rompió?", example: "bt" },
  { cmd: "list", desc: "👀 Ver mi código", example: "list" },
  { cmd: "print edad", desc: "🔢 Ver valor de 'edad'", example: "print edad" },
  { cmd: "help", desc: "🆘 Ayuda", example: "help" },
  { cmd: "quit", desc: "🚪 Salir", example: "quit" }
];

// Pasos simples de debugging
const debugSteps = [
  { step: 1, title: "▶️ Ejecutar", desc: "Escribe 'run' para empezar", cmd: "run" },
  { step: 2, title: "🔍 Buscar error", desc: "Escribe 'bt' para ver dónde se rompió", cmd: "bt" },
  { step: 3, title: "👀 Ver código", desc: "Escribe 'list' para ver las líneas", cmd: "list" },
  { step: 4, title: "🔢 Revisar datos", desc: "Escribe 'print edad' para ver valores", cmd: "print edad" }
];

const GdbLearning: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState("crash");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "🎮 ¡Bienvenido a GDB para Principiantes!",
    "📝 Vamos a arreglar tu programa paso a paso.",
    "",
    "💡 CONSEJO: Empieza escribiendo 'run' para ejecutar tu programa",
    "(gdb) "
  ]);
  const [currentCommand, setCurrentCommand] = useState("");

  const handleCommand = (cmd: string) => {
    const command = cmd.toLowerCase().trim();
    const example = simpleExamples[selectedExample as keyof typeof simpleExamples];
    
    let response = "";
    
    if (command === "run") {
      response = `🚀 Ejecutando programa...
        
❌ ¡OH NO! Tu programa se rompió
📍 Error en línea 7: ${example.error}
        
💡 TIP: Escribe 'bt' para ver exactamente dónde pasó`;
    } else if (command === "bt" || command === "backtrace") {
      response = `🔍 INVESTIGANDO EL PROBLEMA...

📋 Stack trace (¿dónde se rompió?):
#0  main() at programa.c:7
    
👆 El error está en la línea 7 de tu función main()

💡 TIP: Escribe 'list' para ver el código problemático`;
    } else if (command === "list") {
      response = `👀 CÓDIGO ALREDEDOR DEL ERROR:

5    int* puntero = NULL;
6    printf("Mi edad: %d\\n", edad);
7 ▶️ *puntero = 30;  ⚠️  ¡AQUÍ ESTÁ EL PROBLEMA!
8    return 0;

💡 TIP: Escribe 'print puntero' para ver qué contiene`;
    } else if (command.startsWith("print")) {
      const variable = command.split(" ")[1];
      if (variable === "puntero") {
        response = `🔢 VALOR DE LA VARIABLE:

puntero = 0x0 (NULL)  ⚠️ ¡ESTÁ VACÍO!

🤔 PROBLEMA: Intentas escribir en un puntero vacío
✅ SOLUCIÓN: Dale memoria al puntero primero`;
      } else if (variable === "edad") {
        response = `🔢 VALOR DE LA VARIABLE:

edad = 25  ✅ Esta variable está bien`;
      } else {
        response = `❓ No conozco la variable '${variable}'. 
Prueba con: edad, puntero`;
      }
    } else if (command === "help") {
      response = `🆘 COMANDOS BÁSICOS:

▶️  run     - Ejecutar programa  
🔍 bt      - Ver dónde se rompió
👀 list    - Ver código
🔢 print x - Ver valor de variable x
🚪 quit    - Salir

💡 ¡Prueba 'run' para empezar!`;
    } else if (command === "quit") {
      response = `👋 ¡Hasta luego! 
Recuerda: ¡practicar hace al maestro!`;
    } else {
      response = `❓ No entiendo '${command}'
💡 Prueba: run, bt, list, print, help, quit`;
    }

    setTerminalHistory([...terminalHistory, `(gdb) ${cmd}`, response, ""]);
    setCurrentCommand("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header súper simple */}
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
        <h1 className="text-3xl font-bold mb-2">🐛 Aprende a Arreglar Bugs</h1>
        <p className="text-muted-foreground text-lg">
          GDB para principiantes: ¡Fácil y divertido!
        </p>
      </div>

      {/* Instrucciones súper claras */}
      <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <Info className="h-5 w-5" />
        <AlertTitle className="text-lg">🎯 ¿Cómo funciona?</AlertTitle>
        <AlertDescription className="text-base">
          <strong>1.</strong> Elige un programa roto 👈 
          <strong>2.</strong> Sigue los pasos 👇
          <strong>3.</strong> Escribe comandos en el terminal 👉
          <strong>4.</strong> ¡Arregla el bug! 🎉
        </AlertDescription>
      </Alert>

      {/* Layout súper simple: 3 columnas */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Columna 1: Ejemplos de programas rotos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              1. Elige un programa roto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedExample} onValueChange={setSelectedExample}>
              <TabsList className="grid w-full grid-cols-1 gap-2">
                {Object.entries(simpleExamples).map(([key, example]) => (
                  <TabsTrigger 
                    key={key} 
                    value={key} 
                    className="text-left justify-start p-3 h-auto"
                  >
                    <div>
                      <div className="font-semibold">{example.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {example.description}
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={selectedExample} className="mt-4">
                <div className="h-[300px] mb-4">
                  <CodeEditor 
                    content={simpleExamples[selectedExample as keyof typeof simpleExamples].code}
                    language="c"
                    readOnly={true}
                  />
                </div>
                
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">🚨 Problema:</AlertTitle>
                  <AlertDescription className="text-sm">
                    {simpleExamples[selectedExample as keyof typeof simpleExamples].error}
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Columna 2: Pasos a seguir */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              2. Sigue estos pasos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {debugSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{step.desc}</p>
                  <code className="text-xs bg-background p-1 rounded border">
                    {step.cmd}
                  </code>
                </div>
              </div>
            ))}

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">✅ Solución:</AlertTitle>
              <AlertDescription className="text-sm">
                {simpleExamples[selectedExample as keyof typeof simpleExamples].fix}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🎮 Comandos básicos:</h4>
              {basicCommands.map((cmd, index) => (
                <div key={index} className="text-xs p-2 bg-background rounded border">
                  <code className="font-mono text-blue-600">{cmd.example}</code>
                  <span className="ml-2 text-muted-foreground">{cmd.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Columna 3: Terminal súper simple */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              3. Terminal de debugging
              <Badge variant="secondary" className="ml-auto">
                ¡Pruébalo!
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Área del terminal */}
            <div className="h-[400px] bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-y-auto">
              {terminalHistory.map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))}
            </div>
            
            {/* Input del terminal */}
            <div className="mt-4 flex items-center gap-2">
              <span className="font-mono text-blue-600">(gdb)</span>
              <input
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un comando aquí..."
                className="flex-1 p-2 border rounded font-mono text-sm"
              />
              <Button 
                onClick={() => handleCommand(currentCommand)}
                size="sm"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              💡 Prueba escribiendo: <code>run</code> para empezar
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de ayuda final */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🎯 ¿Qué aprendes aquí?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>✅ Cómo ejecutar un programa en GDB</div>
            <div>✅ Encontrar dónde se rompe tu código</div>
            <div>✅ Ver el valor de tus variables</div>
            <div>✅ Entender mensajes de error comunes</div>
            <div>✅ Arreglar bugs típicos de principiantes</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">💡 Consejos para principiantes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>🔥 <strong>Siempre compila con:</strong> <code>gcc -g programa.c</code></div>
            <div>🚀 <strong>Empieza con:</strong> <code>run</code></div>
            <div>🔍 <strong>Cuando se rompa:</strong> <code>bt</code></div>
            <div>👀 <strong>Para ver código:</strong> <code>list</code></div>
            <div>🔢 <strong>Para ver variables:</strong> <code>print nombre</code></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GdbLearning; 