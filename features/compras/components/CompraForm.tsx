"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues } from "react-hook-form";

import { isoAFechaLocal } from "@/shared/lib/fechas";
import { Button, Input } from "@/shared/ui";
import {
  esquemaCompra,
  type DatosFormularioCompra,
} from "@/features/compras/schemas";
import type { Compra } from "@/features/compras/types";

/** Props del componente `CompraForm`. */
type Props = {
  /** Modo del formulario: registro o edición. */
  modo: "crear" | "editar";
  /** Compra actual; solo en modo edición. */
  compra?: Compra;
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioCompra) => void;
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
  compra?: Compra,
): DefaultValues<DatosFormularioCompra> {
  if (!compra) {
    return {
      fecha: "",
      cantidad: undefined,
      peso_promedio: undefined,
      precio_kilo: undefined,
      nota: "",
    };
  }

  return {
    fecha: isoAFechaLocal(compra.fecha),
    cantidad: compra.cantidad,
    peso_promedio: compra.peso_promedio,
    precio_kilo: compra.precio_kilo,
    nota: compra.nota,
  };
}

/**
 * Formulario reusable de compras.
 *
 * Solicita los cinco campos de una compra —fecha y hora, cantidad, peso promedio, precio
 * por kilo y nota— y valida con zod antes de enviar. En modo edición precarga la compra con
 * la fecha convertida a local y no renderiza ningún campo editable para el contrato, que es
 * inmutable.
 */
export function CompraForm({
  modo,
  compra,
  enviando,
  mensajeError,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioCompra>({
    resolver: zodResolver(esquemaCompra),
    defaultValues: valoresIniciales(compra),
  });

  const enviar = handleSubmit((datos) => onGuardar(datos));

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-label={modo === "editar" ? "Editar compra" : "Registrar compra"}
      className="flex flex-col gap-4"
    >
      <Input
        label="Fecha y hora"
        type="datetime-local"
        error={errors.fecha?.message}
        {...register("fecha")}
      />

      <Input
        label="Cantidad (cabezas)"
        type="number"
        step="1"
        min="1"
        error={errors.cantidad?.message}
        {...register("cantidad", { setValueAs: aNumero })}
      />

      <Input
        label="Peso promedio (kg)"
        type="number"
        step="any"
        min="0"
        error={errors.peso_promedio?.message}
        {...register("peso_promedio", { setValueAs: aNumero })}
      />

      <Input
        label="Precio por kilo"
        type="number"
        step="any"
        min="0"
        error={errors.precio_kilo?.message}
        {...register("precio_kilo", { setValueAs: aNumero })}
      />

      <Input
        label="Nota"
        type="text"
        error={errors.nota?.message}
        {...register("nota")}
      />

      {modo === "editar" ? (
        <p className="text-xs text-zinc-500">
          El contrato de la compra no se puede modificar.
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
              : "Registrar compra"}
        </Button>
      </div>
    </form>
  );
}
