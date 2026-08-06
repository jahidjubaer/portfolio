import { createContext, useLayoutEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { resolveIdentityForPath } from "./identity-config";

export const IdentityContext = createContext(null);

/**
 * Derives SYSTEM/STORY identity from the current route and applies it to
 * the document root as `data-identity`, so every token in tokens.css
 * switches automatically. Must render inside the router (it reads
 * useLocation), which is why it wraps <Outlet /> in AppLayout rather than
 * wrapping <RouterProvider /> itself.
 *
 * Uses useLayoutEffect (not useEffect) so the attribute is set before the
 * browser paints the new route — this is what prevents an incorrect-color
 * flash during client-side navigation.
 * @param {{ children: import("react").ReactNode }} props
 */
export function IdentityProvider({ children }) {
  const { pathname } = useLocation();
  const identity = useMemo(() => resolveIdentityForPath(pathname), [pathname]);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-identity", identity);
  }, [identity]);

  return (
    <IdentityContext.Provider value={identity}>
      {children}
    </IdentityContext.Provider>
  );
}
