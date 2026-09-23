"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues } from "react-hook-form";

import { Button, Input, Select } from "@/shared/ui";
import {
  esquemaVenta,
  type DatosFormularioVenta,
} from "@/features/ventas/schemas";
import type { ContratoVenta } from "@/features/ventas/types";

/** Props del componente `VentaForm`. */
type Props = {
  /** Contrato fijo del registro embebido; si se informa no se muestra el selector. */
  contratoFijo?: string;
  /** Contratos para el selector del registro global. */
  contratos?: ContratoVenta[];
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioVenta) => void;
  /** Se invoca al cancelar el formulario. */
  onCancelar: () => void;
};

/**
 * Convierte el valor de un control numérico a número.
 *
 * Un campo vacío se devuelve como `undefined` para que el esquema distinga "sin informar"
 * de `0`; un texto no numérico se convierte en `NaN`, que zod rechaza.
 */
function aNumero(valor: unknown): number | undefined {
  if (typeof valor === "string" && valor.trim() === "") {
    return undefined;
  }

  return Number(valor);
}

/** Valores iniciales del formulario según el modo. */
function valoresIniciales(
  contratoFijo?: string,
): DefaultValues<DatosFormularioVenta> {
  return {
    contrato_id: contratoFijo ?? "",
    fecha: "",
    cantidad_vendida: undefined,
    peso_promedio_venta: undefined,
    precio_kilo_venta: undefined,
  };
}

/**
 * Formulario de registro de una venta.
 *
 * Solicita contrato, fecha y hora, cantidad vendida, peso promedio de venta y precio por
 * kilo, y valida con zod antes de enviar. En el registro embebido el contrato viaja fijo y
 * no se renderiza el selector; en el global el usuario lo elige entre los contratos
 * informados.
 */
export function VentaForm({
  contratoFijo,
  contratos = [],
  enviando,
  mensajeError,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioVenta>({
    resolver: zodResolver(esquemaVenta),
    defaultValues: valoresIniciales(contratoFijo),
  });

  const enviar = handleSubmit((datos) => onGuardar(datos));
  const contratoEsFijo = contratoFijo !== undefined;

  const opcionesContrato = [
    { valor: "", etiqueta: "Selecciona un contrato" },
    ...contratos.map((contrato) => ({
      valor: contrato.id,
      etiqueta: contrato.etiqueta,
    })),
  ];

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-label="Registrar venta"
      className="flex flex-col gap-4"
    >
      {contratoEsFijo ? null : (
        <Select
          label="Contrato"
          opciones={opcionesContrato}
          error={errors.contrato_id?.message}
          {...register("contrato_id")}
        />
      )}

      <Input
        label="Fecha y hora"
        type="datetime-local"
        error={errors.fecha?.message}
        {...register("fecha")}
      />

      <Input
        label="Cantidad vendida (cabezas)"
        type="number"
        step="1"
        min="1"
        error={errors.cantidad_vendida?.message}
        {...register("cantidad_vendida", { setValueAs: aNumero })}
      />

      <Input
        label="Peso promedio de venta (kg)"
        type="number"
        step="any"
        min="0"
        error={errors.peso_promedio_venta?.message}
        {...register("peso_promedio_venta", { setValueAs: aNumero })}
      />

      <Input
        label="Precio por kilo"
        type="number"
        step="any"
        min="0"
        error={errors.precio_kilo_venta?.message}
        {...register("precio_kilo_venta", { setValueAs: aNumero })}
      />

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
          {enviando ? "Guardando…" : "Registrar venta"}
        </Button>
      </div>
    </form>
  );
}
