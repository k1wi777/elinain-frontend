import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel | Elinain" };

/**
 * Landing protegida mínima.
 *
 * No muestra datos del usuario: el backend no expone un endpoint de perfil y la sesión
 * solo vive en la cookie httpOnly.
 */
export default function DashboardPage() {
  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">
        Bienvenido a Elinain
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Sesión iniciada. Desde aquí gestionarás la compra, el engorde y la
        comercialización de tu ganado.
      </p>
    </section>
  );
}
