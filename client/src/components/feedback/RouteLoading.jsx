import { Container } from "../ui/Container";

/**
 * Suspense fallback shown while a lazy-loaded route chunk downloads. Kept
 * intentionally minimal — no progress percentage, no animation — since it
 * is only ever visible for the brief moment a route module is fetched.
 * The full-viewport min-height keeps the footer below the fold while a
 * route loads — every real page is at least a viewport tall, so the swap
 * moves nothing that is currently visible (this was measured: a 50vh
 * fallback put the footer on screen and scored CLS 0.36 on direct loads).
 */
export function RouteLoading() {
  return (
    <Container
      as="div"
      className="section-spacing flex min-h-dvh items-center justify-center"
    >
      <p role="status" className="body-sm text-(--color-text-muted)">
        Loading page…
      </p>
    </Container>
  );
}
