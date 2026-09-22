"use client";

import { useId, useState, type ChangeEvent, type KeyboardEvent } from "react";

import { cn } from "@/shared/lib/cn";
import { useValorDebounced } from "@/shared/lib/useValorDebounced";
import { Input } from "@/shared/ui";
import { useSugerenciasDireccion } from "@/features/fincas/hooks/useSugerenciasDireccion";
import { mensajeErrorGeocodificacion } from "@/features/fincas/mensajes-error";
import type { ResultadoGeocodificacion } from "@/features/fincas/types";

/** Espera sin tecleo antes de pedir sugerencias. */
const RETRASO_SUGERENCIAS_MS = 350;

/** Mínimo de caracteres para mostrar y consultar sugerencias. */
const MINIMO_CARACTERES = 3;

/** Props del componente `AutocompletarDireccion`. */
type Props = {
  /** Etiqueta del campo, delegada al `Input` compartido. */
  label: string;
  /** Mensaje de error del formulario, si existe. */
  error?: string;
  /** Valor actual del campo (controlado por el formulario). */
  valor: string;
  /** Notifica cada cambio de texto antes de seleccionar una sugerencia. */
  onCambiarTexto: (texto: string) => void;
  /** Notifica la sugerencia elegida por el usuario. */
  onSeleccionar: (sugerencia: ResultadoGeocodificacion) => void;
};

/**
 * Campo de dirección con autocompletado accesible.
 *
 * Implementa el patrón combobox: el foco permanece en el `input`, que anuncia con ARIA si
 * la lista está abierta y qué opción está activa, y la lista se recorre con las flechas,
 * se elige con `Enter` y se cierra con `Escape`. Las sugerencias se piden con un valor
 * debounced y solo a partir del mínimo de caracteres. Vive en `features/fincas` porque
 * depende de la API de geocodificación del feature.
 */
export function AutocompletarDireccion({
  label,
  error,
  valor,
  onCambiarTexto,
  onSeleccionar,
}: Props) {
  const idBase = useId();
  const idLista = `${idBase}-lista`;
  const valorDebounced = useValorDebounced(valor, RETRASO_SUGERENCIAS_MS);

  const {
    data: sugerencias = [],
    error: errorConsulta,
    isFetching,
  } = useSugerenciasDireccion(valorDebounced);

  const [abierto, setAbierto] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const [textoSeleccionado, setTextoSeleccionado] = useState<string | null>(
    null,
  );

  const textoActual = valor.trim();
  const tieneMinimo = textoActual.length >= MINIMO_CARACTERES;
  const pendienteDebounce = textoActual !== valorDebounced.trim();
  const panelVisible = abierto && tieneMinimo && valor !== textoSeleccionado;

  const mostrarCargando = isFetching || (pendienteDebounce && !errorConsulta);
  const hayOpciones =
    !mostrarCargando && !errorConsulta && sugerencias.length > 0;
  const mostrarVacio = panelVisible && !mostrarCargando && !errorConsulta;

  const indiceValido =
    indiceActivo >= 0 && indiceActivo < sugerencias.length ? indiceActivo : -1;
  const idOpcionActiva =
    hayOpciones && indiceValido >= 0
      ? `${idBase}-opcion-${indiceValido}`
      : undefined;

  const cambiarTexto = (evento: ChangeEvent<HTMLInputElement>) => {
    setTextoSeleccionado(null);
    setIndiceActivo(-1);
    setAbierto(true);
    onCambiarTexto(evento.target.value);
  };

  const seleccionar = (indice: number) => {
    const sugerencia = sugerencias[indice];

    if (sugerencia === undefined) {
      return;
    }

    setAbierto(false);
    setIndiceActivo(-1);
    setTextoSeleccionado(sugerencia.etiqueta);
    onSeleccionar(sugerencia);
  };

  const manejarTeclado = (evento: KeyboardEvent<HTMLInputElement>) => {
    const total = sugerencias.length;

    if (evento.key === "Escape") {
      setAbierto(false);
      setIndiceActivo(-1);
      return;
    }

    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setAbierto(true);

      if (total === 0) {
        return;
      }

      setIndiceActivo((actual) => {
        const base = actual >= total ? -1 : actual;

        return (base + 1) % total;
      });

      return;
    }

    if (evento.key === "ArrowUp") {
      if (total === 0) {
        return;
      }

      evento.preventDefault();
      setAbierto(true);
      setIndiceActivo((actual) => {
        const base = actual < 0 || actual >= total ? 0 : actual;

        return (base - 1 + total) % total;
      });

      return;
    }

    if (evento.key === "Enter" && indiceValido >= 0) {
      evento.preventDefault();
      seleccionar(indiceValido);
    }
  };

  return (
    <div className="relative">
      <Input
        label={label}
        type="text"
        error={error}
        value={valor}
        role="combobox"
        aria-expanded={hayOpciones}
        aria-controls={hayOpciones ? idLista : undefined}
        aria-autocomplete="list"
        aria-activedescendant={idOpcionActiva}
        autoComplete="off"
        onChange={cambiarTexto}
        onKeyDown={manejarTeclado}
        onBlur={() => setAbierto(false)}
      />

      {panelVisible ? (
        <div className="absolute z-[1100] mt-1 w-full overflow-hidden rounded-md border border-zinc-300 bg-white shadow-lg">
          {mostrarCargando ? (
            <p role="status" className="px-3 py-2 text-sm text-zinc-500">
              Buscando sugerencias…
            </p>
          ) : null}

          {errorConsulta ? (
            <p role="alert" className="px-3 py-2 text-sm text-red-600">
              {mensajeErrorGeocodificacion(errorConsulta.status)}
            </p>
          ) : null}

          {mostrarVacio && sugerencias.length === 0 ? (
            <p role="status" className="px-3 py-2 text-sm text-zinc-500">
              No encontramos coincidencias. Ubica el pin manualmente en el mapa.
            </p>
          ) : null}

          {hayOpciones ? (
            <ul
              id={idLista}
              role="listbox"
              className="max-h-64 overflow-auto py-1"
            >
              {sugerencias.map((sugerencia, indice) => (
                <li
                  key={`${sugerencia.latitud},${sugerencia.longitud}-${indice}`}
                  id={`${idBase}-opcion-${indice}`}
                  role="option"
                  aria-selected={indice === indiceValido}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm text-zinc-700",
                    indice === indiceValido && "bg-emerald-50 text-emerald-900",
                  )}
                  onMouseDown={(evento) => evento.preventDefault()}
                  onClick={() => seleccionar(indice)}
                >
                  {sugerencia.etiqueta}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
