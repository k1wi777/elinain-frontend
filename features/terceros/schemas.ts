import { z } from "zod";

/**
 * Esquema de validación del formulario de socios de participación.
 *
 * Es el único esquema del feature y lo usan tanto la creación como la edición. Los
 * mensajes van en español y `trim` normaliza los valores antes de enviarlos al backend.
 */

const MENSAJE_NOMBRE_REQUERIDO =
  "Ingresa el nombre del socio de participación.";
const MENSAJE_DOCUMENTO_REQUERIDO =
  "Ingresa el documento del socio de participación.";
const MENSAJE_CONTACTO_REQUERIDO =
  "Ingresa el contacto del socio de participación.";

/** Esquema del formulario de socios de participación. */
export const esquemaTercero = z.object({
  nombre: z.string().trim().min(1, MENSAJE_NOMBRE_REQUERIDO),
  documento: z.string().trim().min(1, MENSAJE_DOCUMENTO_REQUERIDO),
  contacto: z.string().trim().min(1, MENSAJE_CONTACTO_REQUERIDO),
});

/** Datos validados del formulario de socios de participación. */
export type DatosFormularioTercero = z.infer<typeof esquemaTercero>;
