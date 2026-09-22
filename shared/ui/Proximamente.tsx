/** Props del componente `Proximamente`. */
type Props = {
  /** Título del módulo que aún no está disponible. */
  titulo: string;
  /** Descripción breve de lo que ofrecerá el módulo. */
  descripcion: string;
};

/**
 * Marcador de posición de un módulo pendiente.
 *
 * Es puramente presentacional y no conoce el dominio: recibe el título y la descripción por
 * props y aporta el lenguaje visual de "disponible próximamente".
 */
export function Proximamente({ titulo, descripcion }: Props) {
  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">{titulo}</h1>
      <p className="mt-2 text-sm text-zinc-600">{descripcion}</p>
      <p className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
        Próximamente.
      </p>
    </section>
  );
}
