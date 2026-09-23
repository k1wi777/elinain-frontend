"use client";

import { useState } from "react";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  ESTILOS_CTA_ACCESO,
  ESTILOS_ENLACE_FOCUS,
} from "@/features/auth/auth-styles";
import { AuthField } from "@/features/auth/components/AuthField";
import {
  BotonVisibilidad,
  IconoCandado,
  IconoCorreo,
  IconoUsuario,
} from "@/features/auth/components/AuthIcons";
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
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

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
    <form
      onSubmit={enviar}
      noValidate
      className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-elinain-surface/70 p-5 shadow-[0_24px_60px_rgb(0_0_0_/_0.45)] backdrop-blur-sm sm:p-6"
    >
      <AuthField
        label="Nombre"
        type="text"
        autoComplete="name"
        placeholder="Tu nombre"
        icono={<IconoUsuario />}
        error={errors.nombre?.message}
        {...register("nombre")}
      />
      <AuthField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        icono={<IconoCorreo />}
        error={errorCorreo}
        {...register("email")}
      />
      <AuthField
        label="Contraseña"
        type={mostrarContrasena ? "text" : "password"}
        autoComplete="new-password"
        placeholder="••••••••"
        icono={<IconoCandado />}
        error={errors.password?.message}
        accionDerecha={
          <BotonVisibilidad
            visible={mostrarContrasena}
            onAlternar={() => setMostrarContrasena((v) => !v)}
          />
        }
        {...register("password")}
      />

      {errorGeneral ? (
        <p
          role="alert"
          className="rounded-lg border border-red-400/15 bg-red-400/5 px-3 py-2 text-sm leading-relaxed text-red-300"
        >
          {errorGeneral}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className={ESTILOS_CTA_ACCESO}>
        {isPending ? "Creando cuenta…" : "Crear cuenta"}
        {!isPending ? (
          <span aria-hidden className="text-base">
            →
          </span>
        ) : null}
      </button>

      <p className="text-center text-sm text-elinain-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className={`${ESTILOS_ENLACE_FOCUS} font-medium text-elinain-gold hover:text-elinain-gold-hover`}
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
