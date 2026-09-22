"use client";

import { useState, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/** Props del proveedor de infraestructura. */
type Props = { children: ReactNode };

/**
 * Proveedor de TanStack Query para la aplicación.
 *
 * Crea un único `QueryClient` de forma perezosa (`useState`) para que no se recree entre
 * renders, y lo expone a los componentes cliente que ejecutan las mutaciones de
 * autenticación.
 */
export function Providers({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
