"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { iniciarSesion } from "@/features/auth/api/auth";
import type { CredencialesAcceso } from "@/features/auth/types";

/**
 * Mutación de acceso.
 *
 * Al completarse redirige al dashboard y refresca para que los Server Components y el
 * middleware observen la cookie recién creada. El error se expone tipado como `ApiError`
 * para que el formulario lo traduzca.
 */
export function useLogin() {
  const router = useRouter();

  return useMutation<void, ApiError, CredencialesAcceso>({
    mutationFn: iniciarSesion,
    onSuccess: () => {
      router.replace("/dashboard");
      router.refresh();
    },
  });
}
