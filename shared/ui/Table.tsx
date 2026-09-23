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
  /**
   * Clases de padding vertical aplicadas a las celdas de datos.
   *
   * Es una prop visual opcional: si se omite, se conservan los paddings del tema. Permite
   * aumentar el aire vertical por fila sin alterar encabezados ni controladores.
   */
  paddingFilas?: string;
};

const ALINEACIONES: Record<AlineacionColumna, string> = {
  izquierda: "text-left",
  centro: "text-center",
  derecha: "text-right",
};

/**
 * Estilos de cada celda de datos. Cada fila se presenta como una tarjeta independiente con
 * esquinas redondeadas: la primera y la última celda cierran el borde y las esquinas.
 */
const CELDA = {
  oscuro:
    "border-y border-white/6 bg-elinain-surface text-zinc-200 first:rounded-l-2xl first:border-l last:rounded-r-2xl last:border-r group-hover:bg-white/[0.05]",
  claro:
    "border-y border-zinc-200 bg-white text-zinc-800 first:rounded-l-2xl first:border-l last:rounded-r-2xl last:border-r group-hover:bg-zinc-50",
} satisfies Record<TemaTabla, string>;

/** Estilos de la celda que ocupa toda la fila en los estados de carga y vacío. */
const CELDA_ANCHA = {
  oscuro:
    "rounded-2xl border border-white/6 bg-elinain-surface/70 text-zinc-500",
  claro: "rounded-2xl border border-zinc-200 bg-white text-zinc-500",
} satisfies Record<TemaTabla, string>;

/**
 * Tabla genérica con encabezados, render de celdas, estados de carga/vacío y paginación
 * opcional.
 *
 * No conoce el dominio: el consumidor define las columnas y cómo se representa cada
 * celda. Cada fila se muestra como una superficie tipo tarjeta, separada por un pequeño
 * espacio, en lugar de las líneas de la tabla HTML por defecto. Cuando recibe `paginacion`,
 * delega los controles en `TablePagination`.
 */
export function Table<T>({
  columnas,
  filas,
  obtenerClave,
  cargando = false,
  mensajeVacio = "No hay registros para mostrar.",
  paginacion,
  tema = "claro",
  paddingFilas,
}: TableProps<T>) {
  const hayFilas = filas.length > 0;
  const esOscuro = tema === "oscuro";

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full border-separate border-spacing-y-2 text-sm",
            esOscuro && "min-w-[720px]",
          )}
        >
          <thead>
            <tr>
              {columnas.map((columna) => (
                <th
                  key={columna.clave}
                  scope="col"
                  className={cn(
                    "px-5 pt-1 pb-2 text-[0.68rem] font-semibold tracking-[0.18em] text-zinc-500 uppercase",
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
                  className={cn("px-5 py-10 text-center", CELDA_ANCHA[tema])}
                >
                  Cargando…
                </td>
              </tr>
            ) : hayFilas ? (
              filas.map((fila) => (
                <tr
                  key={obtenerClave(fila)}
                  className="group transition-colors"
                >
                  {columnas.map((columna) => (
                    <td
                      key={columna.clave}
                      className={cn(
                        "px-5 py-4 align-middle",
                        CELDA[tema],
                        paddingFilas,
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
                  className={cn("px-5 py-10 text-center", CELDA_ANCHA[tema])}
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
