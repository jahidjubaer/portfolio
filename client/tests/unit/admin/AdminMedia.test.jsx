import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installFakeAdminApi, renderAdmin } from "./fake-admin-api";

const BLOB = "https://store.public.blob.vercel-storage.com";
const uploads = vi.hoisted(() => ({
  uploadImage: vi.fn(),
  uploadPdf: vi.fn(),
}));
vi.mock("../../../src/features/admin/uploads", async (importOriginal) => ({
  ...(await importOriginal()),
  ...uploads,
}));

beforeEach(() => {
  uploads.uploadImage.mockResolvedValue({
    url: `${BLOB}/photos/dusk-x1.webp`,
    width: 1600,
    height: 1067,
  });
  uploads.uploadPdf.mockResolvedValue(`${BLOB}/resume/resume-x1.pdf`);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function lastWrite(api) {
  return api.requests.filter((request) => request.method !== "GET").at(-1);
}

function fileInput(accept) {
  return document.querySelector(`input[type="file"][accept="${accept}"]`);
}

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const photoFile = () => new File(["x"], "dusk.jpg", { type: "image/jpeg" });

// Sarabo's project form is long (its architecture diagram adds dozens of
// inputs). Role and label queries over all of it are slow in jsdom, so the
// case-study tests find their landmarks by text.
async function findSectionsGroup() {
  const legend = await screen.findByText("Case study sections", {
    selector: "legend",
  });
  return legend.closest("fieldset");
}

function buttonWithText(container, text) {
  return within(container).getByText(text).closest("button");
}

/** The fields in `container` whose labels start with `text`, in order. */
function fieldsLabelled(container, text) {
  return [...container.querySelectorAll("label")]
    .filter((label) => label.textContent.startsWith(text))
    .map((label) => document.getElementById(label.htmlFor));
}

describe("admin media editors", { timeout: 20_000 }, () => {
  it("edits case-study sections as Markdown with a live preview", async () => {
    const api = installFakeAdminApi({ withProjects: true });
    const user = userEvent.setup();
    renderAdmin("/admin/projects/sarabo");

    const sections = await findSectionsGroup();
    const [overview] = fieldsLabelled(sections, "Text");
    // Pasted rather than typed: Sarabo's form is long (its diagram adds
    // dozens of inputs), and jsdom re-renders it for every keystroke.
    await user.clear(overview);
    await user.click(overview);
    await user.paste("A **repair** platform.");

    const preview = within(sections).getAllByRole("region", {
      name: "Preview",
    })[0];
    expect(within(preview).getByText("repair").tagName).toBe("STRONG");

    // The gallery section has no text to write. Found by its value: label
    // lookups across this long form are slow in jsdom.
    const galleryItem = within(sections)
      .getByDisplayValue("Gallery")
      .closest("div.grid.gap-3");
    expect(within(galleryItem).queryByLabelText(/^Text/)).toBeNull();

    await user.click(buttonWithText(document.body, "Save changes"));
    await screen.findByText("Saved.");
    const saved = lastWrite(api).body.caseStudy;
    expect(saved.sections[0]).toMatchObject({
      id: "overview",
      type: "text",
      body: "A **repair** platform.",
    });
    expect(
      saved.sections.find((section) => section.type === "gallery"),
    ).not.toHaveProperty("body");
    expect(saved.role).toBe("Sole Developer");
  });

  it("makes a section anchor from its heading", async () => {
    const api = installFakeAdminApi({ withProjects: true });
    const user = userEvent.setup();
    renderAdmin("/admin/projects/sarabo");

    const sections = await findSectionsGroup();
    await user.click(buttonWithText(sections, "Add section"));
    await user.click(fieldsLabelled(sections, "Heading").at(-1));
    await user.paste("What I'd do next");
    await user.click(fieldsLabelled(sections, "Text").at(-1));
    await user.paste("Add tests.");
    await user.click(buttonWithText(document.body, "Save changes"));

    await screen.findByText("Saved.");
    expect(lastWrite(api).body.caseStudy.sections.at(-1)).toEqual({
      id: "what-i-d-do-next",
      heading: "What I'd do next",
      type: "text",
      body: "Add tests.",
    });
  });

  it("saves a project without a case study as null", async () => {
    const api = installFakeAdminApi({ withProjects: true });
    const user = userEvent.setup();
    renderAdmin("/admin/projects/ict-crack");

    await user.click(
      await screen.findByRole("button", { name: "Save changes" }),
    );
    await screen.findByText("Saved.");
    expect(lastWrite(api).body.caseStudy).toBeNull();
  });

  it("uploads a photo and requires a description", async () => {
    const api = installFakeAdminApi();
    const user = userEvent.setup();
    const router = renderAdmin("/admin/photos/new");

    await screen.findByRole("button", { name: "Upload image" });
    await user.upload(fileInput(IMAGE_ACCEPT), photoFile());
    expect(
      await screen.findByRole("button", { name: "Replace image" }),
    ).toBeInTheDocument();
    expect(uploads.uploadImage).toHaveBeenCalledWith("photo", expect.any(File));
    expect(screen.getByText("1600 × 1067")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Album"), "Cricket");
    await user.click(screen.getByRole("button", { name: "Add photo" }));
    expect(
      await screen.findByLabelText("Description (alt text)"),
    ).toHaveAttribute("aria-invalid", "true");
    expect(lastWrite(api)).toBeUndefined();

    await user.type(
      screen.getByLabelText("Description (alt text)"),
      "Cricket ground at dusk",
    );
    await user.click(screen.getByRole("button", { name: "Add photo" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toMatch(
        /^\/admin\/photos\/photo-/,
      ),
    );
    expect(lastWrite(api)).toMatchObject({
      method: "POST",
      path: "/admin/lists/photos",
      body: {
        id: expect.stringMatching(/^photo-[a-z0-9]+$/),
        image: { url: `${BLOB}/photos/dusk-x1.webp`, width: 1600 },
        alt: "Cricket ground at dusk",
        album: "Cricket",
      },
    });
  });

  it("asks for an image before a photo can be saved", async () => {
    installFakeAdminApi();
    const user = userEvent.setup();
    renderAdmin("/admin/photos/new");

    await user.type(
      await screen.findByLabelText("Description (alt text)"),
      "A photo",
    );
    await user.type(screen.getByLabelText("Album"), "Cricket");
    await user.click(screen.getByRole("button", { name: "Add photo" }));

    expect(await screen.findByText("Upload an image.")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Upload image" }),
      ).toHaveFocus(),
    );
  });

  it("shows why an upload failed", async () => {
    uploads.uploadImage.mockRejectedValueOnce(
      new Error("Uploads aren't configured (no Blob store)."),
    );
    installFakeAdminApi();
    const user = userEvent.setup();
    renderAdmin("/admin/photos/new");

    await screen.findByRole("button", { name: "Upload image" });
    await user.upload(fileInput(IMAGE_ACCEPT), photoFile());
    expect(
      await screen.findByText("Uploads aren't configured (no Blob store)."),
    ).toBeInTheDocument();
  });

  it("writes a draft post and lists posts without manual ordering", async () => {
    const api = installFakeAdminApi();
    const user = userEvent.setup();
    const router = renderAdmin("/admin/posts/new");

    await user.type(await screen.findByLabelText("URL slug"), "hello-world");
    await user.type(screen.getByLabelText("Title"), "Hello, world");
    await user.type(screen.getByLabelText("Summary"), "First post.");
    await user.type(screen.getByLabelText("Post"), "## Why\n\nBecause.");
    expect(
      within(screen.getByRole("region", { name: "Preview" })).getByRole(
        "heading",
        { name: "Why" },
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add post" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/admin/posts/hello-world"),
    );
    expect(lastWrite(api).body).toMatchObject({
      slug: "hello-world",
      status: "draft",
      body: "## Why\n\nBecause.",
      tags: [],
    });

    await router.navigate("/admin/posts");
    await screen.findByRole("heading", { level: 1, name: "Writing" });
    const row = screen.getByText("Hello, world").closest("li");
    expect(within(row).getByText("Draft")).toBeInTheDocument();
    expect(within(row).queryByRole("button", { name: /Move/ })).toBeNull();
  });

  it("inserts an uploaded image into Markdown with its description selected", async () => {
    uploads.uploadImage.mockResolvedValueOnce({
      url: `${BLOB}/images/chart-x1.webp`,
      width: 800,
      height: 600,
    });
    installFakeAdminApi();
    const user = userEvent.setup();
    renderAdmin("/admin/posts/new");

    const body = await screen.findByLabelText("Post");
    await user.type(body, "Intro.");
    const inputs = document.querySelectorAll(
      `input[type="file"][accept="${IMAGE_ACCEPT}"]`,
    );
    // The last image picker on the page belongs to the post body.
    await user.upload(inputs[inputs.length - 1], photoFile());

    await waitFor(() =>
      expect(body).toHaveValue(
        `Intro.\n\n![Describe the image](${BLOB}/images/chart-x1.webp)\n\n`,
      ),
    );
    expect(uploads.uploadImage).toHaveBeenCalledWith("image", expect.any(File));
    await waitFor(() => expect(body).toHaveFocus());
    expect(body.value.slice(body.selectionStart, body.selectionEnd)).toBe(
      "Describe the image",
    );
  });

  it("uploads the resume PDF into the profile", async () => {
    const api = installFakeAdminApi();
    const user = userEvent.setup();
    renderAdmin("/admin/profile");

    await screen.findByRole("button", { name: "Upload PDF" });
    await user.upload(
      fileInput("application/pdf"),
      new File(["%PDF"], "resume.pdf", { type: "application/pdf" }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText(/^Resume PDF/)).toHaveValue(
        `${BLOB}/resume/resume-x1.pdf`,
      ),
    );
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText("Saved.");
    expect(lastWrite(api).body.resume.url).toBe(`${BLOB}/resume/resume-x1.pdf`);
  });
});
