import { z } from "zod";

import { fechaDiaAIso } from "@/shared/lib/fechas";

/**
 * Esquema de validación del formulario de ciclos.
 *
 * Es el único esquema del feature y lo usan tanto el registro como la edición: la fecha es
 * requerida y representa un día; el peso observado y las notas son opcionales. Los mensajes
 * van en español y es un espejo de la validación del backend, no un reemplazo.
 */

const MENSAJE_FECHA_REQUERIDA = "Ingresa la fecha del ciclo.";
const MENSAJE_FECHA_INVALIDA = "Ingresa una fecha válida.";
const MENSAJE_PESO_INVALIDO = "El peso observado debe ser un número.";
const MENSAJE_PESO_POSITIVO = "El peso observado debe ser mayor que cero.";

/** Esquema del formulario de ciclos. */
export const esquemaCiclo = z.object({
  fecha: z
    .string()
    .trim()
    .min(1, MENSAJE_FECHA_REQUERIDA)
    .refine((valor) => fechaDiaAIso(valor) !== "", {
      message: MENSAJE_FECHA_INVALIDA,
    }),
  peso_observado: z
    .number({ error: MENSAJE_PESO_INVALIDO })
    .positive(MENSAJE_PESO_POSITIVO)
    .optional(),
  notas: z.string().trim().optional(),
});

/** Datos validados del formulario de ciclos. */
export type DatosFormularioCiclo = z.infer<typeof esquemaCiclo>;
