import { Container } from "../../components/ui/Container";
import { credibilityPoints } from "../../data/credibility";

export function CredibilityStrip() {
  return (
    <section
      aria-label="Credibility highlights"
      className="border-b border-(--color-border) py-8"
    >
      <Container>
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-center font-mono text-xs text-(--color-text-muted) sm:justify-between">
          {credibilityPoints.map((point) => (
            <li key={point.label}>{point.label}</li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
