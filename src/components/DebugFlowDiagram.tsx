import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Terminal, Bug, Search, Eye, Zap } from "lucide-react";

interface DebugFlowDiagramProps {
  currentStep?: number;
  className?: string;
}

const DebugFlowDiagram: React.FC<DebugFlowDiagramProps> = ({
  currentStep = 0,
  className = ""
}) => {
  
  const debugSteps = [
    {
      icon: Terminal,
      command: "run",
      title: "1. Ejecutar Programa",
      description: "El programa se ejecuta hasta encontrar el bug y crashear",
      output: "Program received signal SIGSEGV",
      color: "blue"
    },
    {
      icon: Search,
      command: "backtrace",
      title: "2. Analizar Stack",
      description: "Ver exactamente dónde ocurrió el error en el código",
      output: "#0 main() at programa.c:8",
      color: "green"
    },
    {
      icon: Eye,
      command: "list",
      title: "3. Ver Código Fuente",
      description: "Examinar las líneas de código alrededor del error",
      output: "8    arr[10] = 42;  // ← Error aquí!",
      color: "purple"
    },
    {
      icon: Bug,
      command: "print variables",
      title: "4. Inspeccionar Variables",
      description: "Verificar valores de variables para entender el problema",
      output: "i = 10, arr[10] = fuera de límites",
      color: "orange"
    },
    {
      icon: Zap,
      command: "fix & recompile",
      title: "5. Corregir y Verificar",
      description: "Corregir el bug y compilar nuevamente con depuración",
      output: "Bug resuelto: cambiar <= por <",
      color: "red"
    }
  ];

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          🔄 Flujo de Debugging con GDB
          <Badge variant="secondary" className="ml-auto text-xs">
            Proceso Visual
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {debugSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className="relative">
                <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  isActive 
                    ? 'bg-primary/10 border-primary shadow-sm scale-[1.02]' 
                    : isCompleted 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}>
                  
                  {/* Step Icon & Number */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${
                        isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                      }`} />
                      <h4 className={`font-semibold text-sm ${
                        isActive ? 'text-primary' : isCompleted ? 'text-green-700 dark:text-green-400' : ''
                      }`}>
                        {step.title}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    
                    {/* Command Display */}
                    <div className="bg-black/5 dark:bg-white/5 p-2 rounded font-mono text-xs">
                      <span className="text-blue-600 dark:text-blue-400">(gdb)</span>{' '}
                      <span className="text-gray-700 dark:text-gray-300">{step.command}</span>
                    </div>
                    
                    {/* Expected Output */}
                    <div className="bg-gray-800 text-green-400 p-2 rounded font-mono text-xs">
                      {step.output}
                    </div>
                  </div>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                {/* Arrow to next step */}
                {index < debugSteps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className={`h-4 w-4 ${
                      index < currentStep ? 'text-green-500' : 'text-muted-foreground'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Summary/Tips */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <h5 className="font-semibold text-sm text-blue-700 dark:text-blue-300 mb-2">
            💡 Consejo Pro:
          </h5>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Sigue siempre este orden: <strong>run → backtrace → list → print</strong>. 
            Es la secuencia más eficiente para diagnosticar cualquier bug en C.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugFlowDiagram; 