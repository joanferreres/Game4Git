import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Shield, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminStore } from "@/store/gitStore";
import { toast } from "sonner";

const ADMIN_PASSWORD = "shyro";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const { 
    isGdbEnabled, 
    isValgrindEnabled, 
    setGdbEnabled, 
    setValgrindEnabled 
  } = useAdminStore();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAttempts(0);
      toast.success("¡Acceso autorizado! Bienvenido al panel de administración.");
    } else {
      setAttempts(prev => prev + 1);
      toast.error(`Contraseña incorrecta. Intento ${attempts + 1}/3`);
      
      if (attempts >= 2) {
        toast.error("Demasiados intentos fallidos. Recargando página...");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
    setPassword("");
  };

  const handleFeatureToggle = (feature: 'gdb' | 'valgrind', enabled: boolean) => {
    if (feature === 'gdb') {
      setGdbEnabled(enabled);
      toast.success(`GDB ${enabled ? 'activado' : 'desactivado'} exitosamente`);
    } else {
      setValgrindEnabled(enabled);
      toast.success(`Valgrind ${enabled ? 'activado' : 'desactivado'} exitosamente`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/90 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <CardTitle className="text-white text-xl">🔒 Área Restringida</CardTitle>
            <CardDescription className="text-gray-400">
              Panel de administración - Acceso autorizado únicamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-200">
                Esta área está protegida. Se requiere autenticación.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Contraseña de administrador</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa la contraseña..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                  disabled={attempts >= 3}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={attempts >= 3 || !password}
            >
              {attempts >= 3 ? "Bloqueado" : "Acceder"}
            </Button>
            
            {attempts > 0 && attempts < 3 && (
              <p className="text-red-400 text-sm text-center">
                Intentos restantes: {3 - attempts}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🛠️ Panel de Administración
          </h1>
          <p className="text-blue-200">
            Control de funcionalidades avanzadas - Git Game Visualizer
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* GDB Control */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🐛 GDB Debugger
                <span className={`px-2 py-1 rounded text-xs ${
                  isGdbEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {isGdbEnabled ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </CardTitle>
              <CardDescription className="text-blue-200">
                Control de acceso a la sección de debugging con GDB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="gdb-toggle" className="text-white">
                  Habilitar funcionalidad GDB
                </Label>
                <Switch
                  id="gdb-toggle"
                  checked={isGdbEnabled}
                  onCheckedChange={(checked) => handleFeatureToggle('gdb', checked)}
                />
              </div>
              <p className="text-sm text-blue-200">
                {isGdbEnabled 
                  ? "Los usuarios pueden acceder a la sección GDB desde la página principal"
                  : "La sección GDB está oculta para todos los usuarios"
                }
              </p>
            </CardContent>
          </Card>

          {/* Valgrind Control */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🧠 Valgrind Memory
                <span className={`px-2 py-1 rounded text-xs ${
                  isValgrindEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {isValgrindEnabled ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </CardTitle>
              <CardDescription className="text-blue-200">
                Control de acceso a la sección de análisis de memoria con Valgrind
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="valgrind-toggle" className="text-white">
                  Habilitar funcionalidad Valgrind
                </Label>
                <Switch
                  id="valgrind-toggle"
                  checked={isValgrindEnabled}
                  onCheckedChange={(checked) => handleFeatureToggle('valgrind', checked)}
                />
              </div>
              <p className="text-sm text-blue-200">
                {isValgrindEnabled 
                  ? "Los usuarios pueden acceder a la sección Valgrind desde la página principal"
                  : "La sección Valgrind está oculta para todos los usuarios"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <Card className="mt-6 bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">📊 Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Funcionalidades Activas:</h4>
                <ul className="space-y-1 text-blue-200">
                  <li>✅ Git Visualizer (siempre activo)</li>
                  <li className={isGdbEnabled ? 'text-green-400' : 'text-red-400'}>
                    {isGdbEnabled ? '✅' : '❌'} GDB Debugger
                  </li>
                  <li className={isValgrindEnabled ? 'text-green-400' : 'text-red-400'}>
                    {isValgrindEnabled ? '✅' : '❌'} Valgrind Memory
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Acciones:</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setGdbEnabled(true);
                      setValgrindEnabled(true);
                      toast.success("Todas las funcionalidades activadas");
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white border-green-500"
                  >
                    🚀 Activar Todo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setGdbEnabled(false);
                      setValgrindEnabled(false);
                      toast.success("Funcionalidades avanzadas desactivadas");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white border-red-500"
                  >
                    🔒 Desactivar Avanzadas
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            ← Volver a la página principal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin; 