import type { ReactNode } from "react";

/** Props del layout de acceso. */
type Props = { children: ReactNode };

/** Layout centrado para las pantallas de acceso (`/login` y `/registro`). */
export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      {children}
    </div>
  );
}
