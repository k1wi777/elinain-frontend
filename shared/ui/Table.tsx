import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import {
  TablePagination,
  type PaginacionTabla,
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
}: TableProps<T>) {
  const hayFilas = filas.length > 0;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50">
            <tr>
              {columnas.map((columna) => (
                <th
                  key={columna.clave}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-medium text-zinc-600",
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
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  Cargando…
                </td>
              </tr>
            ) : hayFilas ? (
              filas.map((fila) => (
                <tr
                  key={obtenerClave(fila)}
                  className="border-t border-zinc-200"
                >
                  {columnas.map((columna) => (
                    <td
                      key={columna.clave}
                      className={cn(
                        "px-4 py-3 text-zinc-800",
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
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  {mensajeVacio}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {paginacion ? <TablePagination {...paginacion} /> : null}
    </div>
  );
}
