"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { fechaLocalAIso } from "@/shared/lib/fechas";
import { Toast } from "@/shared/ui";
import { ContratoForm } from "@/features/contratos/components/ContratoForm";
import { useCrearContrato } from "@/features/contratos/hooks/useCrearContrato";
import { mensajeErrorGuardarContrato } from "@/features/contratos/mensajes-error";
import type { DatosFormularioContrato } from "@/features/contratos/schemas";
import type {
  CrearContrato,
  FincaContrato,
  TerceroContrato,
} from "@/features/contratos/types";

/** Props del componente `ContratoCrear`. */
type Props = {
  /** Terceros disponibles para el selector; los compone `app/`. */
  terceros: TerceroContrato[];
  /** Fincas disponibles para el selector; las compone `app/`. */
  fincas: FincaContrato[];
};

/**
 * Conexión de la apertura de contratos.
 *
 * Une el formulario con la mutación de creación: al completarse muestra la confirmación y
 * navega a la vista de detalle del contrato creado. El error se traduce y se muestra
 * dentro del formulario.
 */
export function ContratoCrear({ terceros, fincas }: Props) {
  const router = useRouter();
  const crear = useCrearContrato();
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const handleGuardar = async (datos: DatosFormularioContrato) => {
    const carga: CrearContrato = {
      tercero_id: datos.tercero_id,
      finca_id: datos.finca_id,
      fecha_apertura: fechaLocalAIso(datos.fecha_apertura),
      porcentaje_comerciante: datos.porcentaje_comerciante,
      porcentaje_tercero: datos.porcentaje_tercero,
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
      const contrato = await crear.mutateAsync(carga);
      setMensajeExito("Contrato abierto.");
      router.push(`/contratos/${contrato.id}`);
    } catch {
      // El error de la mutación se muestra dentro del formulario.
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="mb-2 text-2xl font-semibold text-elinain-gold">Nuevo contrato</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Abre un contrato de participación definiendo el socio, la finca, la
        fecha de apertura y los porcentajes.
      </p>

      <ContratoForm
        modo="crear"
        terceros={terceros}
        fincas={fincas}
        enviando={crear.isPending}
        mensajeError={
          crear.error ? mensajeErrorGuardarContrato(crear.error.status) : null
        }
        onGuardar={handleGuardar}
        onCancelar={() => router.push("/contratos")}
      />

      <Toast
        abierto={mensajeExito !== null}
        mensaje={mensajeExito ?? ""}
        onCerrar={() => setMensajeExito(null)}
      />
    </section>
  );
}
