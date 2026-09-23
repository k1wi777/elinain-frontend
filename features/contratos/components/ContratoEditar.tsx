"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { fechaLocalAIso } from "@/shared/lib/fechas";
import { Toast } from "@/shared/ui";
import { ContratoForm } from "@/features/contratos/components/ContratoForm";
import { useActualizarContrato } from "@/features/contratos/hooks/useActualizarContrato";
import { useContrato } from "@/features/contratos/hooks/useContrato";
import {
  mensajeErrorDetalleContrato,
  mensajeErrorGuardarContrato,
} from "@/features/contratos/mensajes-error";
import type { DatosFormularioContrato } from "@/features/contratos/schemas";
import type {
  ActualizarContrato,
  FincaContrato,
  TerceroContrato,
} from "@/features/contratos/types";

/** Props del componente `ContratoEditar`. */
type Props = {
  /** Identificador del contrato a editar. */
  id: string;
  /** Terceros para resolver el nombre; los compone `app/`. */
  terceros: TerceroContrato[];
  /** Fincas para resolver el nombre; las compone `app/`. */
  fincas: FincaContrato[];
};

/**
 * Conexión de la edición de contratos.
 *
 * Obtiene el contrato por su identificador y precarga el formulario. El envío solo lleva
 * campos mutables; la fecha de cierre se convierte a ISO 8601 cuando el contrato queda
 * cerrado. Al completarse muestra la confirmación y vuelve al detalle.
 */
export function ContratoEditar({ id, terceros, fincas }: Props) {
  const router = useRouter();
  const contrato = useContrato(id);
  const actualizar = useActualizarContrato();
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const handleGuardar = async (datos: DatosFormularioContrato) => {
    const actualizables: ActualizarContrato = {
      estado: datos.estado,
      ...(datos.estado === "cerrado" && datos.fecha_cierre
        ? { fecha_cierre: fechaLocalAIso(datos.fecha_cierre) }
        : {}),
      ...(datos.raza ? { raza: datos.raza } : {}),
      ...(datos.peso_promedio_actual !== undefined
        ? { peso_promedio_actual: datos.peso_promedio_actual }
        : {}),
      ...(datos.cantidad_actual !== undefined
        ? { cantidad_actual: datos.cantidad_actual }
        : {}),
      ...(datos.valor_kilo_referencia !== undefined
        ? { valor_kilo_referencia: datos.valor_kilo_referencia }
        : {}),
    };

    try {
      await actualizar.mutateAsync({ id, datos: actualizables });
      setMensajeExito("Contrato actualizado.");
      router.push(`/contratos/${id}`);
    } catch {
      // El error de la mutación se muestra dentro del formulario.
    }
  };

  if (contrato.isPending) {
    return (
      <p className="mx-auto w-full max-w-2xl text-sm text-zinc-500">
        Cargando contrato…
      </p>
    );
  }

  if (contrato.error) {
    return (
      <p role="alert" className="mx-auto w-full max-w-2xl text-sm text-red-600">
        {mensajeErrorDetalleContrato(contrato.error.status)}
      </p>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
        Editar contrato
      </h1>
      <p className="mb-6 text-sm text-zinc-600">
        Actualiza los campos mutables del contrato. El socio, la finca, la fecha
        de apertura y los porcentajes no se pueden modificar.
      </p>

      <ContratoForm
        key={contrato.data.id}
        modo="editar"
        terceros={terceros}
        fincas={fincas}
        contrato={contrato.data}
        enviando={actualizar.isPending}
        mensajeError={
          actualizar.error
            ? mensajeErrorGuardarContrato(actualizar.error.status)
            : null
        }
        onGuardar={handleGuardar}
        onCancelar={() => router.push(`/contratos/${id}`)}
      />

      <Toast
        abierto={mensajeExito !== null}
        mensaje={mensajeExito ?? ""}
        onCerrar={() => setMensajeExito(null)}
      />
    </section>
  );
}
