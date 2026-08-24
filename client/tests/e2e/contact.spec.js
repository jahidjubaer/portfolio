import { test, expect } from "@playwright/test";

// Scope to the <form> so shared "Email" links in the footer / contact list
// never collide with the form's Email field under strict mode.
function contactForm(page) {
  return page.locator("form");
}

async function fillContactForm(page) {
  const form = contactForm(page);
  await form.getByLabel("Name").fill("Jane Doe");
  await form.getByLabel("Email").fill("jane@example.com");
  await form.getByLabel("Subject").fill("Project inquiry");
  await form
    .getByLabel("Message")
    .fill("I would love to discuss a frontend role with your team.");
}

test("contact form submits and shows a success state", async ({ page }) => {
  // Intercept Web3Forms so no real submission or email is ever involved.
  let requestBody = null;
  await page.route("**/api.web3forms.com/submit", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "Email sent." }),
    });
  });

  await page.goto("/contact");
  await fillContactForm(page);
  await page.getByRole("button", { name: /send message/i }).click();

  await expect(page.getByText("Your message has been received.")).toBeVisible();
  // Form is cleared after success.
  await expect(contactForm(page).getByLabel("Name")).toHaveValue("");
  // The access key and form fields were sent, never a "to"/recipient override.
  expect(requestBody).toMatchObject({
    access_key: "e2e-test-placeholder-key",
    name: "Jane Doe",
    email: "jane@example.com",
    subject: "Project inquiry",
    botcheck: "",
  });
  expect(requestBody).not.toHaveProperty("to");
});

test("contact form preserves input and offers email fallback on failure", async ({
  page,
}) => {
  await page.route("**/api.web3forms.com/submit", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: false, message: "Rejected." }),
    });
  });

  await page.goto("/contact");
  await fillContactForm(page);
  await page.getByRole("button", { name: /send message/i }).click();

  await expect(page.getByRole("alert")).toContainText(/something went wrong/i);
  // Typed message is preserved.
  await expect(contactForm(page).getByLabel("Message")).toHaveValue(
    "I would love to discuss a frontend role with your team.",
  );
  // The in-form email fallback link is offered (scoped to the form so the
  // footer / contact-list email links don't collide under strict mode).
  await expect(
    contactForm(page).getByRole("link", {
      name: /jahidhasan\.metro@gmail\.com/i,
    }),
  ).toBeVisible();
});

test("contact form blocks submission of an empty form", async ({ page }) => {
  let apiCalled = false;
  await page.route("**/api.web3forms.com/submit", async (route) => {
    apiCalled = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "ok" }),
    });
  });

  await page.goto("/contact");
  await page.getByRole("button", { name: /send message/i }).click();

  await expect(page.getByText("Enter your name.")).toBeVisible();
  expect(apiCalled).toBe(false);
});
