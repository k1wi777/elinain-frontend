/** Contenido factual de la landing, alineado con la contextualización del producto. */

export const PROBLEMAS = [
  {
    titulo: "Información dispersa",
    descripcion:
      "Registros manuales en libretas o hojas sueltas que se pierden o no cuadran entre sí.",
  },
  {
    titulo: "Rentabilidad difusa",
    descripcion:
      "Dificultad para calcular el costo real por animal, la utilidad por ciclo y el impacto de flete, alimentación o sanidad.",
  },
  {
    titulo: "Participación con terceros",
    descripcion:
      "Reparto de utilidades del ganado en participación sin trazabilidad confiable entre comerciante e inversionista.",
  },
  {
    titulo: "Varias fincas",
    descripcion:
      "Sin una vista consolidada cuando los animales están repartidos en fincas propias o de terceros.",
  },
] as const;

export const FUNCIONALIDADES = [
  {
    numero: "01",
    titulo: "Inventario",
    descripcion: "Animales con trazabilidad por contrato y ciclo.",
  },
  {
    numero: "02",
    titulo: "Compras y ventas",
    descripcion: "Registro de operaciones y precios en el flujo del negocio.",
  },
  {
    numero: "03",
    titulo: "Costos operativos",
    descripcion: "Flete, alimentación, sanidad y demás gastos del engorde.",
  },
  {
    numero: "04",
    titulo: "Sanidad",
    descripcion: "Seguimiento de eventos sanitarios vinculados al inventario.",
  },
  {
    numero: "05",
    titulo: "Ganado en participación",
    descripcion: "Contratos con terceros y reparto de utilidad auditable.",
  },
  {
    numero: "06",
    titulo: "Facturación",
    descripcion:
      "Emisión al momento de la venta, integrada al flujo comercial.",
  },
  {
    numero: "07",
    titulo: "Multi-finca",
    descripcion:
      "Operación en varias fincas, propias o de terceros, en un solo lugar.",
  },
  {
    numero: "08",
    titulo: "Métricas de rentabilidad",
    descripcion:
      "Indicadores por ciclo y por animal a partir de datos consolidados.",
  },
] as const;

export const PILARES_CONFIANZA = [
  "Enfocado en comerciantes ganaderos",
  "Trazabilidad en participación con terceros",
  "Métricas de rentabilidad por ciclo",
] as const;
