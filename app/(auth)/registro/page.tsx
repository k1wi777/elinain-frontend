import type { Metadata } from "next";

import { RegistroForm } from "@/features/auth";

export const metadata: Metadata = { title: "Crear cuenta | Elinain" };

/** Página de registro: compone el formulario del feature `auth`. */
export default function RegistroPage() {
  return (
    <main className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">
        Crear cuenta
      </h1>
      <RegistroForm />
    </main>
  );
}
