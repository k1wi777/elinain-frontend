import type { Metadata } from "next";

import { LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Iniciar sesión | Elinain" };

/** Página de acceso: compone el formulario del feature `auth`. */
export default function LoginPage() {
  return (
    <main className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">
        Iniciar sesión
      </h1>
      <LoginForm />
    </main>
  );
}
