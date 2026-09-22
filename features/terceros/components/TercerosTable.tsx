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
    { clave: "nombre", encabezado: "Nombre", render: (t) => t.nombre },
    { clave: "documento", encabezado: "Documento", render: (t) => t.documento },
    { clave: "contacto", encabezado: "Contacto", render: (t) => t.contacto },
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
          >
            Editar
          </Button>
          <Button
            variante="peligro"
            onClick={() => abrirEliminar(tercero)}
            aria-label={`Eliminar ${tercero.nombre}`}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={abrirCrear}>Nuevo socio de participación</Button>
      </div>

      {consulta.error ? (
        <p role="alert" className="text-sm text-red-600">
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
