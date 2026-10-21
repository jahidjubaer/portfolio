import { Suspense } from "react";
import { SkipLink } from "../components/ui/SkipLink";
import { StructuredData } from "../components/seo/StructuredData";
import { RouteLoading } from "../components/feedback/RouteLoading";
import { LeftRail } from "../components/layout/LeftRail";
import { RightRail } from "../components/layout/RightRail";
import { BottomNav } from "../components/layout/BottomNav";
import { BackToTop } from "../components/layout/BackToTop";
import { ShellFooter } from "../components/layout/ShellFooter";
import { PreferencesProvider } from "../features/preferences/PreferencesProvider";
import { PageTransition } from "../features/motion/PageTransition";
import { CommandPalette } from "../features/command-palette/CommandPalette";
import { AskJahid } from "../features/ask/AskJahid";
import { GreetingPopup } from "../features/greeting/GreetingPopup";
import { OpeningCurtain } from "../features/intro/OpeningCurtain";

/**
 * Three-column app shell: navigation rail | page column | highlights rail.
 * Below xl the right rail folds away (its content lives on the pages and
 * in ShellFooter); below md the left rail becomes BottomNav. Each page
 * renders its own sticky PageHeader at the top of the center column.
 */
export function AppLayout() {
  return (
    <PreferencesProvider>
      <StructuredData />
      <SkipLink targetId="main-content">Skip to main content</SkipLink>
      <div className="grid min-h-dvh md:grid-cols-[var(--rail-left-compact)_minmax(0,var(--center-max))] md:justify-center xl:grid-cols-[15rem_minmax(0,1fr)_19rem] 2xl:grid-cols-[var(--rail-left)_minmax(0,var(--center-max))_var(--rail-right)]">
        <LeftRail />
        <div className="flex min-w-0 flex-col border-(--color-border) pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] md:border-l md:pb-0 xl:border-r">
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            <Suspense fallback={<RouteLoading />}>
              <PageTransition />
            </Suspense>
          </main>
          <ShellFooter />
        </div>
        <RightRail />
      </div>
      <BottomNav />
      <BackToTop />
      <CommandPalette />
      <AskJahid />
      <GreetingPopup />
      <OpeningCurtain />
    </PreferencesProvider>
  );
}
