"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Toast } from "@/shared/ui";
import { FincaForm } from "@/features/fincas/components/FincaForm";
import { useActualizarFinca } from "@/features/fincas/hooks/useActualizarFinca";
import { useFinca } from "@/features/fincas/hooks/useFinca";
import { mensajeErrorGuardarFinca } from "@/features/fincas/mensajes-error";
import type { DatosFormularioFinca } from "@/features/fincas/schemas";
import type { ActualizarFinca, Propietario } from "@/features/fincas/types";

/** Props del componente `FincaEditar`. */
type Props = {
  /** Identificador de la finca a editar. */
  id: string;
  /** Propietarios disponibles para el selector; los compone `app/`. */
  propietarios: Propietario[];
};

/**
 * Conexión de la edición de fincas.
 *
 * Obtiene la finca por su identificador y precarga el formulario. El propietario no se
 * envía nunca: el `PATCH` solo incluye nombre, dirección y coordenadas. Al completarse
 * muestra la confirmación y vuelve al listado refrescando la ruta.
 */
export function FincaEditar({ id, propietarios }: Props) {
  const router = useRouter();
  const finca = useFinca(id);
  const actualizar = useActualizarFinca();
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const handleGuardar = async (datos: DatosFormularioFinca) => {
    const actualizables: ActualizarFinca = {
      nombre: datos.nombre,
      direccion: datos.direccion,
      latitud: datos.latitud,
      longitud: datos.longitud,
    };

    try {
      await actualizar.mutateAsync({ id, datos: actualizables });
      setMensajeExito("Finca actualizada.");
      router.push("/fincas");
      router.refresh();
    } catch {
      // El error de la mutación se muestra dentro del formulario.
    }
  };

  if (finca.isPending) {
    return (
      <p className="mx-auto w-full max-w-2xl text-sm text-zinc-500">
        Cargando finca…
      </p>
    );
  }

  if (finca.error) {
    return (
      <p role="alert" className="mx-auto w-full max-w-2xl text-sm text-red-400">
        {mensajeErrorGuardarFinca(finca.error.status)}
      </p>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="mb-2 text-2xl font-semibold text-white">Editar finca</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Actualiza los datos de la finca. El propietario no se puede modificar.
      </p>

      <FincaForm
        key={finca.data.id}
        modo="editar"
        propietarios={propietarios}
        finca={finca.data}
        enviando={actualizar.isPending}
        mensajeError={
          actualizar.error
            ? mensajeErrorGuardarFinca(actualizar.error.status)
            : null
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
