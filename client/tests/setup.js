import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// jsdom does not implement IntersectionObserver. Motion's `whileInView`
// (used by Reveal/StaggerGroup) needs it to exist, even in a no-op form,
// or component mounting throws.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = MockIntersectionObserver;

afterEach(() => {
  cleanup();
});
