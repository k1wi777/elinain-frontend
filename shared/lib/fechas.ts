/**
 * Conversión y presentación de fechas en la zona del negocio (Colombia, UTC−5 sin
 * horario de verano).
 *
 * El backend entrega y espera ISO 8601 en UTC; el navegador captura la fecha como local.
 * Al fijar la zona del negocio, la captura y la lectura son coherentes y el resultado no
 * depende de la zona horaria del sistema donde se ejecute la aplicación.
 */

/** Desfase fijo de Colombia respecto a UTC, en formato ISO. */
const OFFSET_COLOMBIA = "-05:00";

/** Desfase fijo de Colombia respecto a UTC, en minutos. */
const OFFSET_COLOMBIA_MINUTOS = -5 * 60;

const MILISEGUNDOS_POR_MINUTO = 60 * 1000;

/** Formato que produce un control `date` (`YYYY-MM-DD`). */
const PATRON_FECHA_DIA = /^\d{4}-\d{2}-\d{2}$/;

/** Formato que produce un control `datetime-local` (`YYYY-MM-DDTHH:mm`). */
const PATRON_FECHA_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Rellena con ceros a la izquierda hasta dos dígitos. */
function conDosDigitos(valor: number): string {
  return String(valor).padStart(2, "0");
}

/** Desplaza un instante para poder leer sus componentes con los getters UTC. */
function aHoraColombia(fecha: Date): Date {
  return new Date(
    fecha.getTime() + OFFSET_COLOMBIA_MINUTOS * MILISEGUNDOS_POR_MINUTO,
  );
}

/**
 * Convierte el valor de un control `datetime-local` a ISO 8601 en UTC.
 *
 * Interpreta la entrada en la zona de Colombia (UTC−5) y devuelve la cadena ISO 8601
 * equivalente. Devuelve `""` cuando el valor no tiene el formato esperado o no es una
 * fecha real (por ejemplo `2026-02-30T10:00`).
 *
 * @param valor Fecha y hora local (`YYYY-MM-DDTHH:mm`).
 */
export function fechaLocalAIso(valor: string): string {
  const recortado = valor.trim();

  if (!PATRON_FECHA_LOCAL.test(recortado)) {
    return "";
  }

  const fecha = new Date(`${recortado}${OFFSET_COLOMBIA}`);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  const iso = fecha.toISOString();

  // El motor normaliza fechas como 2026-02-30; la vuelta detecta esa corrección.
  if (isoAFechaLocal(iso) !== recortado) {
    return "";
  }

  return iso;
}

/**
 * Convierte una cadena ISO 8601 a un valor de control `datetime-local`.
 *
 * Devuelve la fecha y hora en la zona de Colombia (`YYYY-MM-DDTHH:mm`) o `""` si la
 * cadena no representa una fecha válida. Se usa para precargar los controles al editar.
 *
 * @param iso Fecha y hora en ISO 8601.
 */
export function isoAFechaLocal(iso: string): string {
  const fecha = new Date(iso);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  const local = aHoraColombia(fecha);

  return `${local.getUTCFullYear()}-${conDosDigitos(
    local.getUTCMonth() + 1,
  )}-${conDosDigitos(local.getUTCDate())}T${conDosDigitos(
    local.getUTCHours(),
  )}:${conDosDigitos(local.getUTCMinutes())}`;
}

/**
 * Formatea una fecha ISO 8601 para mostrarla en español (`DD/MM/AAAA HH:mm`).
 *
 * La fecha se presenta en la zona de Colombia. Devuelve `""` cuando la cadena no es una
 * fecha válida, para que la interfaz decida cómo indicar un valor no informado.
 *
 * @param iso Fecha y hora en ISO 8601.
 */
export function formatearFechaHora(iso: string): string {
  const fecha = new Date(iso);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  const local = aHoraColombia(fecha);

  return `${conDosDigitos(local.getUTCDate())}/${conDosDigitos(
    local.getUTCMonth() + 1,
  )}/${local.getUTCFullYear()} ${conDosDigitos(
    local.getUTCHours(),
  )}:${conDosDigitos(local.getUTCMinutes())}`;
}

/**
 * Convierte el valor de un control `date` a ISO 8601 en UTC.
 *
 * Interpreta el día en la zona de Colombia (UTC−5) y devuelve el inicio de ese día en ISO
 * 8601, que es el instante que espera el backend. Devuelve `""` cuando el valor no tiene el
 * formato `YYYY-MM-DD` o no es una fecha real (por ejemplo `2026-02-30`).
 *
 * @param valor Día local (`YYYY-MM-DD`).
 */
export function fechaDiaAIso(valor: string): string {
  const recortado = valor.trim();

  if (!PATRON_FECHA_DIA.test(recortado)) {
    return "";
  }

  const fecha = new Date(`${recortado}T00:00:00${OFFSET_COLOMBIA}`);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  const iso = fecha.toISOString();

  // El motor normaliza fechas como 2026-02-30; la vuelta detecta esa corrección.
  if (isoAFechaDia(iso) !== recortado) {
    return "";
  }

  return iso;
}

/**
 * Convierte una cadena ISO 8601 a un valor de control `date`.
 *
 * Devuelve el día en la zona de Colombia (`YYYY-MM-DD`) o `""` si la cadena no representa
 * una fecha válida. Se usa para precargar los controles al editar.
 *
 * @param iso Fecha en ISO 8601.
 */
export function isoAFechaDia(iso: string): string {
  const fecha = new Date(iso);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  const local = aHoraColombia(fecha);

  return `${local.getUTCFullYear()}-${conDosDigitos(
    local.getUTCMonth() + 1,
  )}-${conDosDigitos(local.getUTCDate())}`;
}

/**
 * Formatea una fecha ISO 8601 para mostrarla en español (`DD/MM/AAAA`), sin hora.
 *
 * La fecha se presenta en la zona de Colombia. Devuelve `""` cuando la cadena no es una
 * fecha válida, para que la interfaz decida cómo indicar un valor no informado.
 *
 * @param iso Fecha en ISO 8601.
 */
export function formatearFechaDia(iso: string): string {
  const fecha = new Date(iso);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  const local = aHoraColombia(fecha);

  return `${conDosDigitos(local.getUTCDate())}/${conDosDigitos(
    local.getUTCMonth() + 1,
  )}/${local.getUTCFullYear()}`;
}
