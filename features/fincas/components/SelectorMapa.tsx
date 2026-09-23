"use client";

import { useEffect, useMemo } from "react";

import type { LatLngExpression } from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { crearIconoPin } from "@/features/fincas/components/icono-pin";
import {
  CENTRO_COLOMBIA,
  LIMITES_COLOMBIA,
  ZOOM_MINIMO,
  ZOOM_POR_DEFECTO,
} from "@/features/fincas/mapa";
import type { PosicionFinca } from "@/features/fincas/types";

import "leaflet/dist/leaflet.css";

/** Zoom aplicado al centrar el mapa en una ubicación encontrada. */
const ZOOM_UBICACION = 13;

/** Props del componente `SelectorMapa`. */
type Props = {
  /** Posición actual del pin, o `null` si aún no se ha ubicado la finca. */
  posicion: PosicionFinca | null;
  /** Ubicación a la que debe desplazarse la vista cuando cambia. */
  centro: PosicionFinca | null;
  /** Notifica la nueva posición del pin al arrastrarlo o al hacer clic en el mapa. */
  onCambiarPosicion: (latitud: number, longitud: number) => void;
};

/** Coloca el pin donde el usuario hace clic dentro del mapa. */
function ManejadorClic({
  onCambiarPosicion,
}: Pick<Props, "onCambiarPosicion">) {
  useMapEvents({
    click(evento) {
      onCambiarPosicion(evento.latlng.lat, evento.latlng.lng);
    },
  });

  return null;
}

/** Desplaza la vista del mapa cuando el formulario centra una ubicación encontrada. */
function SincronizarCentro({ centro }: { centro: PosicionFinca | null }) {
  const mapa = useMap();

  useEffect(() => {
    if (centro === null) {
      return;
    }

    mapa.setView([centro.latitud, centro.longitud], ZOOM_UBICACION);
  }, [mapa, centro]);

  return null;
}

/**
 * Mapa interactivo de selección de ubicación.
 *
 * La posición del pin es la fuente de verdad: el usuario puede arrastrarlo o hacer clic en
 * el mapa. El centro solo se mueve cuando el formulario lo indica (por ejemplo, tras
 * geocodificar una dirección), nunca al arrastrar el pin.
 *
 * Importa Leaflet y su CSS, por lo que debe cargarse en el cliente con `dynamic(..., {
 * ssr: false })`.
 */
export function SelectorMapa({ posicion, centro, onCambiarPosicion }: Props) {
  const icono = useMemo(() => crearIconoPin(), []);
  const centroInicial: LatLngExpression = posicion
    ? [posicion.latitud, posicion.longitud]
    : CENTRO_COLOMBIA;

  return (
    <div
      role="application"
      aria-label="Mapa para ubicar la finca"
      className="overflow-hidden rounded-md border border-white/8 bg-white/[0.03]"
    >
      <MapContainer
        center={centroInicial}
        zoom={posicion ? ZOOM_UBICACION : ZOOM_POR_DEFECTO}
        minZoom={ZOOM_MINIMO}
        maxBounds={LIMITES_COLOMBIA}
        maxBoundsViscosity={1}
        className="h-80 w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ManejadorClic onCambiarPosicion={onCambiarPosicion} />
        <SincronizarCentro centro={centro} />
        {posicion ? (
          <Marker
            position={[posicion.latitud, posicion.longitud]}
            icon={icono}
            draggable
            eventHandlers={{
              dragend: (evento) => {
                const { lat, lng } = evento.target.getLatLng();
                onCambiarPosicion(lat, lng);
              },
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
