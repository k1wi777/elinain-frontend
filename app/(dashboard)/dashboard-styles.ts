/** Estilos de foco compartidos por la composición del área protegida. */
export const ESTILOS_ENLACE_FOCUS_DASHBOARD =
  "rounded-lg outline-none focus-visible:text-white focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:ring-offset-elinain-bg";

/**
 * Estilos de los enlaces de la navegación principal del área protegida.
 *
 * En hover no cambian el fondo: un subrayado dorado crece horizontalmente desde el centro
 * del enlace, como una línea que se expande de izquierda a derecha.
 */
export const ESTILOS_ENLACE_NAVEGACION =
  "relative shrink-0 px-2.5 py-1.5 text-xs font-medium transition-colors hover:text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-elinain-gold after:transition-transform after:duration-300 hover:after:scale-x-100 sm:text-sm";
