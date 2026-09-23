"use client";

import { useEffect, useMemo, useState } from "react";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { Button } from "@/shared/ui";
import { FincaDetalleModal } from "@/features/fincas/components/FincaDetalleModal";
import { crearIconoPin } from "@/features/fincas/components/icono-pin";
import { useTodasLasFincas } from "@/features/fincas/hooks/useTodasLasFincas";
import {
  CENTRO_COLOMBIA,
  LIMITES_COLOMBIA,
  ZOOM_MINIMO,
  ZOOM_POR_DEFECTO,
} from "@/features/fincas/mapa";
import { mensajeErrorListarFincas } from "@/features/fincas/mensajes-error";
import {
  indexarPropietarios,
  nombreDePropietario,
} from "@/features/fincas/propietarios";
import type { Finca, Propietario } from "@/features/fincas/types";

import "leaflet/dist/leaflet.css";

/** Zoom máximo al ajustar la vista al conjunto de fincas. */
const ZOOM_MAXIMO_AJUSTE = 15;

/** Ajusta la vista del mapa para encuadrar todas las fincas. */
function AjustarVista({ fincas }: { fincas: Finca[] }) {
  const mapa = useMap();

  useEffect(() => {
    if (fincas.length === 0) {
      return;
    }

    const limites = L.latLngBounds(
      fincas.map(
        (finca) => [finca.latitud, finca.longitud] as [number, number],
      ),
    );

    mapa.fitBounds(limites, {
      padding: [32, 32],
      maxZoom: ZOOM_MAXIMO_AJUSTE,
    });
  }, [mapa, fincas]);

  return null;
}

/** Props del componente `FincasMapa`. */
type Props = {
  /** Propietarios para resolver el nombre; los compone `app/`. */
  propietarios: Propietario[];
};

/**
 * Mapa de fincas con un pin por cada finca del comerciante.
 *
 * Cada pin abre un popup con nombre, propietario, dirección y la acción "Ver detalle", que
 * abre un modal sin cambiar de ruta. Usa Leaflet y OpenStreetMap con su atribución, por lo
 * que debe cargarse en el cliente con `dynamic(..., { ssr: false })`.
 */
export function FincasMapa({ propietarios }: Props) {
  const consulta = useTodasLasFincas();
  const [fincaDetalle, setFincaDetalle] = useState<Finca | null>(null);

  const icono = useMemo(() => crearIconoPin(), []);
  const propietariosPorId = indexarPropietarios(propietarios);
  const fincas = consulta.data ?? [];

  if (consulta.isPending) {
    return <p className="text-sm text-zinc-400">Cargando mapa…</p>;
  }

  if (consulta.error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
      >
        {mensajeErrorListarFincas(consulta.error.status)}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {fincas.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Aún no tienes fincas registradas.
        </p>
      ) : null}

      <div
        role="application"
        aria-label="Mapa de fincas"
        className="overflow-hidden rounded-2xl border border-white/6 bg-elinain-surface p-1 shadow-[0_22px_48px_rgb(0_0_0_/_0.2)]"
      >
        <MapContainer
          center={CENTRO_COLOMBIA}
          zoom={ZOOM_POR_DEFECTO}
          minZoom={ZOOM_MINIMO}
          maxBounds={LIMITES_COLOMBIA}
          maxBoundsViscosity={1}
          className="mapa-fincas h-[32rem] w-full rounded-xl"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <AjustarVista fincas={fincas} />
          {fincas.map((finca) => (
            <Marker
              key={finca.id}
              position={[finca.latitud, finca.longitud]}
              icon={icono}
            >
              <Popup>
                <div className="flex flex-col gap-1.5">
                  <strong className="text-sm font-semibold text-white">
                    {finca.nombre}
                  </strong>
                  <span className="text-xs text-zinc-400">
                    {nombreDePropietario(propietariosPorId, finca.tercero_id)}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {finca.direccion}
                  </span>
                  <Button
                    variante="secundario"
                    className="mt-1 border-white/8 bg-white/[0.03] text-xs text-zinc-200 hover:bg-white/[0.08] hover:text-white focus-visible:ring-elinain-gold"
                    onClick={() => setFincaDetalle(finca)}
                  >
                    Ver detalle
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <FincaDetalleModal
        finca={fincaDetalle}
        propietarios={propietarios}
        onCerrar={() => setFincaDetalle(null)}
      />
    </div>
  );
}
