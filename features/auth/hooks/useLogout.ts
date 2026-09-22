"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { cerrarSesion } from "@/features/auth/api/auth";

/**
 * Mutación de cierre de sesión.
 *
 * Al completarse redirige a `/login` y refresca para que el middleware reevalúe la
 * ausencia de cookie.
 */
export function useLogout() {
  const router = useRouter();

  return useMutation<void, ApiError, void>({
    mutationFn: cerrarSesion,
    onSuccess: () => {
      router.replace("/login");
      router.refresh();
    },
  });
}
