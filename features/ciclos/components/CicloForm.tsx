"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues } from "react-hook-form";

import { isoAFechaDia } from "@/shared/lib/fechas";
import { Button, Input } from "@/shared/ui";
import {
  esquemaCiclo,
  type DatosFormularioCiclo,
} from "@/features/ciclos/schemas";
import type { Ciclo } from "@/features/ciclos/types";

/** Props del componente `CicloForm`. */
type Props = {
  /** Modo del formulario: registro o edición. */
  modo: "crear" | "editar";
  /** Ciclo actual; solo en modo edición. */
  ciclo?: Ciclo;
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioCiclo) => void;
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
function valoresIniciales(ciclo?: Ciclo): DefaultValues<DatosFormularioCiclo> {
  if (!ciclo) {
    return {
      fecha: "",
      peso_observado: undefined,
      notas: "",
    };
  }

  return {
    fecha: isoAFechaDia(ciclo.fecha),
    peso_observado: ciclo.peso_observado,
    notas: ciclo.notas ?? "",
  };
}

/**
 * Formulario reusable de ciclos.
 *
 * Solicita la fecha del checkpoint —un día, sin hora—, el peso observado opcional y las
 * notas opcionales, y valida con zod antes de enviar. En modo edición precarga el ciclo con
 * la fecha convertida a día.
 */
export function CicloForm({
  modo,
  ciclo,
  enviando,
  mensajeError,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioCiclo>({
    resolver: zodResolver(esquemaCiclo),
    defaultValues: valoresIniciales(ciclo),
  });

  const enviar = handleSubmit((datos) => onGuardar(datos));

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-label={modo === "editar" ? "Editar ciclo" : "Registrar ciclo"}
      className="flex flex-col gap-4"
    >
      <Input
        label="Fecha"
        type="date"
        error={errors.fecha?.message}
        {...register("fecha")}
      />

      <Input
        label="Peso observado (kg)"
        type="number"
        step="any"
        min="0"
        error={errors.peso_observado?.message}
        {...register("peso_observado", { setValueAs: aNumero })}
      />

      <Input
        label="Notas"
        type="text"
        error={errors.notas?.message}
        {...register("notas")}
      />

      {modo === "editar" ? (
        <p className="text-xs text-zinc-400">
          El contrato del ciclo no se puede modificar.
        </p>
      ) : null}

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
          {enviando
            ? "Guardando…"
            : modo === "editar"
              ? "Guardar cambios"
              : "Registrar ciclo"}
        </Button>
      </div>
    </form>
  );
}
