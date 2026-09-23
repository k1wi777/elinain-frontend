"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button, Input, Select } from "@/shared/ui";
import { AutocompletarDireccion } from "@/features/fincas/components/AutocompletarDireccion";
import { useGeocodificacion } from "@/features/fincas/hooks/useGeocodificacion";
import { useGeocodificacionInversa } from "@/features/fincas/hooks/useGeocodificacionInversa";
import {
  mensajeErrorGeocodificacion,
  mensajeErrorGeocodificacionInversa,
} from "@/features/fincas/mensajes-error";
import { TEXTO_PROPIETARIO_DESCONOCIDO } from "@/features/fincas/propietarios";
import {
  esquemaFinca,
  type DatosFormularioFinca,
} from "@/features/fincas/schemas";
import type {
  Finca,
  PosicionFinca,
  Propietario,
  ResultadoGeocodificacion,
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
      <p className="rounded-md border border-white/8 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
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
 * deshabilita el propietario, que no se puede modificar. La dirección puede elegirse por
 * sugerencias, buscarse con el botón (que solo centra el mapa) o completarse desde el pin
 * con geocodificación inversa. Las coordenadas que se envían son siempre las del pin.
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
  const geocodificacionInversa = useGeocodificacionInversa();
  const [centro, setCentro] = useState<PosicionFinca | null>(null);
  const [errorInverso, setErrorInverso] = useState<string | null>(null);
  const solicitudInversa = useRef(0);

  const direccion = useWatch({ control, name: "direccion" });
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
    const consulta = getValues("direccion").trim();

    if (consulta === "") {
      setError("direccion", { message: "Ingresa la dirección de la finca." });
      return;
    }

    geocodificacion.reset();

    try {
      const resultado = await geocodificacion.mutateAsync(consulta);

      // La búsqueda por botón solo centra el mapa: el pin se coloca o ajusta con clic o
      // arrastre, de modo que las coordenadas guardadas provienen siempre de su posición.
      setCentro({
        latitud: resultado.latitud,
        longitud: resultado.longitud,
      });
    } catch {
      // El error de la geocodificación se muestra bajo el botón.
    }
  };

  const seleccionarSugerencia = (sugerencia: ResultadoGeocodificacion) => {
    setValue("direccion", sugerencia.etiqueta, { shouldValidate: true });
    setValue("latitud", sugerencia.latitud, { shouldValidate: true });
    setValue("longitud", sugerencia.longitud, { shouldValidate: true });
    setCentro({ latitud: sugerencia.latitud, longitud: sugerencia.longitud });
    setErrorInverso(null);
  };

  const cambiarPosicion = (nuevaLatitud: number, nuevaLongitud: number) => {
    setValue("latitud", nuevaLatitud, { shouldValidate: true });
    setValue("longitud", nuevaLongitud, { shouldValidate: true });

    // Un contador de solicitud descarta las respuestas que llegan tarde: solo la
    // interacción más reciente puede escribir la dirección.
    const solicitud = solicitudInversa.current + 1;
    solicitudInversa.current = solicitud;

    geocodificacionInversa.mutate(
      { latitud: nuevaLatitud, longitud: nuevaLongitud },
      {
        onSuccess: (resultado) => {
          if (solicitud !== solicitudInversa.current) {
            return;
          }

          setValue("direccion", resultado.etiqueta, { shouldValidate: true });
          setErrorInverso(null);
        },
        onError: (error) => {
          if (solicitud !== solicitudInversa.current) {
            return;
          }

          // Se conserva la dirección previa: el fallo no bloquea el guardado.
          setErrorInverso(mensajeErrorGeocodificacionInversa(error.status));
        },
      },
    );
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
        <div className="relative flex-1">
          <AutocompletarDireccion
            label="Dirección"
            error={errors.direccion?.message}
            valor={direccion}
            onCambiarTexto={(texto) => {
              setErrorInverso(null);
              setValue("direccion", texto, { shouldValidate: true });
            }}
            onSeleccionar={seleccionarSugerencia}
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

      <p className="text-xs text-zinc-400">
        Escribe para ver sugerencias o haz clic en el mapa para completar la
        dirección. Las coordenadas que se guardan son siempre las del pin.
      </p>

      {geocodificacion.error ? (
        <p role="alert" className="text-sm text-red-400">
          {mensajeErrorGeocodificacion(geocodificacion.error.status)}
        </p>
      ) : null}

      {errorInverso ? (
        <p role="alert" className="text-sm text-red-400">
          {errorInverso}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <SelectorMapa
          posicion={posicion}
          centro={centro}
          onCambiarPosicion={cambiarPosicion}
        />
        {errors.latitud || errors.longitud ? (
          <p role="alert" className="text-sm text-red-400">
            {errors.latitud?.message ?? errors.longitud?.message}
          </p>
        ) : null}
      </div>

      {mensajeError ? (
        <p role="alert" className="text-sm text-red-400">
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
