"use client";

import { Button } from "@/shared/ui";
import { useLogout } from "@/features/auth/hooks/useLogout";

/**
 * Botón de cierre de sesión.
 *
 * Dispara la mutación de logout y se deshabilita mientras la petición está en curso para
 * evitar envíos duplicados.
 */
export function LogoutButton() {
  const { mutate, isPending } = useLogout();

  return (
    <Button variante="secundario" onClick={() => mutate()} disabled={isPending}>
      {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
    </Button>
  );
}
