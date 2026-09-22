"use client";

import { type ChangeEvent } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  useWatch,
  type DefaultValues,
  type Resolver,
} from "react-hook-form";

import { Button, Input, Select } from "@/shared/ui";
import { isoAFechaLocal } from "@/features/contratos/fechas";
import { formatearParticipacion } from "@/features/contratos/participacion";
import {
  fincasDeTercero,
  indexarNombres,
  nombreDeFinca,
  nombreDeTercero,
} from "@/features/contratos/relaciones";
import {
  esquemaCrearContrato,
  esquemaEditarContrato,
  type DatosFormularioContrato,
} from "@/features/contratos/schemas";
import type {
  Contrato,
  EstadoContrato,
  FincaContrato,
  TerceroContrato,
} from "@/features/contratos/types";

/** Modo del formulario: apertura o edición. */
type Modo = "crear" | "editar";

/** Props del componente `ContratoForm`. */
type Props = {
  /** Modo del formulario. */
  modo: Modo;
  /** Terceros disponibles para el selector y para resolver nombres; los compone `app/`. */
  terceros: TerceroContrato[];
  /** Fincas disponibles para el selector y para resolver nombres; las compone `app/`. */
  fincas: FincaContrato[];
  /** Contrato actual; solo en modo edición. */
  contrato?: Contrato;
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioContrato) => void;
  /** Se invoca al cancelar el formulario. */
  onCancelar: () => void;
};

/** Opciones del selector de estado. */
const OPCIONES_ESTADO = [
  { valor: "activo", etiqueta: "Activo" },
  { valor: "cerrado", etiqueta: "Cerrado" },
];

/**
 * Selecciona el esquema de validación según el modo.
 *
 * El formulario es único y alterna crear/editar, pero cada modo tiene su propio esquema
 * (campos y reglas distintos). La aserción unifica el tipo del resolver porque el
 * formulario se tipa con los campos de ambos modos.
 */
function resolverDeContrato(modo: Modo): Resolver<DatosFormularioContrato> {
  const resolver =
    modo === "crear"
      ? zodResolver(esquemaCrearContrato)
      : zodResolver(esquemaEditarContrato);

  return resolver as unknown as Resolver<DatosFormularioContrato>;
}

/**
 * Convierte el valor de un control numérico a número.
 *
 * Un campo vacío se devuelve como `undefined` para que los esquemas distingan "sin
 * informar" de `0`; un texto no numérico se convierte en `NaN`, que zod rechaza.
 */
function aNumero(valor: unknown): number | undefined {
  if (typeof valor === "string" && valor.trim() === "") {
    return undefined;
  }

  return Number(valor);
}

/** Valores iniciales del formulario según el modo. */
function valoresIniciales(
  modo: Modo,
  contrato?: Contrato,
): DefaultValues<DatosFormularioContrato> {
  if (modo === "crear" || contrato === undefined) {
    return {
      tercero_id: "",
      finca_id: "",
      fecha_apertura: "",
      porcentaje_comerciante: undefined,
      porcentaje_tercero: undefined,
      estado: "activo",
      fecha_cierre: "",
      raza: "",
      peso_promedio_actual: undefined,
      cantidad_actual: undefined,
      valor_kilo_referencia: undefined,
    };
  }

  return {
    tercero_id: contrato.tercero_id,
    finca_id: contrato.finca_id,
    fecha_apertura: isoAFechaLocal(contrato.fecha_apertura),
    porcentaje_comerciante: contrato.porcentaje_comerciante,
    porcentaje_tercero: contrato.porcentaje_tercero,
    estado: contrato.estado,
    fecha_cierre: isoAFechaLocal(contrato.fecha_cierre ?? ""),
    raza: contrato.raza ?? "",
    peso_promedio_actual: contrato.peso_promedio_actual ?? undefined,
    cantidad_actual: contrato.cantidad_actual ?? undefined,
    valor_kilo_referencia: contrato.valor_kilo_referencia ?? undefined,
  };
}

/**
 * Formulario reusable de contratos.
 *
 * En modo creación permite elegir tercero, finca (filtrada por el tercero), fecha y hora
 * de apertura, porcentajes con autocompletado del complemento a 100 y campos opcionales.
 * En modo edición muestra los inmutables en solo lectura y permite cambiar únicamente el
 * estado, la fecha de cierre, la raza y los valores numéricos; al pasar a `cerrado` exige
 * y autocompleta la fecha de cierre, y al volver a `activo` la limpia.
 */
export function ContratoForm({
  modo,
  terceros,
  fincas,
  contrato,
  enviando,
  mensajeError,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<DatosFormularioContrato>({
    resolver: resolverDeContrato(modo),
    defaultValues: valoresIniciales(modo, contrato),
  });

  const terceroElegido = useWatch({ control, name: "tercero_id" }) ?? "";
  const estadoElegido = useWatch({ control, name: "estado" });

  const opcionesTercero = [
    { valor: "", etiqueta: "Selecciona un socio de participación" },
    ...terceros.map((tercero) => ({
      valor: tercero.id,
      etiqueta: tercero.nombre,
    })),
  ];

  const fincasDisponibles = fincasDeTercero(fincas, terceroElegido);
  const opcionesFinca = [
    {
      valor: "",
      etiqueta:
        terceroElegido === ""
          ? "Selecciona primero un socio de participación"
          : "Selecciona una finca",
    },
    ...fincasDisponibles.map((finca) => ({
      valor: finca.id,
      etiqueta: finca.nombre,
    })),
  ];

  if (
    modo === "editar" &&
    contrato &&
    !fincasDisponibles.some((finca) => finca.id === contrato.finca_id)
  ) {
    opcionesFinca.push({
      valor: contrato.finca_id,
      etiqueta: nombreDeFinca(indexarNombres(fincas), contrato.finca_id),
    });
  }

  const cambiarTercero = () => {
    setValue("finca_id", "", { shouldValidate: false });
  };

  const autocompletarPorcentaje =
    (complemento: "porcentaje_comerciante" | "porcentaje_tercero") =>
    (evento: ChangeEvent<HTMLInputElement>) => {
      const valor = evento.target.value;

      if (valor.trim() === "") {
        return;
      }

      const numero = Number(valor);

      if (!Number.isFinite(numero)) {
        return;
      }

      setValue(complemento, 100 - numero, { shouldValidate: false });
    };

  const cambiarEstado = (evento: ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = evento.target.value as EstadoContrato;

    if (nuevoEstado === "cerrado" && (getValues("fecha_cierre") ?? "") === "") {
      setValue("fecha_cierre", isoAFechaLocal(new Date().toISOString()), {
        shouldValidate: false,
      });
    }

    if (nuevoEstado === "activo") {
      setValue("fecha_cierre", "", { shouldValidate: false });
    }
  };

  const enviar = handleSubmit((datos) => onGuardar(datos));

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-label={modo === "editar" ? "Editar contrato" : "Abrir contrato"}
      className="flex flex-col gap-4"
    >
      {modo === "crear" ? (
        <>
          <Select
            label="Socio de participación"
            opciones={opcionesTercero}
            error={errors.tercero_id?.message}
            {...register("tercero_id", { onChange: cambiarTercero })}
          />

          <Select
            label="Finca"
            opciones={opcionesFinca}
            error={errors.finca_id?.message}
            {...register("finca_id")}
          />

          <Input
            label="Fecha y hora de apertura"
            type="datetime-local"
            error={errors.fecha_apertura?.message}
            {...register("fecha_apertura")}
          />

          <Input
            label="Porcentaje del comerciante"
            type="number"
            step="0.01"
            min="0"
            max="100"
            error={errors.porcentaje_comerciante?.message}
            {...register("porcentaje_comerciante", {
              setValueAs: aNumero,
              onChange: autocompletarPorcentaje("porcentaje_tercero"),
            })}
          />

          <Input
            label="Porcentaje del tercero"
            type="number"
            step="0.01"
            min="0"
            max="100"
            error={errors.porcentaje_tercero?.message}
            {...register("porcentaje_tercero", {
              setValueAs: aNumero,
              onChange: autocompletarPorcentaje("porcentaje_comerciante"),
            })}
          />
        </>
      ) : (
        <>
          <Input
            label="Socio de participación"
            type="text"
            defaultValue={
              contrato
                ? nombreDeTercero(indexarNombres(terceros), contrato.tercero_id)
                : ""
            }
            disabled
          />

          <Input
            label="Finca"
            type="text"
            defaultValue={
              contrato
                ? nombreDeFinca(indexarNombres(fincas), contrato.finca_id)
                : ""
            }
            disabled
          />

          <Input
            label="Fecha y hora de apertura"
            type="datetime-local"
            defaultValue={
              contrato ? isoAFechaLocal(contrato.fecha_apertura) : ""
            }
            disabled
          />

          <Input
            label="Porcentaje del comerciante"
            type="number"
            defaultValue={contrato?.porcentaje_comerciante ?? 0}
            disabled
          />

          <Input
            label="Porcentaje del tercero"
            type="number"
            defaultValue={contrato?.porcentaje_tercero ?? 0}
            disabled
          />

          <Select
            label="Estado"
            opciones={OPCIONES_ESTADO}
            error={errors.estado?.message}
            {...register("estado", { onChange: cambiarEstado })}
          />

          <Input
            label="Fecha y hora de cierre"
            type="datetime-local"
            error={errors.fecha_cierre?.message}
            disabled={estadoElegido !== "cerrado"}
            {...register("fecha_cierre")}
          />
        </>
      )}

      <Input
        label="Raza"
        type="text"
        error={errors.raza?.message}
        {...register("raza")}
      />

      <Input
        label="Peso promedio actual (kg)"
        type="number"
        step="any"
        min="0"
        error={errors.peso_promedio_actual?.message}
        {...register("peso_promedio_actual", { setValueAs: aNumero })}
      />

      <Input
        label="Cantidad actual (cabezas)"
        type="number"
        step="any"
        min="0"
        error={errors.cantidad_actual?.message}
        {...register("cantidad_actual", { setValueAs: aNumero })}
      />

      <Input
        label="Valor por kilo de referencia"
        type="number"
        step="any"
        min="0"
        error={errors.valor_kilo_referencia?.message}
        {...register("valor_kilo_referencia", { setValueAs: aNumero })}
      />

      {modo === "editar" && contrato ? (
        <p className="text-xs text-zinc-500">
          Participación: {formatearParticipacion(contrato)}. Los porcentajes, el
          socio, la finca y la fecha de apertura no se pueden modificar.
        </p>
      ) : null}

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
          {enviando
            ? "Guardando…"
            : modo === "editar"
              ? "Guardar cambios"
              : "Abrir contrato"}
        </Button>
      </div>
    </form>
  );
}
