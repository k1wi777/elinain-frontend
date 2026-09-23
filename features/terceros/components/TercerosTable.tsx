"use client";

import { useState } from "react";

import {
  calcularPagina,
  calcularTotalPaginas,
  normalizarPagina,
} from "@/shared/api/pagination";
import { usePagination } from "@/shared/api/usePagination";
import {
  Button,
  Modal,
  Table,
  Toast,
  type ColumnaTabla,
  type PaginacionTabla,
} from "@/shared/ui";
import { EliminarTerceroModal } from "@/features/terceros/components/EliminarTerceroModal";
import { TerceroForm } from "@/features/terceros/components/TerceroForm";
import { useActualizarTercero } from "@/features/terceros/hooks/useActualizarTercero";
import { useCrearTercero } from "@/features/terceros/hooks/useCrearTercero";
import { useEliminarTercero } from "@/features/terceros/hooks/useEliminarTercero";
import { useTerceros } from "@/features/terceros/hooks/useTerceros";
import {
  mensajeErrorEliminarTercero,
  mensajeErrorGuardarTercero,
  mensajeErrorListarTerceros,
} from "@/features/terceros/mensajes-error";
import type { DatosFormularioTercero } from "@/features/terceros/schemas";
import type { Tercero } from "@/features/terceros/types";

/**
 * Total provisional con el que se inicializa `usePagination`.
 *
 * El total real solo se conoce cuando responde la consulta, y el hook debe invocarse
 * antes de consultar para aportar `limite`/`offset`. Al desconocer el total, los campos
 * derivados se recalculan en render con `calcularTotalPaginas`, `calcularPagina` y
 * `normalizarPagina`; este valor mantiene operativas las acciones del hook
 * (anterior/siguiente), que dependen del total para habilitarse.
 */
const TOTAL_PROVISIONAL = Number.MAX_SAFE_INTEGER;

function obtenerIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0] ?? "")
    .join("")
    .toUpperCase();
}

/**
 * Listado de socios de participación con alta, edición y borrado.
 *
 * La tabla consume la consulta paginada y compone los modales de formulario y de
 * confirmación. Al crear, editar o eliminar, las mutaciones invalidan las claves del
 * feature y el listado se refresca sin recargar la página.
 */
export function TercerosTable() {
  const paginacion = usePagination({ total: TOTAL_PROVISIONAL });
  const { limite, offset } = paginacion;

  const consulta = useTerceros({ limite, offset });
  const filas = consulta.data?.elementos ?? [];
  const total = consulta.data?.total ?? 0;

  const totalPaginas = calcularTotalPaginas(total, limite);
  const paginaActual = normalizarPagina(
    calcularPagina(offset, limite),
    totalPaginas,
  );

  const paginacionTabla: PaginacionTabla = {
    paginaActual,
    totalPaginas,
    total,
    limite,
    hayPaginaAnterior: offset > 0,
    hayPaginaSiguiente: paginaActual < totalPaginas,
    irAPaginaAnterior: paginacion.irAPaginaAnterior,
    irAPaginaSiguiente: paginacion.irAPaginaSiguiente,
  };

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [terceroEnEdicion, setTerceroEnEdicion] = useState<Tercero | null>(
    null,
  );
  const [terceroAEliminar, setTerceroAEliminar] = useState<Tercero | null>(
    null,
  );
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const crear = useCrearTercero();
  const actualizar = useActualizarTercero();
  const eliminar = useEliminarTercero();

  const guardando = crear.isPending || actualizar.isPending;
  const errorGuardar = crear.error ?? actualizar.error;

  const abrirCrear = () => {
    crear.reset();
    actualizar.reset();
    setTerceroEnEdicion(null);
    setFormularioAbierto(true);
  };

  const abrirEditar = (tercero: Tercero) => {
    crear.reset();
    actualizar.reset();
    setTerceroEnEdicion(tercero);
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setTerceroEnEdicion(null);
    crear.reset();
    actualizar.reset();
  };

  const handleGuardar = async (datos: DatosFormularioTercero) => {
    const esEdicion = terceroEnEdicion !== null;

    try {
      if (terceroEnEdicion) {
        await actualizar.mutateAsync({ id: terceroEnEdicion.id, datos });
      } else {
        await crear.mutateAsync(datos);
      }

      setMensajeExito(
        esEdicion
          ? "Socio de participación actualizado."
          : "Socio de participación creado.",
      );
      cerrarFormulario();
    } catch {
      // El error de la mutación se muestra dentro del formulario.
    }
  };

  const abrirEliminar = (tercero: Tercero) => {
    eliminar.reset();
    setTerceroAEliminar(tercero);
  };

  const cerrarEliminar = () => {
    setTerceroAEliminar(null);
    eliminar.reset();
  };

  const handleEliminar = async () => {
    if (!terceroAEliminar) {
      return;
    }

    const eraUnicaFilaDePagina = filas.length === 1 && paginaActual > 1;

    try {
      await eliminar.mutateAsync(terceroAEliminar.id);
      setMensajeExito("Socio de participación eliminado.");
      cerrarEliminar();

      if (eraUnicaFilaDePagina) {
        paginacion.irAPaginaAnterior();
      }
    } catch {
      // El error de la mutación se muestra dentro del modal.
    }
  };

  const columnas: ColumnaTabla<Tercero>[] = [
    {
      clave: "nombre",
      encabezado: "Nombre",
      render: (t) => (
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-semibold text-elinain-gold"
          >
            {obtenerIniciales(t.nombre)}
          </span>
          <span className="font-medium text-white">{t.nombre}</span>
        </div>
      ),
    },
    {
      clave: "documento",
      encabezado: "Documento",
      render: (t) => <span className="text-zinc-400">{t.documento}</span>,
    },
    {
      clave: "contacto",
      encabezado: "Contacto",
      render: (t) => <span className="text-zinc-300">{t.contacto}</span>,
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alineacion: "derecha",
      render: (tercero) => (
        <div className="flex justify-end gap-2">
          <Button
            variante="secundario"
            onClick={() => abrirEditar(tercero)}
            aria-label={`Editar ${tercero.nombre}`}
            className="border-white/8 bg-white/[0.03] px-3 text-xs text-zinc-300 hover:bg-white/[0.08] hover:text-white focus-visible:ring-elinain-gold"
          >
            Editar
          </Button>
          <Button
            variante="peligro"
            onClick={() => abrirEliminar(tercero)}
            aria-label={`Eliminar ${tercero.nombre}`}
            className="bg-red-400/10 px-3 text-xs text-red-200 hover:bg-red-400/20 focus-visible:ring-red-300"
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="terceros-title" className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-elinain-gold uppercase">
            Directorio de participación
          </p>
          <h1
            id="terceros-title"
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            Socios de participación
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            Administra los terceros propietarios y depositarios que participan
            en las operaciones de engorde y comercialización de ganado.
          </p>
        </div>
        <Button
          onClick={abrirCrear}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-elinain-gold px-5 py-3.5 text-sm font-semibold text-elinain-bg shadow-[0_10px_24px_rgb(232_185_35_/_0.16)] hover:bg-elinain-gold-hover focus-visible:ring-elinain-gold sm:w-auto"
        >
          <span aria-hidden className="text-lg leading-none font-normal">
            +
          </span>
          <span>Nuevo socio de participación</span>
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-white/6 bg-elinain-glass-panel px-5 py-5 shadow-[0_18px_36px_rgb(0_0_0_/_0.14)] sm:px-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            Total de socios
          </p>
          <p
            className="mt-3 font-display text-4xl tracking-tight text-elinain-gold"
            aria-live="polite"
          >
            {consulta.isPending || consulta.error ? "—" : total}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Registros disponibles</p>
        </article>
        <article className="rounded-2xl border border-white/6 bg-elinain-glass-panel px-5 py-5 shadow-[0_18px_36px_rgb(0_0_0_/_0.14)] sm:px-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            En esta página
          </p>
          <p
            className="mt-3 font-display text-4xl tracking-tight text-white"
            aria-live="polite"
          >
            {consulta.isPending || consulta.error ? "—" : filas.length}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Filas visibles ahora</p>
        </article>
      </div>

      {consulta.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
        >
          {mensajeErrorListarTerceros(consulta.error.status)}
        </p>
      ) : null}

      <Table
        columnas={columnas}
        filas={filas}
        obtenerClave={(tercero) => tercero.id}
        cargando={consulta.isPending}
        mensajeVacio="Aún no tienes socios de participación registrados"
        paginacion={paginacionTabla}
        tema="oscuro"
      />

      {formularioAbierto ? (
        <Modal
          abierto
          titulo={
            terceroEnEdicion
              ? "Editar socio de participación"
              : "Nuevo socio de participación"
          }
          onCerrar={cerrarFormulario}
        >
          <TerceroForm
            key={terceroEnEdicion?.id ?? "crear"}
            modo={terceroEnEdicion ? "editar" : "crear"}
            valoresIniciales={terceroEnEdicion ?? undefined}
            enviando={guardando}
            mensajeError={
              errorGuardar
                ? mensajeErrorGuardarTercero(errorGuardar.status)
                : null
            }
            onGuardar={handleGuardar}
            onCancelar={cerrarFormulario}
          />
        </Modal>
      ) : null}

      <EliminarTerceroModal
        abierto={terceroAEliminar !== null}
        tercero={terceroAEliminar}
        enviando={eliminar.isPending}
        mensajeError={
          eliminar.error
            ? mensajeErrorEliminarTercero(eliminar.error.status)
            : null
        }
        onConfirmar={handleEliminar}
        onCerrar={cerrarEliminar}
      />

      <Toast
        abierto={mensajeExito !== null}
        mensaje={mensajeExito ?? ""}
        onCerrar={() => setMensajeExito(null)}
      />
    </section>
  );
}
