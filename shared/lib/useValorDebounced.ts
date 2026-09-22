"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve una copia de `valor` que solo se actualiza tras un intervalo sin cambios.
 *
 * Es un temporizador genérico y sin dominio, no una obtención de datos: evita que la UI
 * reaccione a cada pulsación del usuario. El valor retornado sigue el ritmo del último
 * cambio y se limpia el temporizador anterior cuando llega un valor nuevo.
 *
 * @param valor Valor que se quiere debounced.
 * @param retrasoMs Milisegundos de espera desde el último cambio.
 */
export function useValorDebounced<T>(valor: T, retrasoMs: number): T {
  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setValorDebounced(valor), retrasoMs);

    return () => clearTimeout(temporizador);
  }, [valor, retrasoMs]);

  return valorDebounced;
}
