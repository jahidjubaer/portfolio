import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AskJahid } from "../../../src/features/ask/AskJahid";
import { openAsk } from "../../../src/features/ask/ask-events";
import { sourceLabel } from "../../../src/features/ask/ask-sources";

function reply(status, body) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

async function openPanel() {
  render(
    <MemoryRouter>
      <button type="button">Trigger</button>
      <AskJahid />
    </MemoryRouter>,
  );
  screen.getByRole("button", { name: "Trigger" }).focus();
  act(() => openAsk());
  return screen.findByRole("dialog", { name: "Ask about Jahid" });
}

afterEach(() => vi.unstubAllGlobals());

describe("Ask about Jahid", () => {
  it("opens with the question field focused and suggestions", async () => {
    await openPanel();
    expect(screen.getByLabelText("Your question")).toHaveFocus();
    expect(
      within(screen.getByRole("list", { name: "Suggestions" })).getAllByRole(
        "button",
      ),
    ).toHaveLength(3);
  });

  it("asks the API and shows the answer with links to its pages", async () => {
    const fetchMock = vi.fn(() =>
      reply(200, {
        success: true,
        data: {
          answer: "Yes, in Sarabo.",
          sources: ["/work/sarabo", "/contact"],
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    await openPanel();

    await user.type(screen.getByLabelText("Your question"), "Firebase?{Enter}");

    const conversation = screen.getByRole("list", { name: "Conversation" });
    expect(
      await within(conversation).findByText("Yes, in Sarabo."),
    ).toBeVisible();
    expect(within(conversation).getByText("Firebase?")).toBeVisible();
    expect(
      within(conversation).getByRole("link", { name: "Sarabo" }),
    ).toHaveAttribute("href", "/work/sarabo");
    expect(
      within(conversation).getByRole("link", { name: "Contact" }),
    ).toHaveAttribute("href", "/contact");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/ask$/);
    expect(JSON.parse(init.body)).toEqual({ question: "Firebase?" });
    expect(screen.getByLabelText("Your question")).toHaveValue("");
  });

  it("shows the server's message inline when it can't answer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        reply(429, {
          success: false,
          error: "That's all the questions for today.",
        }),
      ),
    );
    const user = userEvent.setup();
    await openPanel();
    await user.click(
      screen.getByRole("button", { name: "What has Jahid built?" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That's all the questions for today.",
    );
  });

  it("closes on Escape and returns focus to what opened it", async () => {
    const user = userEvent.setup();
    await openPanel();
    await user.keyboard("{Escape}");
    await vi.waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Trigger" })).toHaveFocus();
  });

  it("won't send a question shorter than three characters", async () => {
    await openPanel();
    expect(screen.getByRole("button", { name: "Ask" })).toBeDisabled();
  });
});

describe("sourceLabel", () => {
  it("names pages, projects, and unknown paths", () => {
    expect(sourceLabel("/")).toBe("Profile");
    expect(sourceLabel("/work/sarabo")).toBe("Sarabo");
    expect(sourceLabel("/nowhere")).toBe("/nowhere");
  });
});
