"use client";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, Input } from "@/shared/ui";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { mensajeErrorAcceso } from "@/features/auth/mensajes-error";
import {
  esquemaLogin,
  type DatosFormularioLogin,
} from "@/features/auth/schemas";

/**
 * Formulario de acceso con correo y contraseña.
 *
 * Valida con zod antes de enviar, deshabilita el envío mientras la mutación está en curso
 * y traduce el error del backend a un mensaje en español sin detalle técnico.
 */
export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioLogin>({
    resolver: zodResolver(esquemaLogin),
  });

  const { mutate, isPending, error } = useLogin();

  const enviar = handleSubmit((datos) => mutate(datos));

  return (
    <form onSubmit={enviar} noValidate className="flex w-full flex-col gap-4">
      <Input
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {mensajeErrorAcceso(error.status)}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Ingresando…" : "Ingresar"}
      </Button>

      <p className="text-center text-sm text-zinc-600">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-medium text-emerald-700 underline underline-offset-2"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
}
