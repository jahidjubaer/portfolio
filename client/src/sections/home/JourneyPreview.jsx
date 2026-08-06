import { SectionHeader } from "../../components/ui/SectionHeader";
import { Container } from "../../components/ui/Container";
import { StaggerGroup, StaggerItem } from "../../features/motion/StaggerGroup";
import { journeySteps } from "../../data/journey";

export function JourneyPreview() {
  return (
    <section className="section-spacing border-b border-(--color-border)">
      <Container>
        <SectionHeader label="Journey" heading="Where I'm heading" />

        <StaggerGroup
          as="ol"
          className="mt-12 grid gap-x-8 gap-y-8 lg:grid-cols-2"
        >
          {journeySteps.map((step, index) => (
            <StaggerItem
              key={step.title}
              as="li"
              className="flex gap-4 border-t border-(--color-border) pt-4"
            >
              <span className="mono-meta shrink-0 text-(--color-accent-primary)">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-(--color-text-primary)">
                  {step.title}
                </h3>
                <p className="body-sm mt-1 text-(--color-text-secondary)">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
