import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { IdentityProvider } from "../../src/features/identity-mode/IdentityProvider";
import { useIdentity } from "../../src/features/identity-mode/useIdentity";

function IdentityProbe() {
  const identity = useIdentity();
  return <div data-testid="identity-probe">{identity}</div>;
}

function App() {
  return (
    <IdentityProvider>
      <nav>
        <Link to="/about">About</Link>
        <Link to="/beyond">Beyond</Link>
      </nav>
      <Routes>
        <Route path="/about" element={<IdentityProbe />} />
        <Route path="/beyond" element={<IdentityProbe />} />
      </Routes>
    </IdentityProvider>
  );
}

describe("Identity mode", () => {
  it("uses SYSTEM on professional routes", () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("identity-probe")).toHaveTextContent("system");
    expect(document.documentElement.getAttribute("data-identity")).toBe(
      "system",
    );
  });

  it("uses STORY on /beyond", () => {
    render(
      <MemoryRouter initialEntries={["/beyond"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("identity-probe")).toHaveTextContent("story");
    expect(document.documentElement.getAttribute("data-identity")).toBe(
      "story",
    );
  });

  it("updates the root data-identity attribute when navigating client-side", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <App />
      </MemoryRouter>,
    );

    expect(document.documentElement.getAttribute("data-identity")).toBe(
      "system",
    );

    await user.click(screen.getByRole("link", { name: "Beyond" }));

    expect(document.documentElement.getAttribute("data-identity")).toBe(
      "story",
    );

    await user.click(screen.getByRole("link", { name: "About" }));

    expect(document.documentElement.getAttribute("data-identity")).toBe(
      "system",
    );
  });
});
