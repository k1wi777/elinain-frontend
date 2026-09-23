import type { Metadata } from "next";

import { LandingPage } from "@/features/landing";

export const metadata: Metadata = {
  title: "Elinain — Gestión integral del engorde bovino",
  description:
    "Plataforma para comerciantes ganaderos que centraliza inventario, compras y ventas, costos, sanidad y ganado en participación, con trazabilidad y métricas de rentabilidad.",
};

export default function Page() {
  return <LandingPage />;
}
