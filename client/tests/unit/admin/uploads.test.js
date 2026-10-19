import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const put = vi.hoisted(() => vi.fn());
vi.mock("@vercel/blob/client", () => ({ put }));

const { prepareImage, uploadImage, uploadPdf } =
  await import("../../../src/features/admin/uploads");

const BLOB = "https://store.public.blob.vercel-storage.com";
let drawImage;
let encodedTypes;

/** Fakes the browser image pipeline jsdom doesn't have. */
function stubImagePipeline({ width, height, webp = true }) {
  const close = vi.fn();
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn(async () => ({ width, height, close })),
  );
  drawImage = vi.fn();
  encodedTypes = [];
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage,
  });
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback, type) => {
      encodedTypes.push(type);
      const actual = type === "image/webp" && !webp ? "image/png" : type;
      callback(new Blob(["img"], { type: actual }));
    },
  );
  return close;
}

function stubFetch(response) {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify(response.body), { status: response.status }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  put.mockResolvedValue({ url: `${BLOB}/photos/dusk-x1.webp` });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  put.mockReset();
});

const jpeg = () => new File(["x"], "Dusk.JPG", { type: "image/jpeg" });

describe("prepareImage", () => {
  it("scales the long edge down to 2400 px and encodes WebP", async () => {
    const close = stubImagePipeline({ width: 6000, height: 4000 });
    const result = await prepareImage(jpeg());
    expect(result.width).toBe(2400);
    expect(result.height).toBe(1600);
    expect(result.blob.type).toBe("image/webp");
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 2400, 1600);
    expect(close).toHaveBeenCalled();
  });

  it("keeps small images at their own size", async () => {
    stubImagePipeline({ width: 800, height: 1200 });
    const result = await prepareImage(jpeg());
    expect([result.width, result.height]).toEqual([800, 1200]);
  });

  it("falls back to JPEG where the browser can't encode WebP", async () => {
    stubImagePipeline({ width: 800, height: 600, webp: false });
    const result = await prepareImage(jpeg());
    expect(encodedTypes).toEqual(["image/webp", "image/jpeg"]);
    expect(result.blob.type).toBe("image/jpeg");
  });

  it("rejects files that aren't images", async () => {
    await expect(
      prepareImage(new File(["x"], "a.gif", { type: "image/gif" })),
    ).rejects.toThrow(/JPEG, PNG, WebP, or AVIF/);
  });
});

describe("uploads", () => {
  it("gets a token, then sends the image straight to Blob", async () => {
    stubImagePipeline({ width: 3000, height: 2000 });
    const fetchMock = stubFetch({
      status: 200,
      body: {
        success: true,
        data: { token: "client-token", pathname: "photos/dusk.webp" },
      },
    });

    const result = await uploadImage("photo", jpeg());

    expect(result).toEqual({
      url: `${BLOB}/photos/dusk-x1.webp`,
      width: 2400,
      height: 1600,
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/admin\/uploads$/);
    expect(JSON.parse(init.body)).toEqual({
      kind: "photo",
      filename: "Dusk.JPG",
      contentType: "image/webp",
    });
    expect(put).toHaveBeenCalledWith("photos/dusk.webp", expect.any(Blob), {
      access: "public",
      token: "client-token",
      contentType: "image/webp",
    });
  });

  it("passes on the server's reason when no token is given", async () => {
    stubImagePipeline({ width: 100, height: 100 });
    stubFetch({
      status: 503,
      body: { error: "Uploads aren't configured (no Blob store)." },
    });
    await expect(uploadImage("photo", jpeg())).rejects.toThrow(
      "Uploads aren't configured (no Blob store).",
    );
    expect(put).not.toHaveBeenCalled();
  });

  it("checks PDFs before uploading", async () => {
    await expect(
      uploadPdf(new File(["x"], "a.png", { type: "image/png" })),
    ).rejects.toThrow("Choose a PDF file.");
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.pdf", {
      type: "application/pdf",
    });
    await expect(uploadPdf(big)).rejects.toThrow(/5 MB or smaller/);
  });
});
