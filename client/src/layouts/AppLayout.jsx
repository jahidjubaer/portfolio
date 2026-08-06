import { SiteHeader } from "../components/navigation/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { SkipLink } from "../components/ui/SkipLink";
import { IdentityProvider } from "../features/identity-mode/IdentityProvider";
import { PageTransition } from "../features/motion/PageTransition";

export function AppLayout() {
  return (
    <IdentityProvider>
      <div className="flex min-h-screen flex-col">
        <SkipLink targetId="main-content">Skip to main content</SkipLink>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          <PageTransition />
        </main>
        <SiteFooter />
      </div>
    </IdentityProvider>
  );
}
