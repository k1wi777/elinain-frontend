import { z } from "zod";

import { fechaLocalAIso } from "@/shared/lib/fechas";

/**
 * Esquemas de validación de los formularios de contratos.
 *
 * Crear y editar tienen campos y reglas distintos, por lo que usan esquemas separados.
 * El de creación incluye la regla de que los porcentajes sumen exactamente 100; es un
 * espejo de la validación del backend, no un reemplazo. Los mensajes van en español.
 */

const MENSAJE_TERCERO_REQUERIDO = "Selecciona el socio de participación.";
const MENSAJE_FINCA_REQUERIDA = "Selecciona la finca del contrato.";
const MENSAJE_FECHA_APERTURA_REQUERIDA =
  "Ingresa la fecha y hora de apertura del contrato.";
const MENSAJE_FECHA_APERTURA_INVALIDA =
  "Ingresa una fecha y hora de apertura válidas.";
const MENSAJE_PORCENTAJE_REQUERIDO = "Ingresa el porcentaje.";
const MENSAJE_PORCENTAJE_RANGO = "El porcentaje debe estar entre 0 y 100.";
const MENSAJE_SUMA_PORCENTAJES =
  "Los porcentajes del comerciante y del tercero deben sumar exactamente 100.";
const MENSAJE_NUMERO_POSITIVO = "El valor debe ser mayor que cero.";
const MENSAJE_ESTADO_REQUERIDO = "Selecciona el estado del contrato.";
const MENSAJE_FECHA_CIERRE_REQUERIDA =
  "Ingresa la fecha de cierre del contrato.";

/** Número opcional que, cuando se informa, debe ser mayor que cero. */
const numeroOpcionalPositivo = z
  .number({ error: MENSAJE_NUMERO_POSITIVO })
  .positive(MENSAJE_NUMERO_POSITIVO)
  .optional();

/** Esquema del formulario de apertura de contrato. */
export const esquemaCrearContrato = z
  .object({
    tercero_id: z.string().trim().min(1, MENSAJE_TERCERO_REQUERIDO),
    finca_id: z.string().trim().min(1, MENSAJE_FINCA_REQUERIDA),
    fecha_apertura: z
      .string()
      .trim()
      .min(1, MENSAJE_FECHA_APERTURA_REQUERIDA)
      .refine((valor) => fechaLocalAIso(valor) !== "", {
        message: MENSAJE_FECHA_APERTURA_INVALIDA,
      }),
    porcentaje_comerciante: z
      .number({ error: MENSAJE_PORCENTAJE_REQUERIDO })
      .min(0, MENSAJE_PORCENTAJE_RANGO)
      .max(100, MENSAJE_PORCENTAJE_RANGO),
    porcentaje_tercero: z
      .number({ error: MENSAJE_PORCENTAJE_REQUERIDO })
      .min(0, MENSAJE_PORCENTAJE_RANGO)
      .max(100, MENSAJE_PORCENTAJE_RANGO),
    raza: z.string().trim().optional(),
    peso_promedio_actual: numeroOpcionalPositivo,
    cantidad_actual: numeroOpcionalPositivo,
    valor_kilo_referencia: numeroOpcionalPositivo,
  })
  .refine(
    (datos) => datos.porcentaje_comerciante + datos.porcentaje_tercero === 100,
    { message: MENSAJE_SUMA_PORCENTAJES, path: ["porcentaje_tercero"] },
  );

/** Esquema del formulario de edición de contrato; solo campos mutables. */
export const esquemaEditarContrato = z
  .object({
    estado: z.enum(["activo", "cerrado"], {
      error: MENSAJE_ESTADO_REQUERIDO,
    }),
    fecha_cierre: z.string().trim().optional(),
    raza: z.string().trim().optional(),
    peso_promedio_actual: numeroOpcionalPositivo,
    cantidad_actual: numeroOpcionalPositivo,
    valor_kilo_referencia: numeroOpcionalPositivo,
  })
  .refine(
    (datos) =>
      datos.estado !== "cerrado" || (datos.fecha_cierre ?? "").trim() !== "",
    { message: MENSAJE_FECHA_CIERRE_REQUERIDA, path: ["fecha_cierre"] },
  );

/** Datos validados del formulario de apertura. */
export type DatosFormularioCrearContrato = z.infer<typeof esquemaCrearContrato>;

/** Datos validados del formulario de edición. */
export type DatosFormularioEditarContrato = z.infer<
  typeof esquemaEditarContrato
>;

/**
 * Valores del formulario de contrato, combinando los campos de ambos modos.
 *
 * El formulario es único y alterna crear/editar según `modo`; en cada modo solo se
 * renderizan y validan los campos que le corresponden.
 */
export type DatosFormularioContrato = DatosFormularioCrearContrato &
  DatosFormularioEditarContrato;
