import { Container } from "../../components/ui/Container";
import { Reveal } from "../../features/motion/Reveal";
import { credibilityPoints } from "../../data/credibility";

export function CredibilityStrip() {
  return (
    <section
      aria-label="Credibility highlights"
      className="border-b border-(--color-border) bg-(--color-canvas-subtle) py-8"
    >
      <Container>
        <Reveal as="div">
          <ol className="flex flex-col divide-y divide-(--color-border) sm:flex-row sm:flex-wrap sm:divide-x sm:divide-y-0">
            {credibilityPoints.map((point, index) => (
              <li
                key={point.label}
                className="flex items-baseline gap-3 py-3 sm:flex-1 sm:justify-center sm:px-4 sm:py-1"
              >
                <span className="mono-meta shrink-0 text-(--color-accent-primary)">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="body-sm text-(--color-text-secondary)">
                  {point.label}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}
