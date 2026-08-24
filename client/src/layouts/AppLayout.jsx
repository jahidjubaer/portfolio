import { Suspense } from "react";
import { SiteHeader } from "../components/navigation/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { SkipLink } from "../components/ui/SkipLink";
import { StructuredData } from "../components/seo/StructuredData";
import { RouteLoading } from "../components/feedback/RouteLoading";
import { IdentityProvider } from "../features/identity-mode/IdentityProvider";
import { PageTransition } from "../features/motion/PageTransition";
import { CommandPalette } from "../features/command-palette/CommandPalette";

export function AppLayout() {
  return (
    <IdentityProvider>
      <StructuredData />
      <div className="flex min-h-screen flex-col">
        <SkipLink targetId="main-content">Skip to main content</SkipLink>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          <Suspense fallback={<RouteLoading />}>
            <PageTransition />
          </Suspense>
        </main>
        <SiteFooter />
      </div>
      <CommandPalette />
    </IdentityProvider>
  );
}
