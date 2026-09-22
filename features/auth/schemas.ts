import { z } from "zod";

/**
 * Esquemas de validación de los formularios de autenticación.
 *
 * Son la única fuente de las reglas de validación de los formularios y sus mensajes van
 * en español (R13, R19, R20, R31, R35).
 */

const MENSAJE_EMAIL_REQUERIDO = "Ingresa tu correo electrónico.";
const MENSAJE_EMAIL_INVALIDO = "Ingresa un correo electrónico válido.";
const MENSAJE_PASSWORD_REQUERIDA = "Ingresa tu contraseña.";
const MENSAJE_NOMBRE_REQUERIDO = "Ingresa tu nombre.";
const MENSAJE_PASSWORD_CORTA =
  "La contraseña debe tener al menos 8 caracteres.";

/** Esquema del formulario de acceso. */
export const esquemaLogin = z.object({
  email: z
    .string()
    .min(1, MENSAJE_EMAIL_REQUERIDO)
    .email(MENSAJE_EMAIL_INVALIDO),
  password: z.string().min(1, MENSAJE_PASSWORD_REQUERIDA),
});

/** Esquema del formulario de registro. */
export const esquemaRegistro = z.object({
  nombre: z.string().trim().min(1, MENSAJE_NOMBRE_REQUERIDO),
  email: z
    .string()
    .min(1, MENSAJE_EMAIL_REQUERIDO)
    .email(MENSAJE_EMAIL_INVALIDO),
  password: z
    .string()
    .min(1, MENSAJE_PASSWORD_REQUERIDA)
    .min(8, MENSAJE_PASSWORD_CORTA),
});

/** Datos validados del formulario de acceso. */
export type DatosFormularioLogin = z.infer<typeof esquemaLogin>;

/** Datos validados del formulario de registro. */
export type DatosFormularioRegistro = z.infer<typeof esquemaRegistro>;
