import { z } from "zod";

import { fechaDiaAIso } from "@/shared/lib/fechas";

/**
 * Esquema de validación del formulario de costos.
 *
 * Es el único esquema del feature y lo usan tanto el registro como la edición: los cuatro
 * campos (tipo, monto, fecha y descripción) son requeridos en ambos modos. `contrato_id` no
 * forma parte del formulario porque el contrato de origen es inmutable y lo aporta el
 * contexto. Los mensajes van en español y es un espejo de la validación del backend, no un
 * reemplazo.
 */

const MENSAJE_TIPO_REQUERIDO = "Ingresa el tipo de costo.";
const MENSAJE_MONTO_REQUERIDO = "Ingresa el monto.";
const MENSAJE_MONTO_POSITIVO = "El monto debe ser mayor que cero.";
const MENSAJE_FECHA_REQUERIDA = "Ingresa la fecha del costo.";
const MENSAJE_FECHA_INVALIDA = "Ingresa una fecha válida.";
const MENSAJE_DESCRIPCION_REQUERIDA = "Ingresa una descripción del costo.";

/** Esquema del formulario de costos. */
export const esquemaCosto = z.object({
  tipo: z.string().trim().min(1, MENSAJE_TIPO_REQUERIDO),
  monto: z
    .number({ error: MENSAJE_MONTO_REQUERIDO })
    .positive(MENSAJE_MONTO_POSITIVO),
  fecha: z
    .string()
    .trim()
    .min(1, MENSAJE_FECHA_REQUERIDA)
    .refine((valor) => fechaDiaAIso(valor) !== "", {
      message: MENSAJE_FECHA_INVALIDA,
    }),
  descripcion: z.string().trim().min(1, MENSAJE_DESCRIPCION_REQUERIDA),
});

/** Datos validados del formulario de costos. */
export type DatosFormularioCosto = z.infer<typeof esquemaCosto>;
