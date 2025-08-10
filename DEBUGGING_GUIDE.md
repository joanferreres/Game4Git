# Guía Educativa de Depuración con GDB y Valgrind

## 1. GDB (GNU Debugger)

### Conceptos Básicos
GDB es un depurador potente que te permite inspeccionar lo que está sucediendo dentro de un programa mientras se ejecuta, permitiéndote encontrar y corregir errores de manera más eficiente.

### Comandos Esenciales

```bash
gcc -g programa.c -o programa  # Compila con información de depuración
gdb ./programa                # Inicia GDB con el programa
```

### Ejemplo Práctico

**programa.c**
```c
#include <stdio.h>

// Función que calcula el factorial de un número
int factorial(int n) {
    // Caso base: factorial de 0 o 1 es 1
    if (n <= 1) return 1;
    // Llamada recursiva para calcular el factorial
    return n * factorial(n-1);
}

int main() {
    int numero = 5;
    int resultado = factorial(numero);
    printf("El factorial de %d es %d\n", numero, resultado);
    return 0;
}
```

**Flujo de trabajo en GDB:**

1. **Compilación:**
   ```bash
   gcc -g programa.c -o programa
   ```

2. **Comandos básicos en GDB:**
   ```
   (gdb) break main        # Establece punto de interrupción en main
   (gdb) run              # Inicia la ejecución del programa
   (gdb) next             # Ejecuta la siguiente línea (sin entrar en funciones)
   (gdb) step             # Entra en la función actual
   (gdb) print variable   # Muestra el valor de una variable
   (gdb) backtrace        # Muestra la pila de llamadas
   (gdb) continue         # Continúa la ejecución hasta el siguiente breakpoint
   ```

## 2. Valgrind

### ¿Qué es Valgrind?
Valgrind es una herramienta esencial para detectar fugas de memoria, accesos inválidos a memoria, condiciones de carrera y otros errores comunes en programas en C y C++.

### Uso Básico
```bash
valgrind --leak-check=full ./programa
```

### Ejemplo de Detección de Errores

**programa_con_fuga.c**
```c
#include <stdlib.h>

void fuga_memoria() {
    // Se asigna memoria que nunca se libera
    int *arreglo = malloc(10 * sizeof(int));
    // Aquí debería ir: free(arreglo);
}

int main() {
    fuga_memoria();
    return 0;
}
```

**Salida de Valgrind (ejemplo):**
```
==12345== RESUMEN DE USO DE MEMORIA:
==12345==     en uso al finalizar: 40 bytes en 1 bloques
==12345==   uso total del heap: 1 asignaciones, 0 liberaciones, 40 bytes asignados
==12345== 
==12345== 40 bytes en 1 bloques están definitivamente perdidos en el registro 1 de 1
==12345==    en 0x4C2FB0F: malloc (vg_replace_malloc.c:309)
==12345==    por 0x400537: fuga_memoria (programa_con_fuga.c:3)
==12345==    por 0x400547: main (programa_con_fuga.c:8)
```

## 3. Consejos Visuales

### Modo TUI de GDB
Activa la interfaz gráfica de GDB para una mejor visualización:
```bash
gdb -tui ./programa
```

Comandos útiles dentro de GDB TUI:
```
(gdb) layout src   # Muestra el código fuente
(gdb) layout asm   # Muestra el código ensamblador
(gdb) layout regs  # Muestra los registros del procesador
(gdb) focus cmd    # Cambia el foco a la consola de comandos
(gdb) focus src    # Cambia el foco al código fuente
```

### Visualización de Memoria
```
(gdb) x/10xw &variable  # Muestra 10 palabras (4 bytes cada una) en hexadecimal
(gdb) x/s puntero      # Muestra el contenido como una cadena de texto
(gdb) x/i $pc          # Muestra la instrucción actual del procesador
(gdb) x/20i main       # Muestra las primeras 20 instrucciones de main
```

## 4. Ejercicios Recomendados

1. **Práctica con GDB**
   - Crea un programa que ordene un arreglo de números
   - Depura paso a paso para ver cómo se modifican los valores
   - Usa puntos de interrupción condicionales
   
2. **Detección de Errores con Valgrind**
   - Escribe un programa que gestione memoria dinámica
   - Introduce intencionalmente diferentes tipos de errores:
     * Fugas de memoria
     * Accesos a memoria liberada
     * Límites de arreglos excedidos
   - Usa Valgrind para identificar y corregir cada error

## 5. Recursos Adicionales

- [Documentación oficial de GDB (en inglés)](https://www.gnu.org/software/gdb/documentation/)
- [Guía de Valgrind (en inglés)](https://valgrind.org/docs/manual/quick-start.html)
- [Hoja de referencia rápida de GDB (en inglés)](https://darkdust.net/files/GDB%20Cheat%20Sheet.pdf)
- [Tutorial de GDB en español](https://www.cs.us.es/~jalonso/cursos/etsii-ugr/gdb.php)

---
*Nota: Para aprovechar al máximo esta guía, se recomienda practicar con ejemplos propios y experimentar con diferentes escenarios de depuración. La mejor manera de aprender es mediante la práctica constante.*
