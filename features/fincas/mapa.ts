import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

/**
 * Constantes geográficas compartidas por los mapas de fincas.
 *
 * Acotan la vista a Colombia: el centro y el zoom por defecto, la caja envolvente que
 * usan los mapas como `maxBounds` y el zoom mínimo para no alejarse del territorio.
 */

/** Centro aproximado de Colombia. */
export const CENTRO_COLOMBIA: LatLngExpression = [4.5709, -74.2973];

/** Caja envolvente de Colombia como `[[sur, oeste], [norte, este]]`. */
export const LIMITES_COLOMBIA: LatLngBoundsExpression = [
  [-4.2, -79.0],
  [12.6, -66.8],
];

/** Zoom inicial de ambos mapas. */
export const ZOOM_POR_DEFECTO = 6;

/** Zoom mínimo permitido para no alejarse del área de Colombia. */
export const ZOOM_MINIMO = 5;
