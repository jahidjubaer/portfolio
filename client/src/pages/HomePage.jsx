import { usePageMeta } from "../hooks/usePageMeta";
import { HeroSection } from "../sections/home/HeroSection";
import { CredibilityStrip } from "../sections/home/CredibilityStrip";
import { FeaturedProjectsPreview } from "../sections/home/FeaturedProjectsPreview";
import { CapabilitiesPreview } from "../sections/home/CapabilitiesPreview";
import { JourneyPreview } from "../sections/home/JourneyPreview";
import { LearningPreview } from "../sections/home/LearningPreview";
import { BeyondPortal } from "../sections/home/BeyondPortal";
import { ContactCta } from "../sections/home/ContactCta";

export function HomePage() {
  usePageMeta({
    title: "Jahid Hasan — Frontend Developer & Junior Software Engineer",
    description:
      "Portfolio of Jahid Hasan, a CSE graduate and React-focused frontend developer building modern web products and expanding into full-stack and AI-enabled engineering.",
  });

  return (
    <>
      <HeroSection />
      <CredibilityStrip />
      <FeaturedProjectsPreview />
      <CapabilitiesPreview />
      <JourneyPreview />
      <LearningPreview />
      <BeyondPortal />
      <ContactCta />
    </>
  );
}
