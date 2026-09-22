"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, Input } from "@/shared/ui";
import {
  esquemaTercero,
  type DatosFormularioTercero,
} from "@/features/terceros/schemas";
import type { Tercero } from "@/features/terceros/types";

/** Props del componente `TerceroForm`. */
type Props = {
  /** Modo del formulario: creación o edición. */
  modo: "crear" | "editar";
  /** Datos actuales del socio; solo en modo edición. */
  valoresIniciales?: Tercero;
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioTercero) => void;
  /** Se invoca al cancelar el formulario. */
  onCancelar: () => void;
};

/**
 * Formulario reusable de socios de participación.
 *
 * El mismo componente sirve para crear y editar: en modo edición precarga
 * `valoresIniciales` como valores por defecto. Valida con zod antes de enviar, muestra
 * los errores de campo en español y traduce el error general (`mensajeError`) sin detalle
 * técnico. Las acciones viven dentro del `<form>` para que el submit siga funcionando.
 */
export function TerceroForm({
  modo,
  valoresIniciales,
  enviando,
  mensajeError,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioTercero>({
    resolver: zodResolver(esquemaTercero),
    defaultValues: {
      nombre: valoresIniciales?.nombre ?? "",
      documento: valoresIniciales?.documento ?? "",
      contacto: valoresIniciales?.contacto ?? "",
    },
  });

  const enviar = handleSubmit((datos) => onGuardar(datos));

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-label={
        modo === "editar"
          ? "Editar socio de participación"
          : "Crear socio de participación"
      }
      className="flex flex-col gap-4"
    >
      <Input
        label="Nombre"
        type="text"
        error={errors.nombre?.message}
        {...register("nombre")}
      />
      <Input
        label="Documento"
        type="text"
        error={errors.documento?.message}
        {...register("documento")}
      />
      <Input
        label="Contacto"
        type="text"
        error={errors.contacto?.message}
        {...register("contacto")}
      />

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
