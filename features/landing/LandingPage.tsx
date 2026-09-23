import { LandingAudienceSection } from "./components/LandingAudienceSection";
import {
  LandingCtaSection,
  LandingFooter,
} from "./components/LandingCtaSection";
import { LandingFeaturesSection } from "./components/LandingFeaturesSection";
import { LandingHero } from "./components/LandingHero";
import { LandingNav } from "./components/LandingNav";
import { LandingPersonasSection } from "./components/LandingPersonasSection";
import { LandingProblemSection } from "./components/LandingProblemSection";

/**
 * Landing pública e institucional de Elinain.
 *
 * Server Component presentacional: no gestiona estado ni consume la API.
 */
export function LandingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-elinain-bg text-white">
      <LandingNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <LandingHero />
        <LandingProblemSection />
        <LandingFeaturesSection />
        <LandingPersonasSection />
        <LandingAudienceSection />
        <LandingCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
