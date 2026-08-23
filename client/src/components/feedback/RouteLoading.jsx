import { Container } from "../ui/Container";

/**
 * Suspense fallback shown while a lazy-loaded route chunk downloads. Kept
 * intentionally minimal — no progress percentage, no animation — since it
 * is only ever visible for the brief moment a route module is fetched.
 * `min-h-[50vh]` gives it a stable footprint close to real page content so
 * the route swap doesn't cause a layout jump.
 */
export function RouteLoading() {
  return (
    <Container
      as="div"
      className="section-spacing flex min-h-[50vh] items-center justify-center"
    >
      <p role="status" className="body-sm text-(--color-text-muted)">
        Loading page…
      </p>
    </Container>
  );
}
