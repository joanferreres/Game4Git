import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Zap, Target, Info } from "lucide-react";

interface MemoryVisualizerProps {
  selectedExample: string;
  className?: string;
}

const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({
  selectedExample,
  className = ""
}) => {
  
  const getVisualizationData = () => {
    switch (selectedExample) {
      case 'basic-debug':
        return {
          title: "🧠 Array Buffer Overflow",
          description: "Visualización del array y el desbordamiento de memoria",
          memoryLayout: [
            { address: "0x7fff000", value: "1", index: 0, valid: true, label: "arr[0]" },
            { address: "0x7fff004", value: "2", index: 1, valid: true, label: "arr[1]" },
            { address: "0x7fff008", value: "3", index: 2, valid: true, label: "arr[2]" },
            { address: "0x7fff00c", value: "4", index: 3, valid: true, label: "arr[3]" },
            { address: "0x7fff010", value: "5", index: 4, valid: true, label: "arr[4]" },
            { address: "0x7fff014", value: "6", index: 5, valid: true, label: "arr[5]" },
            { address: "0x7fff018", value: "7", index: 6, valid: true, label: "arr[6]" },
            { address: "0x7fff01c", value: "8", index: 7, valid: true, label: "arr[7]" },
            { address: "0x7fff020", value: "9", index: 8, valid: true, label: "arr[8]" },
            { address: "0x7fff024", value: "10", index: 9, valid: true, label: "arr[9]" },
            { address: "0x7fff028", value: "42", index: 10, valid: false, label: "OVERFLOW!", error: true },
            { address: "0x7fff02c", value: "???", index: 11, valid: false, label: "Corrupted", error: true }
          ],
          variables: [
            { name: "arr", type: "int[10]", address: "0x7fff000", size: "40 bytes" },
            { name: "i", type: "int", address: "0x7fff030", size: "4 bytes", value: "10" }
          ],
          issue: "El bucle va de 0 a 10 (inclusive), pero el array solo tiene índices 0-9. Escribir en arr[10] corrompe memoria adyacente."
        };
      
      case 'segfault':
        return {
          title: "💥 NULL Pointer Dereference", 
          description: "Visualización del puntero NULL y el acceso inválido",
          memoryLayout: [
            { address: "0x000000", value: "???", index: 0, valid: false, label: "NULL ADDRESS", error: true, isNull: true },
            { address: "0x7fff000", value: "NULL", index: 0, valid: true, label: "ptr variable", isPointer: true }
          ],
          variables: [
            { name: "ptr", type: "int*", address: "0x7fff000", size: "8 bytes", value: "0x0 (NULL)" }
          ],
          issue: "El puntero 'ptr' es NULL (0x0). Intentar acceder a *ptr provoca segmentation fault porque el SO protege la dirección 0x0."
        };
        
      case 'infinite-loop':
        return {
          title: "📚 Stack Overflow",
          description: "Visualización del crecimiento descontrolado del stack",
          memoryLayout: [
            { address: "0x7fff000", value: "factorial(20000)", index: 0, valid: true, label: "Frame 1" },
            { address: "0x7ffeff0", value: "factorial(19999)", index: 1, valid: true, label: "Frame 2" },
            { address: "0x7ffefe0", value: "factorial(19998)", index: 2, valid: true, label: "Frame 3" },
            { address: "0x7ffe000", value: "...", index: 3, valid: true, label: "..." },
            { address: "0x7f00000", value: "factorial(1)", index: 4, valid: false, label: "Frame 19999", error: true },
            { address: "0x7efffff", value: "STACK LIMIT", index: 5, valid: false, label: "OVERFLOW!", error: true }
          ],
          variables: [
            { name: "n", type: "int", address: "Stack", size: "4 bytes", value: "19998" },
            { name: "Stack Size", type: "Total", address: "~8MB", size: "EXCEEDED", value: "19999 frames" }
          ],
          issue: "La recursión nunca termina porque falta el caso base (n == 1). Cada llamada consume stack memory hasta agotar los ~8MB disponibles."
        };
        
      default:
        return null;
    }
  };

  const data = getVisualizationData();
  if (!data) return null;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-purple-500" />
          <span>{data.title}</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Visual Debug
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{data.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Memory Layout Visualization */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            🎯 Layout de Memoria:
          </h4>
          <div className="grid gap-1">
            {data.memoryLayout.map((item, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-2 rounded border text-xs font-mono ${
                  item.error 
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                    : item.isNull
                    ? 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                    : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  item.error ? 'bg-red-500' : item.isNull ? 'bg-gray-500' : 'bg-green-500'
                }`}></div>
                
                <div className="flex-1 grid grid-cols-4 gap-2 items-center">
                  <span className={`text-xs ${
                    item.error ? 'text-red-600' : item.isNull ? 'text-gray-600' : 'text-blue-600'
                  }`}>
                    {item.address}
                  </span>
                  <span className={`font-bold ${
                    item.error ? 'text-red-700' : item.isNull ? 'text-gray-700' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {item.value}
                  </span>
                  <span className={`text-xs ${
                    item.error ? 'text-red-600' : item.isNull ? 'text-gray-600' : 'text-green-600'
                  }`}>
                    {item.label}
                  </span>
                  {item.error && (
                    <AlertTriangle className="h-3 w-3 text-red-500 ml-auto" />
                  )}
                  {item.isPointer && (
                    <span className="text-xs text-purple-600">→ NULL</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Variables Table */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            📊 Variables y Tipos:
          </h4>
          <div className="overflow-hidden rounded border">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 font-semibold">Variable</th>
                  <th className="text-left p-2 font-semibold">Tipo</th>
                  <th className="text-left p-2 font-semibold">Dirección</th>
                  <th className="text-left p-2 font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.variables.map((variable, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 font-mono font-bold text-blue-600">{variable.name}</td>
                    <td className="p-2 font-mono text-purple-600">{variable.type}</td>
                    <td className="p-2 font-mono text-gray-600">{variable.address}</td>
                    <td className="p-2 font-mono">{variable.value || variable.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Explanation */}
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <Info className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm">
            <strong className="text-orange-700 dark:text-orange-300">💡 ¿Qué está pasando?</strong>
            <br />
            <span className="text-orange-600 dark:text-orange-400">{data.issue}</span>
          </AlertDescription>
        </Alert>

        {/* GDB Commands Suggestion */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
          <h5 className="font-semibold text-sm text-blue-700 dark:text-blue-300 mb-2">
            🔧 Comandos GDB Recomendados:
          </h5>
          <div className="space-y-1 text-xs">
            <div className="font-mono bg-white dark:bg-gray-800 p-1 rounded border">
              <span className="text-blue-600">(gdb)</span> <span className="text-gray-700 dark:text-gray-300">run</span>
              <span className="ml-2 text-gray-500">← Ejecutar hasta el crash</span>
            </div>
            <div className="font-mono bg-white dark:bg-gray-800 p-1 rounded border">
              <span className="text-blue-600">(gdb)</span> <span className="text-gray-700 dark:text-gray-300">print {data.variables[0]?.name || 'variable'}</span>
              <span className="ml-2 text-gray-500">← Ver valor de la variable</span>
            </div>
            <div className="font-mono bg-white dark:bg-gray-800 p-1 rounded border">
              <span className="text-blue-600">(gdb)</span> <span className="text-gray-700 dark:text-gray-300">backtrace</span>
              <span className="ml-2 text-gray-500">← Ver stack trace</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemoryVisualizer; 