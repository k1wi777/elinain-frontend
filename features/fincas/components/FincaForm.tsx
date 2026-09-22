"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button, Input, Select } from "@/shared/ui";
import { useGeocodificacion } from "@/features/fincas/hooks/useGeocodificacion";
import { mensajeErrorGeocodificacion } from "@/features/fincas/mensajes-error";
import { TEXTO_PROPIETARIO_DESCONOCIDO } from "@/features/fincas/propietarios";
import {
  esquemaFinca,
  type DatosFormularioFinca,
} from "@/features/fincas/schemas";
import type {
  Finca,
  PosicionFinca,
  Propietario,
} from "@/features/fincas/types";

/**
 * Carga diferida del selector de mapa.
 *
 * `ssr: false` garantiza que Leaflet solo se ejecute en el navegador.
 */
const SelectorMapa = dynamic(
  () =>
    import("@/features/fincas/components/SelectorMapa").then(
      (modulo) => modulo.SelectorMapa,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="rounded-md border border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500">
        Cargando mapa…
      </p>
    ),
  },
);

/** Props del componente `FincaForm`. */
type Props = {
  /** Modo del formulario: creación o edición. */
  modo: "crear" | "editar";
  /** Propietarios disponibles para el selector; los compone `app/`. */
  propietarios: Propietario[];
  /** Datos actuales de la finca; solo en modo edición. */
  finca?: Finca;
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioFinca) => void;
  /** Se invoca al cancelar el formulario. */
  onCancelar: () => void;
};

/** Posición del pin a partir de los valores del formulario. */
function aPosicion(
  latitud: number | undefined,
  longitud: number | undefined,
): PosicionFinca | null {
  if (latitud === undefined || longitud === undefined) {
    return null;
  }

  return { latitud, longitud };
}

/**
 * Formulario reusable de fincas.
 *
 * El mismo componente sirve para crear y editar: en modo edición precarga los datos y
 * deshabilita el propietario, que no se puede modificar. La dirección solo centra el mapa
 * mediante geocodificación; las coordenadas que se envían son siempre las del pin, que el
 * usuario puede ajustar arrastrándolo o haciendo clic en el mapa.
 */
export function FincaForm({
  modo,
  propietarios,
  finca,
  enviando,
  mensajeError,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    getValues,
    control,
    formState: { errors },
  } = useForm<DatosFormularioFinca>({
    resolver: zodResolver(esquemaFinca),
    defaultValues: {
      tercero_id: finca?.tercero_id ?? "",
      nombre: finca?.nombre ?? "",
      direccion: finca?.direccion ?? "",
      ...(finca ? { latitud: finca.latitud, longitud: finca.longitud } : {}),
    },
  });

  const geocodificacion = useGeocodificacion();
  const [centro, setCentro] = useState<PosicionFinca | null>(null);

  const latitud = useWatch({ control, name: "latitud" });
  const longitud = useWatch({ control, name: "longitud" });
  const posicion = aPosicion(latitud, longitud);

  const opcionesPropietario = [
    { valor: "", etiqueta: "Selecciona un propietario" },
    ...propietarios.map((propietario) => ({
      valor: propietario.id,
      etiqueta: propietario.nombre,
    })),
  ];

  const propietarioEnLista = propietarios.some(
    (propietario) => propietario.id === finca?.tercero_id,
  );

  if (modo === "editar" && finca && !propietarioEnLista) {
    opcionesPropietario.push({
      valor: finca.tercero_id,
      etiqueta: TEXTO_PROPIETARIO_DESCONOCIDO,
    });
  }

  const ubicarDireccion = async () => {
    const direccion = getValues("direccion").trim();

    if (direccion === "") {
      setError("direccion", { message: "Ingresa la dirección de la finca." });
      return;
    }

    geocodificacion.reset();

    try {
      const resultado = await geocodificacion.mutateAsync(direccion);

      // La dirección solo centra el mapa: el pin se coloca o ajusta con clic o arrastre,
      // de modo que las coordenadas guardadas provienen siempre de su posición.
      setCentro({
        latitud: resultado.latitud,
        longitud: resultado.longitud,
      });
    } catch {
      // El error de la geocodificación se muestra bajo el botón.
    }
  };

  const cambiarPosicion = (nuevaLatitud: number, nuevaLongitud: number) => {
    setValue("latitud", nuevaLatitud, { shouldValidate: true });
    setValue("longitud", nuevaLongitud, { shouldValidate: true });
  };

  const enviar = handleSubmit((datos) => onGuardar(datos));
  const ubicando = geocodificacion.isPending;

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-label={modo === "editar" ? "Editar finca" : "Crear finca"}
      className="flex flex-col gap-4"
    >
      <Select
        label="Propietario"
        opciones={opcionesPropietario}
        disabled={modo === "editar"}
        error={errors.tercero_id?.message}
        {...register("tercero_id")}
      />

      <Input
        label="Nombre"
        type="text"
        error={errors.nombre?.message}
        {...register("nombre")}
      />

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="Dirección"
            type="text"
            error={errors.direccion?.message}
            {...register("direccion")}
          />
        </div>
        <Button
          variante="secundario"
          onClick={ubicarDireccion}
          disabled={enviando || ubicando}
        >
          {ubicando ? "Ubicando…" : "Ubicar dirección"}
        </Button>
      </div>

      <p className="text-xs text-zinc-500">
        La dirección solo centra el mapa. Arrastra el pin o haz clic en el mapa
        para fijar la ubicación exacta de la finca.
      </p>

      {geocodificacion.error ? (
        <p role="alert" className="text-sm text-red-600">
          {mensajeErrorGeocodificacion(geocodificacion.error.status)}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <SelectorMapa
          posicion={posicion}
          centro={centro}
          onCambiarPosicion={cambiarPosicion}
        />
        {errors.latitud || errors.longitud ? (
          <p role="alert" className="text-sm text-red-600">
            {errors.latitud?.message ?? errors.longitud?.message}
          </p>
        ) : null}
      </div>

      {mensajeError ? (
        <p role="alert" className="text-sm text-red-600">
          {mensajeError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
