import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import {
  TablePagination,
  type PaginacionTabla,
  type TemaTabla,
} from "@/shared/ui/TablePagination";

/** Alineación horizontal del contenido de una columna. */
export type AlineacionColumna = "izquierda" | "centro" | "derecha";

/** Definición de una columna de la tabla. */
export type ColumnaTabla<T> = {
  /** Identificador único de la columna. */
  clave: string;
  /** Texto del encabezado. */
  encabezado: string;
  /** Representación del contenido de la celda para una fila. */
  render: (fila: T) => ReactNode;
  /** Alineación de encabezado y celdas; por defecto a la izquierda. */
  alineacion?: AlineacionColumna;
  /** Clases adicionales aplicadas a encabezado y celdas de la columna. */
  className?: string;
};

/** Props del componente `Table`. */
export type TableProps<T> = {
  /** Columnas y forma de renderizar cada celda. */
  columnas: ColumnaTabla<T>[];
  /** Filas a mostrar. */
  filas: T[];
  /** Obtiene la clave estable de cada fila. */
  obtenerClave: (fila: T) => string | number;
  /** Indica si los datos se están cargando. */
  cargando?: boolean;
  /** Mensaje mostrado cuando no hay filas. */
  mensajeVacio?: string;
  /** Datos y acciones de paginación; si se omiten no se muestran controles. */
  paginacion?: PaginacionTabla;
  /** Tema visual opcional; conserva el tema claro por defecto. */
  tema?: TemaTabla;
};

const ALINEACIONES: Record<AlineacionColumna, string> = {
  izquierda: "text-left",
  centro: "text-center",
  derecha: "text-right",
};

/**
 * Tabla genérica con encabezados, render de celdas, estados de carga/vacío y paginación
 * opcional.
 *
 * No conoce el dominio: el consumidor define las columnas y cómo se representa cada
 * celda. Cuando recibe `paginacion`, delega los controles en `TablePagination`.
 */
export function Table<T>({
  columnas,
  filas,
  obtenerClave,
  cargando = false,
  mensajeVacio = "No hay registros para mostrar.",
  paginacion,
  tema = "claro",
}: TableProps<T>) {
  const hayFilas = filas.length > 0;
  const esOscuro = tema === "oscuro";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        esOscuro
          ? "border border-white/6 bg-elinain-surface shadow-[0_22px_48px_rgb(0_0_0_/_0.2)]"
          : "border border-zinc-200",
      )}
    >
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full border-collapse text-sm",
            esOscuro && "min-w-[720px]",
          )}
        >
          <thead className={esOscuro ? "bg-elinain-bg/70" : "bg-zinc-50"}>
            <tr>
              {columnas.map((columna) => (
                <th
                  key={columna.clave}
                  scope="col"
                  className={cn(
                    esOscuro
                      ? "px-5 py-4 text-[0.68rem] font-semibold tracking-[0.18em] text-zinc-500 uppercase"
                      : "px-4 py-3 font-medium text-zinc-600",
                    ALINEACIONES[columna.alineacion ?? "izquierda"],
                    columna.className,
                  )}
                >
                  {columna.encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td
                  colSpan={columnas.length}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  Cargando…
                </td>
              </tr>
            ) : hayFilas ? (
              filas.map((fila) => (
                <tr
                  key={obtenerClave(fila)}
                  className={cn(
                    "border-t",
                    esOscuro
                      ? "border-white/6 transition-colors hover:bg-white/[0.035]"
                      : "border-zinc-200",
                  )}
                >
                  {columnas.map((columna) => (
                    <td
                      key={columna.clave}
                      className={cn(
                        esOscuro
                          ? "px-5 py-[1.1rem] align-middle text-zinc-200"
                          : "px-4 py-3 text-zinc-800",
                        ALINEACIONES[columna.alineacion ?? "izquierda"],
                        columna.className,
                      )}
                    >
                      {columna.render(fila)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columnas.length}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  {mensajeVacio}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {paginacion ? <TablePagination {...paginacion} tema={tema} /> : null}
    </div>
  );
}
