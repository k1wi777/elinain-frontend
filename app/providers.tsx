"use client";

import { useState, type ReactNode } from "react";

import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";

/** Props del proveedor de infraestructura. */
type Props = { children: ReactNode };

/**
 * Opciones por defecto del `QueryClient`.
 *
 * Solo configura `queries`: al navegar entre vistas se reutiliza la caché durante 60 s en
 * lugar de repetir cada petición, no se refetchea al recuperar el foco de la ventana y, ante
 * un fallo, se reintenta una sola vez en vez de las tres por defecto. `mutations` conserva
 * sus defaults, ya que las mutaciones invalidan explícitamente sus query keys.
 */
const OPCIONES_POR_DEFECTO: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};

/**
 * Proveedor de TanStack Query para la aplicación.
 *
 * Crea un único `QueryClient` de forma perezosa (`useState`) para que no se recree entre
 * renders, y lo expone a los componentes cliente que ejecutan las consultas y las
 * mutaciones de autenticación.
 */
export function Providers({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient(OPCIONES_POR_DEFECTO));

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
