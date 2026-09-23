"use client";

import { useCallback, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { cn } from "@/shared/lib/cn";
import { CiclosSeccion } from "@/features/ciclos";
import { ComprasSeccion } from "@/features/compras";
import {
  clavesContratos,
  ContratoDetalle,
  useContrato,
  type FincaContrato,
  type TerceroContrato,
} from "@/features/contratos";
import { CostosSeccion } from "@/features/costos";
import { useTodasLasFincas } from "@/features/fincas";
import { useTodosLosTerceros } from "@/features/terceros";
import { VentasSeccion } from "@/features/ventas";

/** Pestañas del detalle, en el orden en que se presentan. */
const PESTANAS = [
  { id: "compras", etiqueta: "Compras asociadas" },
  { id: "ciclos", etiqueta: "Ciclos de Pesaje" },
  { id: "costos", etiqueta: "Costos Informativos" },
  { id: "ventas", etiqueta: "Ventas & Liquidación Parcial" },
] as const;

/** Identificador de cada pestaña. */
type IdPestana = (typeof PESTANAS)[number]["id"];

/** Contadores de registros por pestaña; arrancan en cero hasta que cada sección reporta. */
type Contadores = Record<IdPestana, number>;

const CONTADORES_INICIALES: Contadores = {
  compras: 0,
  ciclos: 0,
  costos: 0,
  ventas: 0,
};

/** Props del componente `DetalleConRelaciones`. */
type Props = {
  /** Identificador del contrato a mostrar. */
  id: string;
};

/**
 * Composición del detalle de contrato con terceros, fincas, compras, ciclos, costos y
 * ventas.
 *
 * Carga los terceros y las fincas para resolver los nombres y los pasa por props a
 * `features/contratos`, sin que el feature importe de otros features. Las compras, los
 * ciclos, los costos y las ventas se componen aquí como pestañas accesibles; las cuatro
 * secciones permanecen montadas y las inactivas se ocultan con `hidden` para no perder
 * estado ni provocar recargas. Cada sección notifica su total con `onTotal` y estos
 * callbacks son estables para que el efecto de notificación no entre en bucle. El estado
 * del contrato se obtiene con `useContrato` —que TanStack Query deduplica con la consulta
 * de `ContratoDetalle`— y se pasa a `CiclosSeccion` y `CostosSeccion` para deshabilitar el
 * registro cuando el contrato está cerrado.
 */
export function DetalleConRelaciones({ id }: Props) {
  const queryClient = useQueryClient();
  const terceros = useTodosLosTerceros();
  const fincas = useTodasLasFincas();
  const contrato = useContrato(id);

  const [pestanaActiva, setPestanaActiva] = useState<IdPestana>("compras");
  const [contadores, setContadores] =
    useState<Contadores>(CONTADORES_INICIALES);

  const notificarCompras = useCallback((total: number) => {
    setContadores((actuales) =>
      actuales.compras === total ? actuales : { ...actuales, compras: total },
    );
  }, []);

  const notificarCiclos = useCallback((total: number) => {
    setContadores((actuales) =>
      actuales.ciclos === total ? actuales : { ...actuales, ciclos: total },
    );
  }, []);

  const notificarCostos = useCallback((total: number) => {
    setContadores((actuales) =>
      actuales.costos === total ? actuales : { ...actuales, costos: total },
    );
  }, []);

  const notificarVentas = useCallback((total: number) => {
    setContadores((actuales) =>
      actuales.ventas === total ? actuales : { ...actuales, ventas: total },
    );
  }, []);

  const invalidarContratos = () => {
    void queryClient.invalidateQueries({ queryKey: clavesContratos.todas });
  };

  if (terceros.isPending || fincas.isPending) {
    return (
      <p className="mx-auto w-full max-w-7xl text-sm text-zinc-400">
        Cargando…
      </p>
    );
  }

  if (terceros.error || fincas.error) {
    return (
      <p
        role="alert"
        className="mx-auto w-full max-w-7xl rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
      >
        No se pudieron cargar los socios de participación ni las fincas.
      </p>
    );
  }

  const tercerosContrato: TerceroContrato[] = (terceros.data ?? []).map(
    (tercero) => ({ id: tercero.id, nombre: tercero.nombre }),
  );
  const fincasContrato: FincaContrato[] = (fincas.data ?? []).map((finca) => ({
    id: finca.id,
    nombre: finca.nombre,
    tercero_id: finca.tercero_id,
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <ContratoDetalle
        id={id}
        terceros={tercerosContrato}
        fincas={fincasContrato}
      />

      <div className="flex flex-col gap-6">
        <div
          role="tablist"
          aria-label="Secciones del contrato"
          className="flex flex-wrap gap-2"
        >
          {PESTANAS.map((pestana) => {
            const activa = pestanaActiva === pestana.id;

            return (
              <button
                key={pestana.id}
                type="button"
                role="tab"
                id={`pestana-${pestana.id}`}
                aria-selected={activa}
                aria-controls={`panel-${pestana.id}`}
                onClick={() => setPestanaActiva(pestana.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:outline-none",
                  activa
                    ? "border-elinain-gold/40 bg-elinain-gold/15 text-elinain-gold"
                    : "border-white/8 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <span>{pestana.etiqueta}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    activa
                      ? "bg-elinain-gold/20 text-elinain-gold"
                      : "bg-white/[0.06] text-zinc-400",
                  )}
                >
                  {contadores[pestana.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="panel-compras"
          aria-labelledby="pestana-compras"
          hidden={pestanaActiva !== "compras"}
        >
          <ComprasSeccion
            contratoId={id}
            onTotal={notificarCompras}
            onCambio={invalidarContratos}
          />
        </div>

        <div
          role="tabpanel"
          id="panel-ciclos"
          aria-labelledby="pestana-ciclos"
          hidden={pestanaActiva !== "ciclos"}
        >
          <CiclosSeccion
            contratoId={id}
            contratoEstado={contrato.data?.estado}
            onTotal={notificarCiclos}
            onCambio={invalidarContratos}
          />
        </div>

        <div
          role="tabpanel"
          id="panel-costos"
          aria-labelledby="pestana-costos"
          hidden={pestanaActiva !== "costos"}
        >
          <CostosSeccion
            contratoId={id}
            contratoEstado={contrato.data?.estado}
            onTotal={notificarCostos}
            onCambio={invalidarContratos}
          />
        </div>

        <div
          role="tabpanel"
          id="panel-ventas"
          aria-labelledby="pestana-ventas"
          hidden={pestanaActiva !== "ventas"}
        >
          <VentasSeccion
            contratoId={id}
            onTotal={notificarVentas}
            onCambio={invalidarContratos}
          />
        </div>
      </div>
    </div>
  );
}
