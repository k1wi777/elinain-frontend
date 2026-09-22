/**
 * API pública del feature de autenticación.
 *
 * Solo expone los componentes que `app/` compone en sus páginas. `api/`, `hooks/`,
 * `schemas.ts` y `mensajes-error.ts` son internos.
 */
export { LoginForm } from "@/features/auth/components/LoginForm";
export { LogoutButton } from "@/features/auth/components/LogoutButton";
export { RegistroForm } from "@/features/auth/components/RegistroForm";
