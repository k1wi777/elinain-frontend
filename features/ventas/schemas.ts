import { z } from "zod";

import { fechaLocalAIso } from "@/shared/lib/fechas";

/**
 * Esquema de validación del formulario de ventas.
 *
 * Es el único esquema del feature. El contrato es requerido en ambos modos: en el listado
 * global lo elige el usuario y en la sección embebida viaja precargado como valor por
 * defecto. La fecha se valida con `fechaLocalAIso` para comprobar que es una fecha real en
 * la zona del negocio. Los mensajes van en español y el esquema es un espejo de la
 * validación del backend, no un reemplazo.
 */

const MENSAJE_CONTRATO_REQUERIDO = "Selecciona el contrato de la venta.";
const MENSAJE_FECHA_REQUERIDA = "Ingresa la fecha y hora de la venta.";
const MENSAJE_FECHA_INVALIDA = "Ingresa una fecha y hora válidas.";
const MENSAJE_CANTIDAD_REQUERIDA = "Ingresa la cantidad de animales vendidos.";
const MENSAJE_CANTIDAD_ENTERA = "La cantidad debe ser un número entero.";
const MENSAJE_CANTIDAD_POSITIVA = "La cantidad debe ser mayor que cero.";
const MENSAJE_PESO_REQUERIDO = "Ingresa el peso promedio de venta.";
const MENSAJE_PESO_POSITIVO = "El peso promedio debe ser mayor que cero.";
const MENSAJE_PRECIO_REQUERIDO = "Ingresa el precio por kilo.";
const MENSAJE_PRECIO_POSITIVO = "El precio por kilo debe ser mayor que cero.";

/** Esquema del formulario de ventas. */
export const esquemaVenta = z.object({
  contrato_id: z.string().trim().min(1, MENSAJE_CONTRATO_REQUERIDO),
  fecha: z
    .string()
    .trim()
    .min(1, MENSAJE_FECHA_REQUERIDA)
    .refine((valor) => fechaLocalAIso(valor) !== "", {
      message: MENSAJE_FECHA_INVALIDA,
    }),
  cantidad_vendida: z
    .number({ error: MENSAJE_CANTIDAD_REQUERIDA })
    .int(MENSAJE_CANTIDAD_ENTERA)
    .positive(MENSAJE_CANTIDAD_POSITIVA),
  peso_promedio_venta: z
    .number({ error: MENSAJE_PESO_REQUERIDO })
    .positive(MENSAJE_PESO_POSITIVO),
  precio_kilo_venta: z
    .number({ error: MENSAJE_PRECIO_REQUERIDO })
    .positive(MENSAJE_PRECIO_POSITIVO),
});

/** Datos validados del formulario de ventas. */
export type DatosFormularioVenta = z.infer<typeof esquemaVenta>;
