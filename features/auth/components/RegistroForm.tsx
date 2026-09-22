"use client";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, Input } from "@/shared/ui";
import { useRegistro } from "@/features/auth/hooks/useRegistro";
import { mensajeErrorRegistro } from "@/features/auth/mensajes-error";
import {
  esquemaRegistro,
  type DatosFormularioRegistro,
} from "@/features/auth/schemas";

/**
 * Formulario de registro con nombre, correo y contraseña.
 *
 * El conflicto de correo duplicado (409) se muestra asociado al campo de correo; el resto
 * de errores se muestran como mensaje general. Al completarse, el BFF deja la sesión
 * iniciada y el hook redirige al dashboard.
 */
export function RegistroForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioRegistro>({
    resolver: zodResolver(esquemaRegistro),
  });

  const { mutate, isPending, error } = useRegistro();

  const errorCorreo =
    errors.email?.message ??
    (error?.status === 409 ? mensajeErrorRegistro(409) : undefined);

  const errorGeneral =
    error !== null && error.status !== 409
      ? mensajeErrorRegistro(error.status)
      : null;

  const enviar = handleSubmit((datos) => mutate(datos));

  return (
    <form onSubmit={enviar} noValidate className="flex w-full flex-col gap-4">
      <Input
        label="Nombre"
        type="text"
        autoComplete="name"
        error={errors.nombre?.message}
        {...register("nombre")}
      />
      <Input
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        error={errorCorreo}
        {...register("email")}
      />
      <Input
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {errorGeneral ? (
        <p role="alert" className="text-sm text-red-600">
          {errorGeneral}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-zinc-600">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-700 underline underline-offset-2"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
