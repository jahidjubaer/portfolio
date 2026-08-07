import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const submitContactMessage = vi.fn();
vi.mock("../../../src/lib/api", () => ({
  submitContactMessage: (...args) => submitContactMessage(...args),
}));

import { ContactForm } from "../../../src/features/contact/ContactForm";

async function fillValidForm(user) {
  await user.type(screen.getByLabelText(/name/i), "Jane Doe");
  await user.type(screen.getByLabelText(/email/i), "jane@example.com");
  await user.type(screen.getByLabelText(/subject/i), "Project inquiry");
  await user.type(
    screen.getByLabelText(/message/i),
    "I would love to discuss a frontend role with you.",
  );
}

describe("ContactForm", () => {
  beforeEach(() => {
    submitContactMessage.mockReset();
  });

  it("shows field errors and does not submit when empty", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText("Enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
    expect(submitContactMessage).not.toHaveBeenCalled();
  });

  it("submits valid data, shows success, and clears the form", async () => {
    submitContactMessage.mockResolvedValue({
      success: true,
      message: "Your message has been received.",
    });
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText("Your message has been received."),
    ).toBeInTheDocument();
    expect(submitContactMessage).toHaveBeenCalledTimes(1);
    // Fields are reset after a successful send.
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
    expect(screen.getByLabelText(/message/i)).toHaveValue("");
  });

  it("preserves typed values and offers an email fallback on failure", async () => {
    submitContactMessage.mockResolvedValue({
      success: false,
      message:
        "Could not reach the server. Please try again or email directly.",
    });
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not reach the server/i,
    );
    // The message the user typed is never lost.
    expect(screen.getByLabelText(/message/i)).toHaveValue(
      "I would love to discuss a frontend role with you.",
    );
    // A direct mailto fallback is offered.
    expect(
      screen.getByRole("link", { name: /jahidhasan\.metro@gmail\.com/i }),
    ).toHaveAttribute("href", "mailto:jahidhasan.metro@gmail.com");
  });

  it("surfaces server field errors without wiping the form", async () => {
    submitContactMessage.mockResolvedValue({
      success: false,
      message: "Please correct the highlighted fields.",
      errors: { email: "Enter a valid email address." },
    });
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toHaveValue("Project inquiry");
  });

  it("renders a hidden honeypot field that is not exposed to assistive tech", () => {
    render(<ContactForm />);
    // The honeypot lives inside an aria-hidden wrapper, so it is not part of
    // the accessible form. It exists in the DOM for bots to trip over.
    const honeypot = document.getElementById("companyWebsite");
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot.closest("[aria-hidden='true']")).not.toBeNull();
  });
});
