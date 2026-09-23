import type { ReactNode } from "react";

/** Props del layout de acceso. */
type Props = { children: ReactNode };

/**
 * Layout neutro para las pantallas de acceso.
 *
 * Cada página (`/login` y `/registro`) define su propia presentación y fondo,
 * por lo que el layout no impone estilos: solo renderiza su contenido.
 */
export default function AuthLayout({ children }: Props) {
  return <>{children}</>;
}
