import { afterEach } from "vitest";
import { cleanup, configure } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Lazy routes render inside the full three-column shell; under a parallel
// full-suite run that can take longer than the 1 s default to resolve.
configure({ asyncUtilTimeout: 3000 });

// jsdom does not implement IntersectionObserver. Motion's `whileInView`
// (used by Reveal/StaggerGroup) needs it to exist, even in a no-op form,
// or component mounting throws.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = MockIntersectionObserver;

// jsdom has no canvas implementation. Returning null lets canvas-drawing
// components (ProfileBanner) take their "no 2D context" path quietly
// instead of logging jsdom's not-implemented error.
HTMLCanvasElement.prototype.getContext = () => null;

afterEach(() => {
  cleanup();
});
