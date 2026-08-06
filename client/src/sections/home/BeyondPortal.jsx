import { ButtonLink } from "../../components/ui/ButtonLink";
import { Container } from "../../components/ui/Container";
import { Reveal } from "../../features/motion/Reveal";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { getBeyondPreviewImage } from "../../features/photography/photography-selectors";

/**
 * Lives on the SYSTEM homepage but intentionally hints at the STORY
 * palette (ember/gold, see tokens.css `:root[data-identity="story"]`)
 * using literal color values rather than the CSS custom properties,
 * since this section itself stays in SYSTEM mode — it's a preview of
 * where the accent shifts, not an actual identity switch.
 *
 * Shows a single real Beyond image only when one is actually available
 * (a curated "highlight", or otherwise the first available photograph);
 * this remains a preview, not a duplicate gallery, and never fabricates
 * an image when none exists — the abstract gradient card is the honest
 * default until real photography assets are added.
 */
export function BeyondPortal() {
  const previewImage = getBeyondPreviewImage();

  return (
    <section className="section-spacing border-b border-(--color-border) bg-(--color-surface)">
      <Container>
        <Reveal
          as="div"
          className="relative overflow-hidden rounded-(--radius-lg) border border-(--color-border) p-10 text-center sm:p-16"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgba(255,107,61,0.14), transparent 55%), radial-gradient(circle at 75% 80%, rgba(231,183,95,0.12), transparent 55%)",
          }}
        >
          {previewImage ? (
            <ImageWithFallback
              src={previewImage.src}
              fallbackSrc="/assets/placeholders/photography-placeholder.svg"
              alt="A preview of photography by Jahid Hasan"
              className="mx-auto mb-8 h-40 w-full max-w-xs rounded-(--radius-md) object-cover"
              loading="lazy"
            />
          ) : null}
          <p className="eyebrow" style={{ color: "#ff6b3d" }}>
            Beyond the Code
          </p>
          <h2 className="heading-xl mt-3 text-(--color-text-primary)">
            There is more behind the interface.
          </h2>
          <p className="body-md mx-auto mt-4 max-w-prose text-(--color-text-secondary)">
            Outside of engineering, I&apos;m involved in photography, cricket
            and sports leadership, university club organisation, and
            volunteering.
          </p>
          <div className="mt-8">
            <ButtonLink to="/beyond" variant="secondary">
              Explore Beyond the Code
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
