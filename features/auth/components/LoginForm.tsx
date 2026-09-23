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
} from "@/features/auth/components/AuthIcons";
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
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

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
    <form
      onSubmit={enviar}
      noValidate
      className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-elinain-surface/70 p-5 shadow-[0_24px_60px_rgb(0_0_0_/_0.45)] backdrop-blur-sm sm:p-6"
    >
      <AuthField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        icono={<IconoCorreo />}
        error={errors.email?.message}
        {...register("email")}
      />
      <AuthField
        label="Contraseña"
        type={mostrarContrasena ? "text" : "password"}
        autoComplete="current-password"
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

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-400/15 bg-red-400/5 px-3 py-2 text-sm leading-relaxed text-red-300"
        >
          {mensajeErrorAcceso(error.status)}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className={ESTILOS_CTA_ACCESO}>
        {isPending ? "Ingresando…" : "Ingresar a la plataforma"}
        {!isPending ? (
          <span aria-hidden className="text-base">
            →
          </span>
        ) : null}
      </button>

      <p className="text-center text-sm text-elinain-muted">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className={`${ESTILOS_ENLACE_FOCUS} font-medium text-elinain-gold hover:text-elinain-gold-hover`}
        >
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
