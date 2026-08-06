import { Outlet } from "react-router-dom";
import { SiteHeader } from "../components/navigation/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
