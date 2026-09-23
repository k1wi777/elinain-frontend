import { z } from "zod";

import { fechaLocalAIso } from "@/shared/lib/fechas";

/**
 * Esquema de validación del formulario de compras.
 *
 * Es el único esquema del feature y lo usan tanto el registro como la edición: los cinco
 * campos (fecha, cantidad, peso promedio, precio por kilo y nota) son requeridos en ambos
 * modos. `contrato_id` no forma parte del formulario porque el contrato de origen es
 * inmutable y lo aporta el contexto. Los mensajes van en español y es un espejo de la
 * validación del backend, no un reemplazo.
 */

const MENSAJE_FECHA_REQUERIDA = "Ingresa la fecha y hora de la compra.";
const MENSAJE_FECHA_INVALIDA = "Ingresa una fecha y hora válidas.";
const MENSAJE_CANTIDAD_REQUERIDA = "Ingresa la cantidad de animales.";
const MENSAJE_CANTIDAD_ENTERA = "La cantidad debe ser un número entero.";
const MENSAJE_CANTIDAD_POSITIVA = "La cantidad debe ser mayor que cero.";
const MENSAJE_PESO_REQUERIDO = "Ingresa el peso promedio.";
const MENSAJE_PESO_POSITIVO = "El peso promedio debe ser mayor que cero.";
const MENSAJE_PRECIO_REQUERIDO = "Ingresa el precio por kilo.";
const MENSAJE_PRECIO_POSITIVO = "El precio por kilo debe ser mayor que cero.";
const MENSAJE_NOTA_REQUERIDA = "Ingresa una nota para la compra.";

/** Esquema del formulario de compras. */
export const esquemaCompra = z.object({
  fecha: z
    .string()
    .trim()
    .min(1, MENSAJE_FECHA_REQUERIDA)
    .refine((valor) => fechaLocalAIso(valor) !== "", {
      message: MENSAJE_FECHA_INVALIDA,
    }),
  cantidad: z
    .number({ error: MENSAJE_CANTIDAD_REQUERIDA })
    .int(MENSAJE_CANTIDAD_ENTERA)
    .positive(MENSAJE_CANTIDAD_POSITIVA),
  peso_promedio: z
    .number({ error: MENSAJE_PESO_REQUERIDO })
    .positive(MENSAJE_PESO_POSITIVO),
  precio_kilo: z
    .number({ error: MENSAJE_PRECIO_REQUERIDO })
    .positive(MENSAJE_PRECIO_POSITIVO),
  nota: z.string().trim().min(1, MENSAJE_NOTA_REQUERIDA),
});

/** Datos validados del formulario de compras. */
export type DatosFormularioCompra = z.infer<typeof esquemaCompra>;
