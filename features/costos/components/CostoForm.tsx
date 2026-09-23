"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues } from "react-hook-form";

import { isoAFechaDia } from "@/shared/lib/fechas";
import { Button, Input } from "@/shared/ui";
import {
  esquemaCosto,
  type DatosFormularioCosto,
} from "@/features/costos/schemas";
import type { Costo } from "@/features/costos/types";

/** Sugerencias de tipo de costo; el campo sigue admitiendo texto libre. */
const SUGERENCIAS_TIPO = [
  "flete",
  "alimentación",
  "medicina",
  "veterinaria",
] as const;

/** Props del componente `CostoForm`. */
type Props = {
  /** Modo del formulario: registro o edición. */
  modo: "crear" | "editar";
  /** Costo actual; solo en modo edición. */
  costo?: Costo;
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioCosto) => void;
  /** Se invoca al cancelar el formulario. */
  onCancelar: () => void;
};

/**
 * Convierte el valor de un control numérico a número.
 *
 * Un campo vacío se devuelve como `undefined` para que el esquema reporte el monto como
 * requerido; un texto no numérico se convierte en `NaN`, que zod rechaza.
 */
function aNumero(valor: unknown): number | undefined {
  if (typeof valor === "string" && valor.trim() === "") {
    return undefined;
  }

  return Number(valor);
}

/** Valores iniciales del formulario según el modo. */
function valoresIniciales(costo?: Costo): DefaultValues<DatosFormularioCosto> {
  if (!costo) {
    return {
      tipo: "",
      monto: undefined,
      fecha: "",
      descripcion: "",
    };
  }

  return {
    tipo: costo.tipo,
    monto: costo.monto,
    fecha: isoAFechaDia(costo.fecha),
    descripcion: costo.descripcion,
  };
}

/**
 * Formulario reusable de costos.
 *
 * Solicita el tipo —texto libre con sugerencias que no restringen el valor—, el monto, la
 * fecha de un solo día y la descripción, y valida con zod antes de enviar. En modo edición
 * precarga el costo con la fecha convertida a día. Recuerda de forma visible que el costo
 * es informativo y no afecta el cálculo de la utilidad real.
 */
export function CostoForm({
  modo,
  costo,
  enviando,
  mensajeError,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioCosto>({
    resolver: zodResolver(esquemaCosto),
    defaultValues: valoresIniciales(costo),
  });

  const enviar = handleSubmit((datos) => onGuardar(datos));

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-label={modo === "editar" ? "Editar costo" : "Registrar costo"}
      className="flex flex-col gap-4"
    >
      <Input
        label="Tipo"
        type="text"
        list="tipos-costo"
        placeholder="flete, alimentación, medicina…"
        error={errors.tipo?.message}
        {...register("tipo")}
      />

      <datalist id="tipos-costo">
        {SUGERENCIAS_TIPO.map((sugerencia) => (
          <option key={sugerencia} value={sugerencia} />
        ))}
      </datalist>

      <Input
        label="Monto"
        type="number"
        step="any"
        min="0"
        error={errors.monto?.message}
        {...register("monto", { setValueAs: aNumero })}
      />

      <Input
        label="Fecha"
        type="date"
        error={errors.fecha?.message}
        {...register("fecha")}
      />

      <Input
        label="Descripción"
        type="text"
        error={errors.descripcion?.message}
        {...register("descripcion")}
      />

      <p className="rounded-md border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
        Recuerda: los costos son informativos y no afectan el cálculo de la
        utilidad real.
      </p>

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
              : "Registrar costo"}
        </Button>
      </div>
    </form>
  );
}
