import L from "leaflet";

/**
 * Construye el marcador de finca como `divIcon` con un SVG en línea.
 *
 * Evita depender de los PNG por defecto de Leaflet, que el bundler puede no resolver, y no
 * requiere dependencias adicionales. Se comparte entre el mapa del listado y el selector
 * de ubicación del formulario.
 */
export function crearIconoPin(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40" aria-hidden="true"><path d="M16 0C7.16 0 0 7.16 0 16c0 11.5 16 24 16 24s16-12.5 16-24C32 7.16 24.84 0 16 0z" fill="#059669"/><circle cx="16" cy="16" r="6" fill="#ffffff"/></svg>',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}
