/**
 * Desenvolvimiento del sobre de las respuestas exitosas del backend.
 *
 * El backend envuelve toda respuesta exitosa en `{ exito: true, datos: <payload> }`, aunque
 * el contrato OpenAPI documenta el payload plano. Este helper concentra en un único punto la
 * lectura del sobre para que el resto del cliente HTTP trabaje siempre con el payload directo.
 */

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

/**
 * Devuelve el payload interno de una respuesta envuelta en `{ exito, datos }`.
 *
 * Solo desenvuelve cuando `datos` es un objeto no nulo, no array, con `exito === true`
 * (booleano estricto) y una propiedad propia `datos`; en ese caso devuelve el valor de esa
 * propiedad. Cualquier otro caso —arrays, primitivos, `null`, `undefined`, cuerpos sin
 * sobre, `exito: false`, `exito` no booleano o respuestas propias del BFF— se devuelve tal
 * cual, de modo que el helper es seguro ante respuestas que no llevan sobre.
 *
 * @param datos Cuerpo de la respuesta, aún sin interpretar.
 */
export function desenvolverRespuesta(datos: unknown): unknown {
  const cuerpo = asRecord(datos);

  if (cuerpo === undefined || cuerpo.exito !== true) {
    return datos;
  }

  if (!Object.prototype.hasOwnProperty.call(cuerpo, "datos")) {
    return datos;
  }

  return cuerpo.datos;
}
