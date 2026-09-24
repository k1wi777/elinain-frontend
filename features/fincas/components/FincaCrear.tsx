"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Toast } from "@/shared/ui";
import { FincaForm } from "@/features/fincas/components/FincaForm";
import { useCrearFinca } from "@/features/fincas/hooks/useCrearFinca";
import { mensajeErrorGuardarFinca } from "@/features/fincas/mensajes-error";
import type { DatosFormularioFinca } from "@/features/fincas/schemas";
import type { Propietario } from "@/features/fincas/types";

/** Props del componente `FincaCrear`. */
type Props = {
  /** Propietarios disponibles para el selector; los compone `app/`. */
  propietarios: Propietario[];
};

/**
 * Conexión de la creación de fincas.
 *
 * Une el formulario con la mutación de creación: al completarse muestra la confirmación y
 * vuelve al listado refrescando la ruta. El error se traduce y se muestra dentro del
 * formulario.
 */
export function FincaCrear({ propietarios }: Props) {
  const router = useRouter();
  const crear = useCrearFinca();
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const handleGuardar = async (datos: DatosFormularioFinca) => {
    try {
      await crear.mutateAsync(datos);
      setMensajeExito("Finca creada.");
      router.push("/fincas");
      router.refresh();
    } catch {
      // El error de la mutación se muestra dentro del formulario.
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="mb-2 text-2xl font-semibold text-elinain-gold">Nueva finca</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Registra la finca, ubícala en el mapa y ajusta el pin con la posición
        exacta.
      </p>

      <FincaForm
        modo="crear"
        propietarios={propietarios}
        enviando={crear.isPending}
        mensajeError={
          crear.error ? mensajeErrorGuardarFinca(crear.error.status) : null
        }
        onGuardar={handleGuardar}
        onCancelar={() => router.push("/fincas")}
      />

      <Toast
        abierto={mensajeExito !== null}
        mensaje={mensajeExito ?? ""}
        onCerrar={() => setMensajeExito(null)}
      />
    </section>
  );
}
