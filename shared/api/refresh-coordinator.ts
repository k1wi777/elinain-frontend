/**
 * Coordinador single-flight de renovaciones de sesión.
 *
 * Módulo puro y seguro para Edge (sin `next/headers` ni `node:*`). Garantiza que varias
 * peticiones concurrentes del mismo proceso que necesiten renovar con el mismo token de
 * refresco ejecuten una única renovación compartida, y que las peticiones rezagadas
 * reutilicen el resultado durante un margen corto.
 *
 * El estado vive a nivel de módulo (indexado por token de refresco) para que el
 * coordinador compartido por un runtime sirva a todas sus peticiones.
 */

/** Margen por defecto durante el que se reutiliza una renovación exitosa. */
export const RETENCION_REFRESCO_MS = 15_000;

type EntradaCoordinador = {
  promesa: Promise<unknown>;
  /**
   * Instante (ms epoch) hasta el que se reutiliza el éxito. Es `undefined` mientras la
   * renovación sigue en vuelo.
   */
  expiraEn: number | undefined;
};

/**
 * Renovaciones activas o recién completadas, indexadas por token de refresco.
 *
 * Se tipan como `Promise<unknown>` porque el estado es compartido entre coordinadores de
 * distinto tipo de resultado; cada coordinador recupera su `T` con la conversión segura
 * en la lectura.
 */
const renovaciones = new Map<string, EntradaCoordinador>();

/**
 * Crea un coordinador de renovaciones sobre la función `renovar` recibida.
 *
 * @param renovar Ejecuta la renovación real para un token de refresco.
 * @param opciones `retencionMs` ajusta el margen de reutilización del éxito.
 * @returns Función que coordina la renovación de un token de refresco.
 */
export function crearCoordinadorRefresco<T>(
  renovar: (tokenRefresco: string) => Promise<T>,
  opciones?: { retencionMs?: number },
): (tokenRefresco: string) => Promise<T> {
  const retencionMs = opciones?.retencionMs ?? RETENCION_REFRESCO_MS;

  return (tokenRefresco: string): Promise<T> => {
    const ahora = Date.now();
    const existente = renovaciones.get(tokenRefresco);

    if (existente !== undefined) {
      const expiraEn = existente.expiraEn;
      const vigente = expiraEn === undefined || expiraEn > ahora;

      if (vigente) {
        return existente.promesa.then((resultado) => resultado as T);
      }

      renovaciones.delete(tokenRefresco);
    }

    const promesa = renovar(tokenRefresco);
    const entrada: EntradaCoordinador = { promesa, expiraEn: undefined };

    renovaciones.set(tokenRefresco, entrada);

    promesa.then(
      () => {
        const actual = renovaciones.get(tokenRefresco);

        if (actual === entrada) {
          entrada.expiraEn = Date.now() + retencionMs;
        }
      },
      () => {
        const actual = renovaciones.get(tokenRefresco);

        if (actual === entrada) {
          renovaciones.delete(tokenRefresco);
        }
      },
    );

    return promesa;
  };
}
