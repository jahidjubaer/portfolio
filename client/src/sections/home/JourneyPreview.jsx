import { SectionLabel } from "../../components/ui/SectionLabel";
import { Container } from "../../components/ui/Container";
import { journeySteps } from "../../data/journey";

export function JourneyPreview() {
  return (
    <section className="border-b border-(--color-border) py-20">
      <Container>
        <SectionLabel>Journey</SectionLabel>
        <h2 className="mt-3 text-2xl font-semibold text-(--color-text) sm:text-3xl">
          Where I'm heading
        </h2>

        <ol className="mt-10 space-y-6 border-l border-(--color-border) pl-6">
          {journeySteps.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="absolute top-1 -left-[1.65rem] font-mono text-xs text-(--color-accent)">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-sm font-semibold text-(--color-text)">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-(--color-text-muted)">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
