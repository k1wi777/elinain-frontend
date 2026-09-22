"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { registrarUsuario } from "@/features/auth/api/auth";
import type { DatosRegistro } from "@/features/auth/types";

/**
 * Mutación de registro.
 *
 * El auto-login ocurre en el BFF, así que al completarse el usuario ya está autenticado:
 * solo hay que redirigir al dashboard. El error se expone tipado como `ApiError` para que
 * el formulario lo traduzca.
 */
export function useRegistro() {
  const router = useRouter();

  return useMutation<void, ApiError, DatosRegistro>({
    mutationFn: registrarUsuario,
    onSuccess: () => {
      router.replace("/dashboard");
      router.refresh();
    },
  });
}
