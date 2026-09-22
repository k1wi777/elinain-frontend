import { z } from "zod";

/**
 * Esquema de validación del formulario de fincas.
 *
 * Es el único esquema del feature y lo usan tanto la creación como la edición. Los
 * mensajes van en español y `trim` normaliza los textos antes de enviarlos al backend. Las
 * coordenadas son obligatorias: el formulario debe recibir la posición del pin, que es la
 * fuente de verdad frente a la dirección usada para centrar el mapa.
 */

const MENSAJE_PROPIETARIO_REQUERIDO = "Selecciona el propietario de la finca.";
const MENSAJE_NOMBRE_REQUERIDO = "Ingresa el nombre de la finca.";
const MENSAJE_DIRECCION_REQUERIDA = "Ingresa la dirección de la finca.";
const MENSAJE_UBICACION = "Ubica la finca en el mapa.";
const MENSAJE_LATITUD = "La latitud debe estar entre -90 y 90.";
const MENSAJE_LONGITUD = "La longitud debe estar entre -180 y 180.";

/** Esquema del formulario de fincas. */
export const esquemaFinca = z.object({
  tercero_id: z.string().trim().min(1, MENSAJE_PROPIETARIO_REQUERIDO),
  nombre: z.string().trim().min(1, MENSAJE_NOMBRE_REQUERIDO),
  direccion: z.string().trim().min(1, MENSAJE_DIRECCION_REQUERIDA),
  latitud: z
    .number({ error: MENSAJE_UBICACION })
    .min(-90, MENSAJE_LATITUD)
    .max(90, MENSAJE_LATITUD),
  longitud: z
    .number({ error: MENSAJE_UBICACION })
    .min(-180, MENSAJE_LONGITUD)
    .max(180, MENSAJE_LONGITUD),
});

/** Datos validados del formulario de fincas. */
export type DatosFormularioFinca = z.infer<typeof esquemaFinca>;
